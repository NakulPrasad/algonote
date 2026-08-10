import * as vscode from 'vscode';
import { enforceTemplate } from './formatter';
import { updateDiagnostics } from './linter';
import { fillMissingDetails } from './aiService';
import { DsaCodeActionProvider } from './codeActions';
import { registerChatParticipant } from './chatParticipant';
import { McqViewProvider } from './mcqView';
import { DsaCompletionProvider } from './completionProvider';
import { RevisionTreeProvider } from './revisionTree';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('DSA Note Helper is active!');

    // 1. Register Format/Enforce Template Command
    let enforceCmd = vscode.commands.registerCommand('dsa-helper.enforceTemplate', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'markdown') {
            try {
                await enforceTemplate(editor.document);
                vscode.window.showInformationMessage('Enforced template on current DSA note.');
            } catch (e: any) {
                vscode.window.showErrorMessage(`Failed to enforce template: ${e.message}`);
            }
        } else {
            vscode.window.showWarningMessage('Please open a Markdown (.md) note file.');
        }
    });

    // 2. Register AI Fill Details Command
    let fillCmd = vscode.commands.registerCommand('dsa-helper.fillDetails', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'markdown') {
            try {
                await fillMissingDetails(editor.document);
            } catch (e: any) {
                vscode.window.showErrorMessage(`AI Service Error: ${e.message}`);
            }
        } else {
            vscode.window.showWarningMessage('Please open a Markdown (.md) note file.');
        }
    });

    // 3. Register MCQ View Command
    const mcqProvider = new McqViewProvider(context.extensionUri);
    let startQuizCmd = vscode.commands.registerCommand('dsa-helper.startQuiz', async () => {
        await vscode.commands.executeCommand('dsa-helper-quiz.focus');
        await mcqProvider.generateQuiz();
    });

    let openQuizPanelCmd = vscode.commands.registerCommand('dsa-helper.openQuizPanel', () => {
        mcqProvider.openFullPanel();
    });

    // 4. Register Linter / Diagnostics Collection
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('dsa-note-helper');
    
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'markdown') {
        updateDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
    }
    
    let changeListener = vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document.languageId === 'markdown') {
            updateDiagnostics(e.document, diagnosticCollection);
        }
    });
    
    let editorChangeListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document.languageId === 'markdown') {
            updateDiagnostics(editor.document, diagnosticCollection);
        }
    });

    // 5. Register Code Actions (Quick Fixes)
    let codeActionProvider = vscode.languages.registerCodeActionsProvider(
        'markdown',
        new DsaCodeActionProvider(),
        { providedCodeActionKinds: DsaCodeActionProvider.providedCodeActionKinds }
    );

    // 6. Register Chat Participant
    registerChatParticipant(context);

    // 7. Register MCQ Webview View
    let webviewRegistration = vscode.window.registerWebviewViewProvider(
        McqViewProvider.viewType,
        mcqProvider
    );

    // 8. Register Inline Completion
    let completionProvider = vscode.languages.registerInlineCompletionItemProvider(
        [{ language: 'markdown' }, { language: 'java' }],
        new DsaCompletionProvider()
    );

    // 9. Register Revision Tree View
    const revisionTreeProvider = new RevisionTreeProvider();
    let treeViewRegistration = vscode.window.registerTreeDataProvider(
        'dsa-helper-revision',
        revisionTreeProvider
    );

    let refreshTreeCmd = vscode.commands.registerCommand('dsa-helper.showRevisionTree', () => {
        revisionTreeProvider.refresh();
    });

    // 10. Auto-Template on File Create
    let createListener = vscode.workspace.onDidCreateFiles(async (event) => {
        for (const fileUri of event.files) {
            if (fileUri.path.endsWith('.md')) {
                const basename = path.basename(fileUri.fsPath);
                let title = basename.replace(/^[EMHB]\.\s+/, "").replace(/\.md$/, "");
                title = title.replace(/([A-Z])/g, ' $1').trim();
                
                let difficulty = "Easy";
                if (basename.startsWith("M. ")) difficulty = "Medium";
                else if (basename.startsWith("H. ")) difficulty = "Hard";
                else if (basename.startsWith("B. ")) difficulty = "Basic";

                const template = `# ${title}\n\n> **Difficulty:** ${difficulty}  \n> **Topic / Pattern:** [Topic]  \n> **Link:** [Platform](URL)\n\n---\n\n## 📝 Problem Statement\n\n[Insert problem description here]\n\n### Examples\n\`\`\`text\nInput: \nOutput: \n\`\`\`\n\n---\n\n## 💡 Intuition & Core Approach\n\n* **The Core Idea:** [Insert core algorithmic intuition here]\n* **Key Steps:**\n  - [Step 1]\n  - [Step 2]\n\n---\n\n## 🎨 Visualization / Dry Run\n\n[If applicable, embed visual diagram/illustration here]\n![visualization](images/image-name.png)\n\n---\n\n## 💻 Implementation (Java)\n\n\`\`\`java\nclass Solution {\n    // Write code here\n}\n\`\`\`\n\n---\n\n## 📊 Complexity Analysis\n\n| Metric | Complexity | Explanation |\n| :--- | :--- | :--- |\n| **Time Complexity** | $O(N)$ | [Provide justification] |\n| **Space Complexity** | $O(1)$ | [Provide justification] |\n\n---\n\n## ⚠️ Edge Cases & Pitfalls to Avoid\n\n* **Edge Case 1:** [Describe edge case and handling]\n`;

                const edit = new vscode.WorkspaceEdit();
                edit.insert(fileUri, new vscode.Position(0, 0), template);
                await vscode.workspace.applyEdit(edit);
                
                const doc = await vscode.workspace.openTextDocument(fileUri);
                await doc.save();
            }
        }
    });

    context.subscriptions.push(
        enforceCmd, fillCmd, startQuizCmd, openQuizPanelCmd, refreshTreeCmd,
        diagnosticCollection, changeListener, editorChangeListener,
        codeActionProvider, webviewRegistration, completionProvider,
        treeViewRegistration, createListener
    );
}

export function deactivate() {}
