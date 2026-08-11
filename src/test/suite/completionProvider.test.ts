import * as assert from 'assert';
import * as vscode from 'vscode';
import { DsaCompletionProvider } from '../../completionProvider';

suite('Completion Provider Unit Test Suite', () => {
    const provider = new DsaCompletionProvider();

    test('provideInlineCompletionItems returns markdown snippet for dsa-dp-table', () => {
        const textLine = 'dsa-dp-table';
        const position = new vscode.Position(0, textLine.length);
        
        const mockDoc = {
            languageId: 'markdown',
            lineAt: (line: number) => ({ text: textLine }),
            getText: () => textLine,
            uri: vscode.Uri.file('/mock/doc.md')
        } as unknown as vscode.TextDocument;

        const results = provider.provideInlineCompletionItems(
            mockDoc,
            position,
            {} as vscode.InlineCompletionContext,
            new vscode.CancellationTokenSource().token
        ) as vscode.InlineCompletionItem[];

        assert.ok(results);
        assert.strictEqual(results.length, 1);
        const insertText = results[0].insertText as string;
        assert.ok(insertText.includes('| State | Condition | Transition |'));
    });

    test('provideInlineCompletionItems returns java snippet for dsa-dsu', () => {
        const textLine = 'dsa-dsu';
        const position = new vscode.Position(0, textLine.length);
        
        const mockDoc = {
            languageId: 'java',
            lineAt: (line: number) => ({ text: textLine }),
            getText: () => textLine,
            uri: vscode.Uri.file('/mock/doc.java')
        } as unknown as vscode.TextDocument;

        const results = provider.provideInlineCompletionItems(
            mockDoc,
            position,
            {} as vscode.InlineCompletionContext,
            new vscode.CancellationTokenSource().token
        ) as vscode.InlineCompletionItem[];

        assert.ok(results);
        assert.strictEqual(results.length, 1);
        const insertText = results[0].insertText as string;
        assert.ok(insertText.includes('class DisjointSet {'));
    });
});
