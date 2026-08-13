import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { askCopilot } from './aiService';

export class IntegrationServer {
    private _server: http.Server | null = null;
    private _port: number = 0;
    private _extensionPath: string = '';

    constructor(extensionPath?: string) {
        this._extensionPath = extensionPath || '';
    }

    public start(): Promise<number> {
        return new Promise((resolve, reject) => {
            this._server = http.createServer((req, res) => {
                // Configure CORS headers
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                // Handle preflight options requests
                if (req.method === 'OPTIONS') {
                    res.writeHead(200);
                    res.end();
                    return;
                }

                if (req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });

                    req.on('end', async () => {
                        try {
                            const payload = JSON.parse(body);

                            if (req.url === '/api/generate') {
                                await this.handleGenerate(payload, res);
                            } else if (req.url === '/api/interview') {
                                await this.handleInterview(payload, res);
                            } else {
                                res.writeHead(404, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: 'Endpoint not found' }));
                            }
                        } catch (err: any) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: `Internal Server Error: ${err.message}` }));
                        }
                    });
                } else if (req.method === 'GET') {
                    let reqUrl = req.url || '';
                    const parsedUrl = reqUrl.split('?')[0].split('#')[0];
                    let relativeFilePath = parsedUrl;
                    
                    if (relativeFilePath === '/' || relativeFilePath === '/playground' || relativeFilePath === '/playground/') {
                        relativeFilePath = '/playground/index.html';
                    }

                    if (relativeFilePath.startsWith('/playground/')) {
                        const targetFilePath = path.join(this._extensionPath, relativeFilePath);
                        if (targetFilePath.startsWith(path.join(this._extensionPath, 'playground'))) {
                            fs.stat(targetFilePath, (err, stats) => {
                                if (err || !stats.isFile()) {
                                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                                    res.end('File Not Found');
                                    return;
                                }

                                let contentType = 'text/html';
                                const ext = path.extname(targetFilePath).toLowerCase();
                                if (ext === '.js') {
                                    contentType = 'application/javascript';
                                } else if (ext === '.css') {
                                    contentType = 'text/css';
                                } else if (ext === '.json') {
                                    contentType = 'application/json';
                                } else if (ext === '.png') {
                                    contentType = 'image/png';
                                } else if (ext === '.jpg' || ext === '.jpeg') {
                                    contentType = 'image/jpeg';
                                } else if (ext === '.svg') {
                                    contentType = 'image/svg+xml';
                                }

                                res.writeHead(200, { 'Content-Type': contentType });
                                const stream = fs.createReadStream(targetFilePath);
                                stream.pipe(res);
                            });
                            return;
                        }
                    }
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                } else {
                    res.writeHead(405, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
                }
            });

            // Start server on an ephemeral random port
            this._server.listen(0, '127.0.0.1', () => {
                const address = this._server?.address();
                if (address && typeof address === 'object') {
                    this._port = address.port;
                    console.log(`AlgoNote local server started on port ${this._port}`);
                    resolve(this._port);
                } else {
                    reject(new Error('Failed to retrieve server port'));
                }
            });

            this._server.on('error', (err) => {
                console.error('AlgoNote integration server error:', err);
                reject(err);
            });
        });
    }

    public stop() {
        if (this._server) {
            this._server.close();
            this._server = null;
            console.log('AlgoNote local server stopped');
        }
    }

    public get port(): number {
        return this._port;
    }

    private async handleGenerate(payload: any, res: http.ServerResponse) {
        const { noteText, format, count } = payload;
        if (!noteText) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing noteText in payload' }));
            return;
        }

        const base = `You are a DSA examiner. Based on this note:\n---\n${noteText.slice(0, 3000)}\n---\n`;
        let specificPrompt = '';
        if (format === 'code-fill' || format === 'code-completion') {
            specificPrompt = `Generate exactly ${count} fill-in-the-blank / code completion multiple-choice questions. Pick 1-2 important lines from the user's code, blank them out, and ask them to identify the correct missing lines.`;
        } else if (format === 'explain-concept' || format === 'active-recall') {
            specificPrompt = `Generate exactly ${count} conceptual "explain concept in words" multiple-choice questions. Each question should test the user's understanding of the algorithm's concept, design, why a certain data structure is used, or details about the technique in plain English.`;
        } else {
            specificPrompt = `Generate exactly ${count} standard multiple-choice questions testing retention, edge cases, and time/space complexity.`;
        }

        const jsonFormat = `\nOutput ONLY a raw JSON array matching this TS interface (no markdown formatting or extra text):
interface QuizQuestion {
    id: number;
    question: string;
    options: string[]; // 4 choices (A, B, C, D)
    correctIndex: number; // 0, 1, 2, or 3
    explanation: string;
}`;
        
        const prompt = base + specificPrompt + jsonFormat;

        try {
            let raw = await askCopilot(prompt);
            raw = raw.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
            const questions = JSON.parse(raw);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ questions }));
        } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Failed to generate questions: ${e.message}` }));
        }
    }

    private async handleInterview(payload: any, res: http.ServerResponse) {
        const { noteText, history } = payload;
        if (!noteText || !history || !Array.isArray(history)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing noteText or history in payload' }));
            return;
        }

        const systemPrompt = `You are a professional technical software engineering interviewer. You are conducting a mock coding interview for a candidate who has written this DSA study note:\n---\n${noteText.slice(0, 3000)}\n---\n
Conduct the interview professionally. Ask follow-up questions one by one. Challenge their complexities, check edge cases (like empty arrays, null pointers, duplicates, bounds), and ask about optimization trade-offs. Keep responses conversational, short and clear (max 3 sentences per reply).

Conversation History:
${history.map((h: any) => `${h.role === 'model' ? 'Interviewer' : 'Candidate'}: ${h.text}`).join('\n')}

Interviewer (continue the conversation):`;

        try {
            const reply = await askCopilot(systemPrompt);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ reply }));
        } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Failed to fetch response: ${e.message}` }));
        }
    }
}
