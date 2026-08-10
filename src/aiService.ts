import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';
import * as url from 'url';

interface DsaNotesResponse {
    intuition: string;
    timeComplexity: string;
    timeExplanation: string;
    spaceComplexity: string;
    spaceExplanation: string;
    edgeCases: string;
}

/**
 * Universal query function that routes prompts based on the user's
 * configured AI Provider: 'copilot' | 'gemini' | 'ollama' | 'custom'
 */
export async function askAI(prompt: string, token?: vscode.CancellationToken): Promise<string> {
    const config = vscode.workspace.getConfiguration('dsa-helper');
    const provider = config.get<string>('aiProvider', 'copilot');

    if (provider === 'gemini') {
        const apiKey = config.get<string>('geminiApiKey', '');
        const model = config.get<string>('geminiModel', 'gemini-1.5-flash');
        if (!apiKey) {
            throw new Error('Gemini API Key is missing. Go to Settings -> DSA Note Helper to set dsa-helper.geminiApiKey');
        }
        return queryGemini(apiKey, model, prompt);
    } 
    else if (provider === 'ollama') {
        const baseUrl = config.get<string>('ollamaUrl', 'http://localhost:11434');
        const model = config.get<string>('ollamaModel', 'llama3');
        return queryOllama(baseUrl, model, prompt);
    } 
    else if (provider === 'custom') {
        const endpoint = config.get<string>('customEndpoint', 'https://api.openai.com/v1');
        const apiKey = config.get<string>('customApiKey', '');
        const model = config.get<string>('customModel', 'gpt-4o');
        return queryCustomOpenAI(endpoint, apiKey, model, prompt);
    } 
    else {
        // Default: Copilot via vscode.lm API
        return queryCopilot(prompt, token);
    }
}

/**
 * Legacy alias for backwards compatibility
 */
export async function askCopilot(prompt: string, token?: vscode.CancellationToken): Promise<string> {
    return askAI(prompt, token);
}

async function queryCopilot(prompt: string, token?: vscode.CancellationToken): Promise<string> {
    const config = vscode.workspace.getConfiguration('dsa-helper');
    const preferredFamily = config.get<string>('copilotModel', 'gpt-4o');

    let [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: preferredFamily });
    if (!model) {
        [model] = await vscode.lm.selectChatModels({ vendor: 'copilot' });
    }
    if (!model) {
        throw new Error('No GitHub Copilot model available. Please ensure GitHub Copilot is installed and signed in, OR switch "dsa-helper.aiProvider" in settings to Gemini, Ollama, or Custom API.');
    }

    const messages = [vscode.LanguageModelChatMessage.User(prompt)];
    const response = await model.sendRequest(messages, {}, token ?? new vscode.CancellationTokenSource().token);

    let fullText = '';
    for await (const fragment of response.text) {
        fullText += fragment;
    }
    return fullText;
}

function queryGemini(apiKey: string, modelName: string, prompt: string): Promise<string> {
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const body = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
    });

    return makeHttpRequest(targetUrl, 'POST', { 'Content-Type': 'application/json' }, body)
        .then(res => {
            const parsed = JSON.parse(res);
            if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts[0]) {
                return parsed.candidates[0].content.parts[0].text;
            }
            throw new Error('Invalid or empty response from Gemini API.');
        });
}

function queryOllama(baseUrl: string, model: string, prompt: string): Promise<string> {
    const targetUrl = `${baseUrl.replace(/\/$/, '')}/api/generate`;
    const body = JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false
    });

    return makeHttpRequest(targetUrl, 'POST', { 'Content-Type': 'application/json' }, body)
        .then(res => {
            const parsed = JSON.parse(res);
            return parsed.response;
        });
}

function queryCustomOpenAI(endpoint: string, apiKey: string, model: string, prompt: string): Promise<string> {
    const cleanEndpoint = endpoint.replace(/\/$/, '');
    const targetUrl = cleanEndpoint.endsWith('/chat/completions') ? cleanEndpoint : `${cleanEndpoint}/chat/completions`;
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const body = JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }]
    });

    return makeHttpRequest(targetUrl, 'POST', headers, body)
        .then(res => {
            const parsed = JSON.parse(res);
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
                return parsed.choices[0].message.content;
            }
            throw new Error('Invalid or empty response from Custom OpenAI-compatible API.');
        });
}

function makeHttpRequest(targetUrl: string, method: string, headers: Record<string, string>, body: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const parsedUrl = url.parse(targetUrl);
        const requestModule = parsedUrl.protocol === 'https:' ? https : http;

        const options: http.RequestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.path || '/',
            method: method,
            headers: headers
        };

        const req = requestModule.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                } else {
                    reject(new Error(`API Error (HTTP ${res.statusCode}): ${data}`));
                }
            });
        });

        req.on('error', err => reject(err));
        req.write(body);
        req.end();
    });
}

export async function fillMissingDetails(document: vscode.TextDocument) {
    const text = document.getText();

    const titleMatch = text.match(/^#\s+(.*)/m);
    let title = 'DSA Problem';
    if (titleMatch) {
        title = titleMatch[1].replace(/\[(.*?)\]\(.*?\)/, '$1').trim();
    }

    const javaMatch = text.match(/```java\n([\s\S]*?)\n```/);
    if (!javaMatch) {
        vscode.window.showWarningMessage('No Java code block found. Add your solution inside a ```java block first.');
        return;
    }
    const javaCode = javaMatch[1].trim();

    const prompt = `You are an expert DSA assistant.
Analyze this problem: "${title}"
Java implementation:
\`\`\`java
${javaCode}
\`\`\`

Respond with ONLY a raw JSON object (no markdown fences) matching this exact shape:
{
  "intuition": "1-2 sentence core algorithmic idea",
  "timeComplexity": "e.g. O(N log N)",
  "timeExplanation": "brief justification",
  "spaceComplexity": "e.g. O(N)",
  "spaceExplanation": "brief justification",
  "edgeCases": "markdown bullet list of 2-3 edge cases"
}`;

    const config = vscode.workspace.getConfiguration('dsa-helper');
    const provider = config.get<string>('aiProvider', 'copilot');

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Generating details via ${provider}...`,
        cancellable: false
    }, async () => {
        try {
            let raw = await askAI(prompt);

            raw = raw.trim();
            if (raw.startsWith('```')) {
                raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
            }

            const parsed: DsaNotesResponse = JSON.parse(raw);
            await applyEdits(document, parsed);
            vscode.window.showInformationMessage(`✅ Filled note details using ${provider}.`);
        } catch (e: any) {
            vscode.window.showErrorMessage(`Failed to fill details: ${e.message}`);
        }
    });
}

async function applyEdits(document: vscode.TextDocument, res: DsaNotesResponse) {
    let text = document.getText();

    text = text.replace(/(\* \*\*The Core Idea:\*\*).*?(\r?\n|$)/, `$1 ${res.intuition}$2`);
    text = text.replace('[Insert core algorithmic intuition here]', res.intuition);

    text = text.replace(/(\| \*\*Time Complexity\*\* \|).*?(\|).*?(\|)/, `$1 ${res.timeComplexity} $2 ${res.timeExplanation} $3`);
    text = text.replace(/(\| \*\*Space Complexity\*\* \|).*?(\|).*?(\|)/, `$1 ${res.spaceComplexity} $2 ${res.spaceExplanation} $3`);

    const edgeCaseSectionRegex = /## ⚠️ Edge Cases & Pitfalls to Avoid\r?\n\r?\n([\s\S]*?)$/;
    if (edgeCaseSectionRegex.test(text)) {
        text = text.replace(edgeCaseSectionRegex, `## ⚠️ Edge Cases & Pitfalls to Avoid\n\n${res.edgeCases.trim()}\n`);
    }

    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
    edit.replace(document.uri, fullRange, text);
    await vscode.workspace.applyEdit(edit);
}
