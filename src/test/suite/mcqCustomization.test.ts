import * as assert from 'assert';
import * as vscode from 'vscode';
import { McqViewProvider } from '../../mcqView';

suite('MCQ Customization Unit Test Suite', () => {
    test('_getPromptForFormat constructs correct prompts for different settings', () => {
        const provider = new McqViewProvider(vscode.Uri.file('/mock'));
        
        // Mock the cached note text by setting the private property or mock context
        // Since we can set properties dynamically in JS/TS:
        (provider as any)._cachedNoteText = 'Binary search algorithm description. binary search is O(log N).';

        const promptMcq = provider._getPromptForFormat('multiple-choice', 3);
        assert.ok(promptMcq.includes('Generate exactly 3 standard multiple-choice questions'));
        assert.ok(promptMcq.includes('Binary search'));

        const promptCode = provider._getPromptForFormat('code-fill', 5);
        assert.ok(promptCode.includes('Generate exactly 5 fill-in-the-blank / code completion'));
        assert.ok(promptCode.includes('Binary search'));

        const promptConcept = provider._getPromptForFormat('explain-concept', 10);
        assert.ok(promptConcept.includes('Generate exactly 10 conceptual "explain concept in words"'));
        assert.ok(promptConcept.includes('Binary search'));
    });
});
