import * as assert from 'assert';
import * as vscode from 'vscode';
import { McqViewProvider } from '../../mcqView';

suite('MCQ View Provider Unit Test Suite', () => {
    test('resolveWebviewView sets options and html', () => {
        const mockUri = vscode.Uri.file('/mock/extension');
        const provider = new McqViewProvider(mockUri);

        const mockWebview: any = {
            options: {},
            html: '',
            onDidReceiveMessage: () => ({ dispose: () => {} })
        };

        const mockWebviewView: any = {
            webview: mockWebview
        };

        provider.resolveWebviewView(
            mockWebviewView,
            {} as vscode.WebviewViewResolveContext,
            new vscode.CancellationTokenSource().token
        );

        assert.strictEqual(mockWebview.options.enableScripts, true);
        assert.ok(mockWebview.html.includes('⚡ Generate AI Quiz for Active Note'));
    });
});
