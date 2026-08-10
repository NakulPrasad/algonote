import * as vscode from 'vscode';
import { askCopilot } from './aiService';

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export class McqViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'dsa-helper-quiz';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview([]);

        webviewView.webview.onDidReceiveMessage(async data => {
            if (data.type === 'generateQuiz') {
                await this.generateQuiz();
            } else if (data.type === 'answerSelected') {
                if (data.isCorrect) {
                    vscode.window.showInformationMessage('🎉 Correct! ' + data.explanation);
                } else {
                    vscode.window.showErrorMessage('❌ Incorrect. ' + data.explanation);
                }
            }
        });
    }

    public async generateQuiz() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('Please open a DSA Markdown note file first.');
            return;
        }

        const noteText = activeEditor.document.getText();
        const prompt = `You are a DSA examiner. Based on this note:
---
${noteText.slice(0, 3000)}
---

Generate exactly 3 multiple-choice questions testing retention, edge cases, and time/space complexity.
Output ONLY a raw JSON array matching this TS interface (no markdown formatting or extra text):
interface QuizQuestion {
    id: number;
    question: string;
    options: string[]; // 4 choices (A, B, C, D)
    correctIndex: number; // 0, 1, 2, or 3
    explanation: string;
}`;

        try {
            if (this._view) {
                this._view.webview.postMessage({ type: 'loading' });
            }

            let raw = await askCopilot(prompt);
            raw = raw.trim();
            if (raw.startsWith('```')) {
                raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
            }

            const questions: QuizQuestion[] = JSON.parse(raw);
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview(questions);
            }
        } catch (e: any) {
            vscode.window.showErrorMessage('Failed to generate quiz: ' + e.message);
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview([]);
            }
        }
    }

    public openFullPanel() {
        const panel = vscode.window.createWebviewPanel(
            'dsaQuizPanel',
            '🧪 DSA Active Recall Quiz',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = this._getHtmlForWebview([]);

        panel.webview.onDidReceiveMessage(async data => {
            if (data.type === 'generateQuiz') {
                const activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor) {
                    vscode.window.showWarningMessage('Please open a DSA note file first.');
                    return;
                }
                const noteText = activeEditor.document.getText();
                const prompt = `Generate 3 multiple choice questions for this DSA note in JSON array format: ${noteText.slice(0, 3000)}`;
                try {
                    panel.webview.postMessage({ type: 'loading' });
                    let raw = await askCopilot(prompt);
                    raw = raw.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
                    const questions: QuizQuestion[] = JSON.parse(raw);
                    panel.webview.html = this._getHtmlForWebview(questions);
                } catch (e: any) {
                    vscode.window.showErrorMessage('Failed: ' + e.message);
                }
            } else if (data.type === 'answerSelected') {
                if (data.isCorrect) {
                    vscode.window.showInformationMessage('🎉 Correct! ' + data.explanation);
                } else {
                    vscode.window.showErrorMessage('❌ Incorrect. ' + data.explanation);
                }
            }
        });
    }

    private _getHtmlForWebview(questions: QuizQuestion[]) {
        const hasQuestions = questions && questions.length > 0;
        
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DSA Quiz</title>
                <style>
                    body { font-family: var(--vscode-font-family); padding: 15px; color: var(--vscode-editor-foreground); }
                    .card { background: var(--vscode-editor-background); border: 1px solid var(--vscode-widget-border); padding: 12px; margin-bottom: 16px; border-radius: 6px; }
                    .question { font-weight: bold; margin-bottom: 10px; font-size: 1.05em; }
                    .btn-gen {
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        padding: 8px 16px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                        width: 100%;
                        margin-bottom: 15px;
                    }
                    .btn-gen:hover { background: var(--vscode-button-hoverBackground); }
                    .option { 
                        display: block; 
                        width: 100%; 
                        text-align: left; 
                        padding: 8px 12px; 
                        margin-bottom: 6px; 
                        background: var(--vscode-button-secondaryBackground); 
                        color: var(--vscode-button-secondaryForeground); 
                        border: 1px solid transparent; 
                        cursor: pointer; 
                        border-radius: 4px;
                    }
                    .option:hover { background: var(--vscode-button-secondaryHoverBackground); }
                    .correct { background: #28a745 !important; color: white !important; font-weight: bold; }
                    .incorrect { background: #dc3545 !important; color: white !important; }
                    .feedback { margin-top: 8px; font-style: italic; display: none; font-size: 0.9em; }
                </style>
            </head>
            <body>
                <button class="btn-gen" onclick="generate()">⚡ Generate AI Quiz for Active Note</button>

                <div id="quiz-container">
                    ${hasQuestions ? questions.map((q, qIdx) => `
                        <div class="card">
                            <div class="question">Q${qIdx + 1}: ${q.question}</div>
                            ${q.options.map((opt, optIdx) => `
                                <button class="option" onclick="checkAnswer(this, ${qIdx}, ${optIdx}, ${q.correctIndex}, '${q.explanation.replace(/'/g, "\\'")}')">${String.fromCharCode(65 + optIdx)}) ${opt}</button>
                            `).join('')}
                            <div class="feedback" id="fb-${qIdx}"></div>
                        </div>
                    `).join('') : `
                        <p style="text-align: center; color: var(--vscode-descriptionForeground);">
                            Open a DSA note and click the button above to generate a practice quiz powered by Copilot!
                        </p>
                    `}
                </div>

                <script>
                    const vscode = acquireVsCodeApi();

                    function generate() {
                        document.getElementById('quiz-container').innerHTML = '<p style="text-align:center;">⏳ Asking Copilot to generate questions...</p>';
                        vscode.postMessage({ type: 'generateQuiz' });
                    }

                    function checkAnswer(btn, qIdx, optIdx, correctIdx, explanation) {
                        const card = btn.parentElement;
                        const options = card.querySelectorAll('.option');
                        options.forEach(o => o.disabled = true);

                        const isCorrect = (optIdx === correctIdx);
                        if (isCorrect) {
                            btn.classList.add('correct');
                        } else {
                            btn.classList.add('incorrect');
                            options[correctIdx].classList.add('correct');
                        }

                        const fb = document.getElementById('fb-' + qIdx);
                        fb.style.display = 'block';
                        fb.innerHTML = (isCorrect ? '✅ Correct! ' : '❌ Incorrect. ') + explanation;

                        vscode.postMessage({ type: 'answerSelected', isCorrect, explanation });
                    }
                </script>
            </body>
            </html>`;
    }
}

