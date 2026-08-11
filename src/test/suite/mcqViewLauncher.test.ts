import * as assert from 'assert';
import * as vscode from 'vscode';

suite('MCQ View Launcher Unit Test Suite', () => {
    let originalLocation: string | undefined;
    let config: vscode.WorkspaceConfiguration;

    suiteSetup(async () => {
        config = vscode.workspace.getConfiguration('algonote');
        originalLocation = config.get<string>('quizLocation');
    });

    suiteTeardown(async () => {
        await config.update('quizLocation', originalLocation, vscode.ConfigurationTarget.Global);
    });

    test('quizLocation configuration can be set and read successfully', async () => {
        await config.update('quizLocation', 'browser', vscode.ConfigurationTarget.Global);
        let updatedConfig = vscode.workspace.getConfiguration('algonote');
        let location = updatedConfig.get<string>('quizLocation');
        assert.strictEqual(location, 'browser');

        await config.update('quizLocation', 'editor-two', vscode.ConfigurationTarget.Global);
        updatedConfig = vscode.workspace.getConfiguration('algonote');
        location = updatedConfig.get<string>('quizLocation');
        assert.strictEqual(location, 'editor-two');
    });
});
