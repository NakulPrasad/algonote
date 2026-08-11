import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { enforceTemplate } from '../../formatter';

suite('Formatter Unit Test Suite', () => {
    const testDir = path.resolve(__dirname, '../../../test-temp');
    
    suiteSetup(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir);
        }
    });

    suiteTeardown(async () => {
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        if (fs.existsSync(testDir)) {
            // Give a tiny moment for VS Code to release the handles
            await new Promise(resolve => setTimeout(resolve, 500));
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    test('enforceTemplate formats basic document with correct difficulty and headers', async () => {
        const filePath = path.join(testDir, 'E. TwoSum.md');
        const initialContent = `# [Two Sum](https://leetcode.com/problems/two-sum/)
Some description.

\`\`\`java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[0];
    }
}
\`\`\`
`;
        fs.writeFileSync(filePath, initialContent);

        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc);

        await enforceTemplate(doc);

        const formattedText = doc.getText();
        assert.ok(formattedText.includes('# Two Sum'), 'Should normalize the title');
        assert.ok(formattedText.includes('> **Difficulty:** Easy'), 'Should extract difficulty from E. prefix');
        assert.ok(formattedText.includes('## 📝 Problem Statement'), 'Should contain problem statement section');
        assert.ok(formattedText.includes('## 💡 Intuition & Core Approach'), 'Should contain intuition section');
        assert.ok(formattedText.includes('## 💻 Implementation (Java)'), 'Should contain implementation section');
        assert.ok(formattedText.includes('## 📊 Complexity Analysis'), 'Should contain complexity analysis table');
    });
});
