import * as assert from 'assert';
import * as vscode from 'vscode';
import { askAI } from '../../aiService';

suite('AI Service Unit Test Suite', () => {
    let originalProvider: string | undefined;
    let originalApiKey: string | undefined;
    let config: vscode.WorkspaceConfiguration;

    suiteSetup(async () => {
        config = vscode.workspace.getConfiguration('algonote');
        originalProvider = config.get<string>('aiProvider');
        originalApiKey = config.get<string>('geminiApiKey');
    });

    suiteTeardown(async () => {
        // Restore config
        await config.update('aiProvider', originalProvider, vscode.ConfigurationTarget.Global);
        await config.update('geminiApiKey', originalApiKey, vscode.ConfigurationTarget.Global);
    });

    test('askAI routes to gemini and throws error when API key is missing', async () => {
        await config.update('aiProvider', 'gemini', vscode.ConfigurationTarget.Global);
        await config.update('geminiApiKey', '', vscode.ConfigurationTarget.Global);

        try {
            await askAI('Test prompt');
            assert.fail('Expected askAI to throw error when api key is missing');
        } catch (e: any) {
            assert.ok(e.message.includes('Gemini API Key is missing'));
        }
    });

    test('askAI routes to custom provider and attempts request', async () => {
        await config.update('aiProvider', 'custom', vscode.ConfigurationTarget.Global);
        await config.update('customEndpoint', 'http://127.0.0.1:9999/v1', vscode.ConfigurationTarget.Global);
        await config.update('customApiKey', 'test-key', vscode.ConfigurationTarget.Global);
        await config.update('customModel', 'test-model', vscode.ConfigurationTarget.Global);

        try {
            await askAI('Test prompt');
            assert.fail('Expected askAI to fail request to 127.0.0.1:9999');
        } catch (e: any) {
            // It should fail with connection refused or a network error since nothing runs on 9999,
            // which confirms it reached queryCustomOpenAI and makeHttpRequest.
            assert.ok(e.message.includes('ECONNREFUSED') || e.message.includes('connect') || e.message.includes('API Error'));
        }
    });
});
