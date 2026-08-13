import * as assert from 'assert';
import * as vscode from 'vscode';
import { validateActiveNote } from '../../validator';

suite('Relaxed Validator Unit Test Suite', () => {
    test('validateActiveNote returns isValid: true if only Intuition is filled', async () => {
        const docText = `
# Test Note

## 💡 Intuition
This is the core intuition of the problem. No placeholders here!
`;
        const mockDoc = {
            getText: () => docText
        } as vscode.TextDocument;

        const validation = validateActiveNote(mockDoc);
        assert.strictEqual(validation.isValid, true);
    });

    test('validateActiveNote returns isValid: true if only Implementation code block is filled', async () => {
        const docText = `
# Test Note

## 💻 Implementation
\`\`\`java
class Solution {
    public void solve() {}
}
\`\`\`
`;
        const mockDoc = {
            getText: () => docText
        } as vscode.TextDocument;

        const validation = validateActiveNote(mockDoc);
        assert.strictEqual(validation.isValid, true);
    });

    test('validateActiveNote returns isValid: false if neither section is filled', async () => {
        const docText = `
# Test Note

## 💡 Intuition
[Insert core algorithmic intuition here]

## 💻 Implementation
\`\`\`java
\`\`\`
`;
        const mockDoc = {
            getText: () => docText
        } as vscode.TextDocument;

        const validation = validateActiveNote(mockDoc);
        assert.strictEqual(validation.isValid, false);
        assert.ok(validation.message?.includes('incomplete'));
    });
});
