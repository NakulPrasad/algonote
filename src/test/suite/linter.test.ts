import * as assert from 'assert';
import * as vscode from 'vscode';
import { updateDiagnostics } from '../../linter';

suite('Linter Unit Test Suite', () => {
    let diagnosticCollection: vscode.DiagnosticCollection;

    suiteSetup(() => {
        diagnosticCollection = vscode.languages.createDiagnosticCollection('test-linter');
    });

    suiteTeardown(() => {
        diagnosticCollection.dispose();
    });

    test('updateDiagnostics identifies missing headers', () => {
        const text = `# Two Sum\n\nSome text but missing all headers.`;
        const mockDoc = {
            getText: () => text,
            positionAt: (offset: number) => new vscode.Position(0, offset),
            uri: vscode.Uri.file('/mock/path.md')
        } as vscode.TextDocument;

        updateDiagnostics(mockDoc, diagnosticCollection);

        const diagnostics = diagnosticCollection.get(mockDoc.uri) || [];
        assert.strictEqual(diagnostics.length, 1);
        assert.strictEqual(diagnostics[0].code, 'dsa-missing-header');
        assert.ok(diagnostics[0].message.includes('Missing structural sections'));
    });

    test('updateDiagnostics identifies placeholder warnings', () => {
        const text = `## 📝 Problem Statement
[Insert problem description here]

## 💡 Intuition & Core Approach
We will use a map.

## 💻 Implementation
Some code.

## 📊 Complexity Analysis
Metric | Complexity
Time | O(N)

## ⚠️ Edge Cases & Pitfalls to Avoid
[Describe edge case and handling]`;

        const mockDoc = {
            getText: () => text,
            positionAt: (offset: number) => {
                const lines = text.substring(0, offset).split('\n');
                return new vscode.Position(lines.length - 1, lines[lines.length - 1].length);
            },
            uri: vscode.Uri.file('/mock/placeholder.md')
        } as vscode.TextDocument;

        updateDiagnostics(mockDoc, diagnosticCollection);

        const diagnostics = diagnosticCollection.get(mockDoc.uri) || [];
        // Should catch the [Insert problem description here] and [Describe edge case and handling] placeholders
        // Wait, check the regexes in PLACEHOLDERS:
        // /\[Insert problem description here\]/gi,
        // /\[Describe edge case.*?\]/gi, etc.
        assert.ok(diagnostics.length >= 2, `Expected at least 2 diagnostics, got ${diagnostics.length}`);
        
        const codes = diagnostics.map(d => d.code);
        assert.ok(codes.includes('dsa-placeholder'));
        assert.ok(!codes.includes('dsa-missing-header'), 'Should not report missing headers if all headers exist');
    });
});
