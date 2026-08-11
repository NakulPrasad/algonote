import * as assert from 'assert';
import * as vscode from 'vscode';
import { DsaCodeActionProvider } from '../../codeActions';

suite('Code Actions Provider Unit Test Suite', () => {
    const provider = new DsaCodeActionProvider();

    test('provideCodeActions creates correct actions for diagnostics', () => {
        const mockDoc = {
            uri: vscode.Uri.file('/mock/file.md')
        } as vscode.TextDocument;

        const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10));

        const placeholderDiag = new vscode.Diagnostic(range, 'Placeholder warning', vscode.DiagnosticSeverity.Warning);
        placeholderDiag.code = 'dsa-placeholder';

        const missingHeaderDiag = new vscode.Diagnostic(range, 'Missing header warning', vscode.DiagnosticSeverity.Warning);
        missingHeaderDiag.code = 'dsa-missing-header';

        const context: vscode.CodeActionContext = {
            diagnostics: [placeholderDiag, missingHeaderDiag],
            only: undefined,
            triggerKind: vscode.CodeActionTriggerKind.Invoke
        };

        const actions = provider.provideCodeActions(
            mockDoc,
            range,
            context,
            new vscode.CancellationTokenSource().token
        );

        assert.ok(actions);
        assert.strictEqual(actions.length, 2);

        const fillAction = actions.find(a => a.title === 'Fill placeholder using AI');
        assert.ok(fillAction);
        assert.strictEqual(fillAction.command?.command, 'dsa-helper.fillDetails');

        const templateAction = actions.find(a => a.title === 'Enforce complete DSA template');
        assert.ok(templateAction);
        assert.strictEqual(templateAction.command?.command, 'dsa-helper.enforceTemplate');
    });
});
