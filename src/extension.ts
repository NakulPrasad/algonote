import * as vscode from 'vscode';
import { enforceTemplate } from './formatter';
import { updateDiagnostics } from './linter';
import { fillMissingDetails } from './aiService';
import { DsaCodeActionProvider } from './codeActions';
import { registerChatParticipant } from './chatParticipant';
import { McqViewProvider } from './mcqView';
import { DsaCompletionProvider } from './completionProvider';
import { RevisionTreeProvider } from './revisionTree';
import { createProblemNote } from './noteCreator';
import { openOrCreateTemplateFile, getTemplateContent, renderTemplate } from './templateService';
import * as path from 'path';
import { IntegrationServer } from './server';

export function activate(context: vscode.ExtensionContext) {
    console.log('DSA Note Helper is active!');

    // Start local integration server
    const integrationServer = new IntegrationServer(context.extensionPath);
    integrationServer.start().catch(err => {
        console.error('Failed to start AlgoNote local server:', err);
    });
    context.subscriptions.push({ dispose: () => integrationServer.stop() });

    // 1. Register Format/Enforce Template Command
    let enforceCmd = vscode.commands.registerCommand('algonote.enforceTemplate', async () => {
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

    // 2. Register Customize Template Command
    let customizeTemplateCmd = vscode.commands.registerCommand('algonote.customizeTemplate', async () => {
        try {
            await openOrCreateTemplateFile();
        } catch (e: any) {
            vscode.window.showErrorMessage(`Failed to open template: ${e.message}`);
        }
    });

    // 3. Register AI Fill Details Command
    let fillCmd = vscode.commands.registerCommand('algonote.fillDetails', async () => {
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

    // 4. Register MCQ View Command
    const mcqProvider = new McqViewProvider(context.extensionUri, integrationServer);
    let startQuizCmd = vscode.commands.registerCommand('algonote.startQuiz', async () => {
        const config = vscode.workspace.getConfiguration('algonote');
        const location = config.get<string>('quizLocation', 'editor-one');

        if (location === 'editor-two') {
            mcqProvider.openFullPanel(vscode.ViewColumn.Two);
            await mcqProvider.generateQuiz();
        } else if (location === 'browser') {
            await mcqProvider.launchInBrowser();
        } else {
            // Default: editor-one
            mcqProvider.openFullPanel(vscode.ViewColumn.One);
            await mcqProvider.generateQuiz();
        }
    });

    let openQuizPanelCmd = vscode.commands.registerCommand('algonote.openQuizPanel', (column?: vscode.ViewColumn) => {
        mcqProvider.openFullPanel(column);
    });

    // Register New Problem Note Command
    let createProblemNoteCmd = vscode.commands.registerCommand('algonote.createProblemNote', async () => {
        await createProblemNote();
    });

    // 5. Register Linter / Diagnostics Collection
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('algonote');
    
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

    // 6. Register Code Actions (Quick Fixes)
    let codeActionProvider = vscode.languages.registerCodeActionsProvider(
        'markdown',
        new DsaCodeActionProvider(),
        { providedCodeActionKinds: DsaCodeActionProvider.providedCodeActionKinds }
    );

    // 7. Register Chat Participant
    registerChatParticipant(context);

    // 8. Register MCQ Webview View
    let webviewRegistration = vscode.window.registerWebviewViewProvider(
        McqViewProvider.viewType,
        mcqProvider
    );

    // 9. Register Inline Completion
    let completionProvider = vscode.languages.registerInlineCompletionItemProvider(
        [{ language: 'markdown' }, { language: 'java' }],
        new DsaCompletionProvider()
    );

    // 10. Register Revision Tree View
    const revisionTreeProvider = new RevisionTreeProvider();
    let treeViewRegistration = vscode.window.registerTreeDataProvider(
        'algonote-revision',
        revisionTreeProvider
    );

    let refreshTreeCmd = vscode.commands.registerCommand('algonote.showRevisionTree', () => {
        revisionTreeProvider.refresh();
    });

    // 11. Auto-Template on File Create
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

                const templateString = await getTemplateContent();
                const template = renderTemplate(templateString, {
                    title,
                    difficulty
                });

                const edit = new vscode.WorkspaceEdit();
                edit.insert(fileUri, new vscode.Position(0, 0), template);
                await vscode.workspace.applyEdit(edit);
                
                const doc = await vscode.workspace.openTextDocument(fileUri);
                await doc.save();
            }
        }
    });

    context.subscriptions.push(
        enforceCmd, customizeTemplateCmd, fillCmd, startQuizCmd, openQuizPanelCmd, refreshTreeCmd,
        createProblemNoteCmd,
        diagnosticCollection, changeListener, editorChangeListener,
        codeActionProvider, webviewRegistration, completionProvider,
        treeViewRegistration, createListener
    );
}

export function deactivate() {}
