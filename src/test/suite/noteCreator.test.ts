import * as assert from 'assert';
import { generateNoteContent } from '../../noteCreator';

suite('Note Creator Unit Test Suite', () => {
    test('generateNoteContent constructs valid Markdown from ProblemDetails', () => {
        const details = {
            title: 'Reverse String',
            difficulty: 'Easy' as const,
            topic: 'Two Pointers',
            link: 'https://leetcode.com/problems/reverse-string/',
            description: 'Write a function that reverses a string.',
            examples: 'Input: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]',
            starterCode: 'class Solution {\n    public void reverseString(char[] s) {}\n}'
        };

        const markdown = generateNoteContent(details);

        assert.ok(markdown.includes('# Reverse String'));
        assert.ok(markdown.includes('> **Difficulty:** Easy'));
        assert.ok(markdown.includes('> **Topic / Pattern:** Two Pointers'));
        assert.ok(markdown.includes('https://leetcode.com/problems/reverse-string/'));
        assert.ok(markdown.includes('Write a function that reverses a string.'));
        assert.ok(markdown.includes('Input: s = ["h","e","l","l","o"]'));
        assert.ok(markdown.includes('public void reverseString(char[] s)'));
    });
});
