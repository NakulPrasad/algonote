import * as assert from 'assert';
import { renderTemplate, DEFAULT_TEMPLATE } from '../../templateService';

suite('Template Service Unit Test Suite', () => {
    test('renderTemplate replaces ${...} placeholders correctly', () => {
        const customTemplate = `# \${title}\n\nDifficulty: \${difficulty}\nTopic: \${topic}\nCode:\n\${starterCode}`;
        const output = renderTemplate(customTemplate, {
            title: '3Sum',
            difficulty: 'Medium',
            topic: 'Two Pointers',
            starterCode: 'def threeSum(nums): pass'
        });

        assert.ok(output.includes('# 3Sum'));
        assert.ok(output.includes('Difficulty: Medium'));
        assert.ok(output.includes('Topic: Two Pointers'));
        assert.ok(output.includes('def threeSum(nums): pass'));
    });

    test('renderTemplate replaces {{...}} handlebars placeholders correctly', () => {
        const customTemplate = `# {{title}}\n\nDifficulty: {{difficulty}}\nLink: {{link}}\n{{intuition}}`;
        const output = renderTemplate(customTemplate, {
            title: 'Invert Binary Tree',
            difficulty: 'Easy',
            link: 'https://leetcode.com/problems/invert-binary-tree/',
            intuition: 'Swap left and right children recursively.'
        });

        assert.ok(output.includes('# Invert Binary Tree'));
        assert.ok(output.includes('Difficulty: Easy'));
        assert.ok(output.includes('https://leetcode.com/problems/invert-binary-tree/'));
        assert.ok(output.includes('Swap left and right children recursively.'));
    });

    test('renderTemplate supplies sensible defaults when variables are omitted', () => {
        const output = renderTemplate(DEFAULT_TEMPLATE, {});

        assert.ok(output.includes('# [Problem Title]'));
        assert.ok(output.includes('> **Difficulty:** Easy'));
        assert.ok(output.includes('## 📋 Problem Statement'));
        assert.ok(output.includes('## 💡 Intuition & Core Approach'));
        assert.ok(output.includes('## 💻 Implementation (Java)'));
        assert.ok(output.includes('## 📊 Complexity Analysis'));
        assert.ok(output.includes('## ⚠️ Edge Cases & Pitfalls to Avoid'));
    });
});
