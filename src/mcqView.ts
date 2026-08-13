import * as vscode from 'vscode';
import { askCopilot } from './aiService';
import { validateActiveNoteWithAI } from './validator';

import { IntegrationServer } from './server';

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export class McqViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'algonote-quiz';
    private _view?: vscode.WebviewView;
    private _cachedNoteText: string = '';

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _server?: IntegrationServer
    ) { }

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

        const config = vscode.workspace.getConfiguration('algonote');
        const configValues = {
            aiProvider: config.get<string>('aiProvider', 'copilot'),
            geminiApiKey: config.get<string>('geminiApiKey', ''),
            geminiModel: config.get<string>('geminiModel', 'gemini-1.5-flash'),
            ollamaUrl: config.get<string>('ollamaUrl', 'http://localhost:11434'),
            ollamaModel: config.get<string>('ollamaModel', 'llama3'),
            customEndpoint: config.get<string>('customEndpoint', 'https://api.openai.com/v1'),
            customApiKey: config.get<string>('customApiKey', ''),
            customModel: config.get<string>('customModel', 'gpt-4o'),
            quizLocation: config.get<string>('quizLocation', 'editor-one'),
            quizFormat: config.get<string>('quizFormat', 'multiple-choice'),
            quizCount: config.get<number>('quizCount', 3)
        };

        webviewView.webview.html = this._getHtmlForSidebar(configValues);

        webviewView.webview.onDidReceiveMessage(async data => {
            if (data.type === 'updateSetting') {
                const config = vscode.workspace.getConfiguration('algonote');
                await config.update(data.key, data.value, vscode.ConfigurationTarget.Global);
            } else if (data.type === 'launchQuiz') {
                // Get the updated location and other configurations
                const currentConfig = vscode.workspace.getConfiguration('algonote');
                const location = currentConfig.get<string>('quizLocation', 'editor-one');

                if (location === 'editor-one') {
                    await vscode.commands.executeCommand('algonote.openQuizPanel', vscode.ViewColumn.One);
                } else if (location === 'editor-two') {
                    await vscode.commands.executeCommand('algonote.openQuizPanel', vscode.ViewColumn.Two);
                } else if (location === 'browser') {
                    await this.launchInBrowser();
                }
            }
        });
    }

    private async _prepareAndValidateNote(): Promise<boolean> {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || activeEditor.document.languageId !== 'markdown') {
            vscode.window.showWarningMessage('Please open a DSA Markdown note file first.');
            return false;
        }

        if (activeEditor.document.isDirty) {
            await activeEditor.document.save();
        }

        // Run the AI-based preflight note validation check
        const validation = await validateActiveNoteWithAI(activeEditor.document);
        if (!validation.isValid) {
            vscode.window.showWarningMessage(`Validation Failed: ${validation.message}`);
            return false;
        }

        this._cachedNoteText = activeEditor.document.getText();
        return true;
    }

    public _getPromptForFormat(format: string, count: number): string {
        const base = `You are a DSA examiner. Based on this note:\n---\n${this._cachedNoteText.slice(0, 3000)}\n---\n`;
        
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
        return base + specificPrompt + jsonFormat;
    }

    public async generateQuiz(format?: string, count?: number) {
        if (!(await this._prepareAndValidateNote())) return;

        const config = vscode.workspace.getConfiguration('algonote');
        const finalFormat = format || config.get<string>('quizFormat', 'multiple-choice');
        const finalCount = count || config.get<number>('quizCount', 3);
        const prompt = this._getPromptForFormat(finalFormat, finalCount);

        try {
            if (this._view) {
                this._view.webview.postMessage({ type: 'loading' });
            }

            let raw = await askCopilot(prompt);
            raw = raw.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
            const questions: QuizQuestion[] = JSON.parse(raw);
            
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview(questions, finalFormat, finalCount);
            }
        } catch (e: any) {
            vscode.window.showErrorMessage('Failed to generate quiz: ' + e.message);
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview([], finalFormat, finalCount);
            }
        }
    }

    public async openFullPanel(column: vscode.ViewColumn = vscode.ViewColumn.One) {
        if (!(await this._prepareAndValidateNote())) return;

        const panel = vscode.window.createWebviewPanel(
            'dsaQuizPanel',
            '🧪 DSA Active Recall Quiz',
            column,
            { enableScripts: true }
        );

        const config = vscode.workspace.getConfiguration('algonote');
        let currentFormat = config.get<string>('quizFormat', 'multiple-choice');
        let currentCount = config.get<number>('quizCount', 3);

        panel.webview.html = this._getHtmlForWebview([], currentFormat, currentCount);

        panel.webview.onDidReceiveMessage(async data => {
            if (data.type === 'generateQuiz') {
                currentFormat = data.format;
                currentCount = data.count;
                const prompt = this._getPromptForFormat(currentFormat, currentCount);
                try {
                    panel.webview.postMessage({ type: 'loading' });
                    let raw = await askCopilot(prompt);
                    raw = raw.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
                    const questions: QuizQuestion[] = JSON.parse(raw);
                    panel.webview.html = this._getHtmlForWebview(questions, currentFormat, currentCount);
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

    public async launchInBrowser() {
        if (!(await this._prepareAndValidateNote())) return;

        const config = vscode.workspace.getConfiguration('algonote');
        const format = config.get<string>('quizFormat', 'multiple-choice');
        const count = config.get<number>('quizCount', 3);
        const prompt = this._getPromptForFormat(format, count);

        try {
            let raw = await askCopilot(prompt);
            raw = raw.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
            const questions: QuizQuestion[] = JSON.parse(raw);
            const html = this._getHtmlForWebview(questions, format, count);

            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showWarningMessage('Please open a workspace first.');
                return;
            }

            const tempFileUri = vscode.Uri.joinPath(workspaceFolders[0].uri, '.algonote-quiz-temp.html');
            const encoder = new TextEncoder();
            await vscode.workspace.fs.writeFile(tempFileUri, encoder.encode(html));

            const port = this._server ? this._server.port : 0;
            const playgroundUrl = vscode.Uri.parse(`http://127.0.0.1:${port}/playground/index.html#port=${port}&note=${Buffer.from(this._cachedNoteText, 'utf8').toString('base64')}`);
            await vscode.env.openExternal(playgroundUrl);

            vscode.window.showInformationMessage('✅ Launched quiz in default web browser.');
        } catch (e: any) {
            vscode.window.showErrorMessage('Failed to generate quiz for browser: ' + e.message);
        }
    }

    private _renderMarkdown(text: string): string {
        if (!text) return '';
        let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html = html.replace(/```[^\n]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/\*\*([^\*]+)\*\*/g, '<b>$1</b>');
        return html;
    }

    private _getHtmlForSidebar(cfg: any) {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AlgoNote Settings</title>
                <style>
                    body { font-family: var(--vscode-font-family); padding: 12px; color: var(--vscode-editor-foreground); background: var(--vscode-sideBar-background); }
                    .header { font-weight: bold; font-size: 1.1em; margin-bottom: 12px; color: var(--vscode-sideBarTitle-foreground); border-bottom: 1px solid var(--vscode-widget-border); padding-bottom: 5px; }
                    .section-title { font-size: 0.9em; font-weight: bold; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; color: var(--vscode-descriptionForeground); }
                    .group { margin-bottom: 10px; }
                    label { display: block; font-size: 0.85em; margin-bottom: 3px; font-weight: 500; }
                    select, input {
                        width: 100%;
                        padding: 5px 8px;
                        background: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                        border-radius: 4px;
                        box-sizing: border-box;
                        font-family: inherit;
                        font-size: 0.85em;
                    }
                    select:focus, input:focus {
                        outline: 1px solid var(--vscode-focusBorder);
                    }
                    .btn-launch {
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        padding: 8px 16px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                        width: 100%;
                        margin-top: 15px;
                        box-sizing: border-box;
                        font-size: 0.9em;
                    }
                    .btn-launch:hover { background: var(--vscode-button-hoverBackground); }
                </style>
            </head>
            <body>
                <div class="header">🧠 AlgoNote Dashboard</div>

                <div class="section-title">AI Engine Settings</div>
                
                <div class="group">
                    <label for="aiProvider">Provider</label>
                    <select id="aiProvider" onchange="saveSetting('aiProvider', this.value); toggleFields();">
                        <option value="copilot" ${cfg.aiProvider === 'copilot' ? 'selected' : ''}>GitHub Copilot</option>
                        <option value="gemini" ${cfg.aiProvider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
                        <option value="ollama" ${cfg.aiProvider === 'ollama' ? 'selected' : ''}>Local Ollama</option>
                        <option value="custom" ${cfg.aiProvider === 'custom' ? 'selected' : ''}>Custom API</option>
                    </select>
                </div>

                <!-- Gemini Fields -->
                <div id="gemini-fields" style="display: none;">
                    <div class="group">
                        <label for="geminiApiKey">Gemini API Key</label>
                        <input type="password" id="geminiApiKey" value="${cfg.geminiApiKey}" onchange="saveSetting('geminiApiKey', this.value)" placeholder="AIzaSy...">
                    </div>
                    <div class="group">
                        <label for="geminiModel">Gemini Model</label>
                        <input type="text" id="geminiModel" value="${cfg.geminiModel}" onchange="saveSetting('geminiModel', this.value)">
                    </div>
                </div>

                <!-- Ollama Fields -->
                <div id="ollama-fields" style="display: none;">
                    <div class="group">
                        <label for="ollamaUrl">Ollama Server URL</label>
                        <input type="text" id="ollamaUrl" value="${cfg.ollamaUrl}" onchange="saveSetting('ollamaUrl', this.value)">
                    </div>
                    <div class="group">
                        <label for="ollamaModel">Ollama Model</label>
                        <input type="text" id="ollamaModel" value="${cfg.ollamaModel}" onchange="saveSetting('ollamaModel', this.value)">
                    </div>
                </div>

                <!-- Custom Fields -->
                <div id="custom-fields" style="display: none;">
                    <div class="group">
                        <label for="customEndpoint">Endpoint URL</label>
                        <input type="text" id="customEndpoint" value="${cfg.customEndpoint}" onchange="saveSetting('customEndpoint', this.value)">
                    </div>
                    <div class="group">
                        <label for="customApiKey">API Key</label>
                        <input type="password" id="customApiKey" value="${cfg.customApiKey}" onchange="saveSetting('customApiKey', this.value)">
                    </div>
                    <div class="group">
                        <label for="customModel">Model Name</label>
                        <input type="text" id="customModel" value="${cfg.customModel}" onchange="saveSetting('customModel', this.value)">
                    </div>
                </div>

                <div class="section-title">Quiz Settings</div>

                <div class="group">
                    <label for="quizFormat">Quiz Type</label>
                    <select id="quizFormat" onchange="saveSetting('quizFormat', this.value)">
                        <option value="multiple-choice" ${cfg.quizFormat === 'multiple-choice' ? 'selected' : ''}>Standard MCQ</option>
                        <option value="code-fill" ${cfg.quizFormat === 'code-fill' ? 'selected' : ''}>Code Fill</option>
                        <option value="explain-concept" ${cfg.quizFormat === 'explain-concept' ? 'selected' : ''}>Explain Concept</option>
                    </select>
                </div>

                <div class="group">
                    <label for="quizCount">Question Count</label>
                    <select id="quizCount" onchange="saveSetting('quizCount', parseInt(this.value, 10))">
                        <option value="1" ${cfg.quizCount === 1 ? 'selected' : ''}>1</option>
                        <option value="3" ${cfg.quizCount === 3 ? 'selected' : ''}>3</option>
                        <option value="5" ${cfg.quizCount === 5 ? 'selected' : ''}>5</option>
                        <option value="10" ${cfg.quizCount === 10 ? 'selected' : ''}>10</option>
                    </select>
                </div>

                <div class="group">
                    <label for="quizLocation">Launch Destination</label>
                    <select id="quizLocation" onchange="saveSetting('quizLocation', this.value)">
                        <option value="editor-one" ${cfg.quizLocation === 'editor-one' ? 'selected' : ''}>Editor Panel 1</option>
                        <option value="editor-two" ${cfg.quizLocation === 'editor-two' ? 'selected' : ''}>Editor Panel 2</option>
                        <option value="browser" ${cfg.quizLocation === 'browser' ? 'selected' : ''}>Default Web Browser</option>
                    </select>
                </div>

                <button class="btn-launch" onclick="launchQuiz()">⚡ Launch Quiz</button>

                <script>
                    const vscode = acquireVsCodeApi();

                    function toggleFields() {
                        const provider = document.getElementById('aiProvider').value;
                        document.getElementById('gemini-fields').style.display = provider === 'gemini' ? 'block' : 'none';
                        document.getElementById('ollama-fields').style.display = provider === 'ollama' ? 'block' : 'none';
                        document.getElementById('custom-fields').style.display = provider === 'custom' ? 'block' : 'none';
                    }

                    function saveSetting(key, value) {
                        vscode.postMessage({ type: 'updateSetting', key: key, value: value });
                    }

                    function launchQuiz() {
                        vscode.postMessage({ type: 'launchQuiz' });
                    }

                    // Initial toggle setup
                    toggleFields();
                </script>
            </body>
            </html>`;
    }

    private _getHtmlForWebview(questions: QuizQuestion[], currentFormat: string, currentCount: number) {
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
                    .question { font-weight: bold; margin-bottom: 10px; font-size: 1.05em; white-space: pre-wrap; }
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
                    .btn-icon {
                        background: transparent;
                        border: 1px solid var(--vscode-widget-border);
                        color: var(--vscode-editor-foreground);
                        border-radius: 4px;
                        padding: 6px 10px;
                        cursor: pointer;
                        font-size: 1.1em;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .btn-icon:hover { background: var(--vscode-button-secondaryHoverBackground); }
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
                    .option:disabled { cursor: not-allowed; opacity: 0.8; }
                    .correct { background: #28a745 !important; color: white !important; font-weight: bold; }
                    .incorrect { background: #dc3545 !important; color: white !important; }
                    .feedback { margin-top: 8px; font-style: italic; display: none; font-size: 0.9em; padding: 8px; border-left: 3px solid #28a745; background: var(--vscode-editor-inactiveSelectionBackground); }
                    .controls { display: flex; gap: 8px; margin-bottom: 15px; align-items: center; }
                    
                    .settings-drawer {
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.25s ease-out, padding 0.25s ease-out;
                        background: var(--vscode-editor-inactiveSelectionBackground);
                        border-radius: 4px;
                        margin-bottom: 15px;
                        padding: 0 10px;
                    }
                    .settings-drawer.active {
                        max-height: 120px;
                        padding: 10px;
                        border: 1px solid var(--vscode-widget-border);
                    }
                    .setting-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    }
                    .setting-row:last-child {
                        margin-bottom: 0;
                    }
                    .setting-row label {
                        font-size: 0.9em;
                        font-weight: bold;
                    }
                    select { 
                        padding: 4px 8px; 
                        background: var(--vscode-dropdown-background); 
                        color: var(--vscode-dropdown-foreground); 
                        border: 1px solid var(--vscode-dropdown-border); 
                        border-radius: 4px; 
                    }
                    
                    .stats { display: ${hasQuestions ? 'flex' : 'none'}; justify-content: space-between; font-weight: bold; margin-bottom: 15px; background: var(--vscode-editor-background); padding: 10px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); }
                    pre { background: var(--vscode-textCodeBlock-background); padding: 10px; border-radius: 4px; overflow-x: auto; border: 1px solid var(--vscode-widget-border); margin: 8px 0; }
                    code { background: var(--vscode-textCodeBlock-background); padding: 2px 4px; border-radius: 3px; font-family: var(--vscode-editor-font-family); font-size: 0.9em; }
                    pre code { padding: 0; border: none; background: transparent; }
                    .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite; margin-right: 8px; vertical-align: middle; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                </style>
            </head>
            <body>
                <div class="controls">
                    <button id="generate-btn" class="btn-gen" style="margin-bottom: 0;" onclick="generate()">⚡ Generate</button>
                    <button class="btn-icon" onclick="toggleSettings()" title="Quiz Settings">⚙️</button>
                </div>

                <div class="settings-drawer" id="settings-drawer">
                    <div class="setting-row">
                        <label for="format-select">Format:</label>
                        <select id="format-select">
                            <option value="multiple-choice" ${currentFormat === 'multiple-choice' ? 'selected' : ''}>Standard MCQ</option>
                            <option value="code-fill" ${currentFormat === 'code-fill' || currentFormat === 'code-completion' ? 'selected' : ''}>Code Fill</option>
                            <option value="explain-concept" ${currentFormat === 'explain-concept' || currentFormat === 'active-recall' ? 'selected' : ''}>Explain Concept</option>
                        </select>
                    </div>
                    <div class="setting-row">
                        <label for="count-select">Questions:</label>
                        <select id="count-select">
                            <option value="1" ${currentCount === 1 ? 'selected' : ''}>1</option>
                            <option value="3" ${currentCount === 3 || !currentCount ? 'selected' : ''}>3</option>
                            <option value="5" ${currentCount === 5 ? 'selected' : ''}>5</option>
                            <option value="10" ${currentCount === 10 ? 'selected' : ''}>10</option>
                        </select>
                    </div>
                </div>
                
                <div class="stats">
                    <span id="score-display">Score: 0 / ${questions.length}</span>
                    <span id="timer-display">Time: 00:00</span>
                </div>

                <div id="quiz-container">
                    ${hasQuestions ? questions.map((q, qIdx) => `
                        <div class="card">
                            <div class="question">Q${qIdx + 1}: ${this._renderMarkdown(q.question)}</div>
                            ${q.options.map((opt, optIdx) => `
                                <button class="option" onclick="checkAnswer(this, ${qIdx}, ${optIdx}, ${q.correctIndex}, '${this._renderMarkdown(q.explanation).replace(/'/g, "\\'").replace(/\n/g, ' ')}')">${String.fromCharCode(65 + optIdx)}) ${this._renderMarkdown(opt)}</button>
                            `).join('')}
                            <div class="feedback" id="fb-${qIdx}"></div>
                        </div>
                    `).join('') : `
                        <p style="text-align: center; color: var(--vscode-descriptionForeground);">
                            Generating your personalized active recall quiz...
                        </p>
                    `}
                </div>

                <script>
                    const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;
                    let score = 0;
                    let answered = 0;
                    const total = ${questions.length};
                    let timerInterval;
                    let seconds = 0;

                    if (${hasQuestions}) {
                        startTimer();
                    }

                    window.onload = () => {
                        if (!${hasQuestions}) {
                            generate();
                        }
                    }

                    function toggleSettings() {
                        const drawer = document.getElementById('settings-drawer');
                        drawer.classList.toggle('active');
                    }

                    function startTimer() {
                        timerInterval = setInterval(() => {
                            seconds++;
                            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
                            const s = (seconds % 60).toString().padStart(2, '0');
                            document.getElementById('timer-display').innerText = \`Time: \${m}:\${s}\`;
                        }, 1000);
                    }

                    function generate() {
                        const format = document.getElementById('format-select').value;
                        const count = parseInt(document.getElementById('count-select').value, 10);
                        
                        if (vscode) {
                            const btn = document.getElementById('generate-btn');
                            btn.disabled = true;
                            btn.innerHTML = '<span class="spinner"></span> Generating...';
                            
                            document.getElementById('quiz-container').innerHTML = '';
                            document.querySelector('.stats').style.display = 'none';
                            vscode.postMessage({ type: 'generateQuiz', format, count });
                        } else {
                            alert('To generate a new quiz, start the quiz command inside VS Code.');
                        }
                    }

                    function checkAnswer(btn, qIdx, optIdx, correctIdx, explanation) {
                        const card = btn.parentElement;
                        if (card.dataset.answered === 'true') return;
                        card.dataset.answered = 'true';
                        
                        const options = card.querySelectorAll('.option');
                        options.forEach(o => o.disabled = true);

                        const isCorrect = (optIdx === correctIdx);
                        if (isCorrect) {
                            btn.classList.add('correct');
                            score++;
                        } else {
                            btn.classList.add('incorrect');
                            options[correctIdx].classList.add('correct');
                        }

                        answered++;
                        document.getElementById('score-display').innerText = \`Score: \${score} / \${total}\`;
                        
                        if (answered === total) {
                            clearInterval(timerInterval);
                        }

                        const fb = document.getElementById('fb-' + qIdx);
                        fb.style.display = 'block';
                        fb.innerHTML = (isCorrect ? '✅ <b>Correct!</b><br/>' : '❌ <b>Incorrect.</b><br/>') + explanation;

                        if (vscode) {
                            vscode.postMessage({ type: 'answerSelected', isCorrect, explanation });
                        }
                    }
                </script>
            </body>
            </html>`;
    }
}
