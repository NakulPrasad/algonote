import * as vscode from 'vscode';
import * as path from 'path';
import { askAI } from './aiService';

interface ProblemDetails {
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Basic';
    topic: string;
    link: string;
    description: string;
    examples: string;
    starterCode: string;
}

export async function createProblemNote(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage('Please open a workspace folder first before creating a note.');
        return;
    }

    const userInput = await vscode.window.showInputBox({
        prompt: 'Enter the DSA problem name or LeetCode URL (e.g., "Two Sum")',
        placeHolder: 'e.g., Two Sum'
    });

    if (!userInput || !userInput.trim()) {
        return;
    }

    const problemName = userInput.trim();

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Fetching problem details for "${problemName}" via AI...`,
        cancellable: false
    }, async () => {
        try {
            const prompt = `You are an expert DSA assistant.
Find and fetch the exact details for this problem: "${problemName}"

Respond with ONLY a raw JSON object (no markdown fences or code block formatting) matching this exact shape:
{
  "title": "Clean Title of the problem",
  "difficulty": "Easy",
  "topic": "e.g. Arrays & Hashing",
  "link": "e.g. https://leetcode.com/problems/two-sum/",
  "description": "Detailed description of the problem statement and its constraints",
  "examples": "Input: ...\\nOutput: ...",
  "starterCode": "public class Solution {\\n    public int[] twoSum(int[] nums, int target) {\\n        \\n    }\\n}"
}

Ensure the difficulty is strictly one of "Easy", "Medium", "Hard", or "Basic".`;

            let raw = await askAI(prompt);
            raw = raw.trim();
            if (raw.startsWith('```')) {
                raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
            }

            const details: ProblemDetails = JSON.parse(raw);
            
            // Format difficulty prefix
            let prefix = 'E';
            if (details.difficulty === 'Medium') {
                prefix = 'M';
            } else if (details.difficulty === 'Hard') {
                prefix = 'H';
            } else if (details.difficulty === 'Basic') {
                prefix = 'B';
            }

            // Construct standard content
            const noteContent = generateNoteContent(details);

            // Construct filename
            const cleanTitle = details.title.replace(/[\/\\?%*:|"<>]/g, '');
            const filename = `${prefix}. ${cleanTitle}.md`;
            const fileUri = vscode.Uri.joinPath(workspaceFolders[0].uri, filename);

            const fileExists = await checkFileExists(fileUri);
            if (fileExists) {
                const choice = await vscode.window.showInformationMessage(
                    `File "${filename}" already exists in workspace. Overwrite it?`,
                    'Overwrite',
                    'Open Existing'
                );
                if (choice === 'Open Existing') {
                    const doc = await vscode.workspace.openTextDocument(fileUri);
                    await vscode.window.showTextDocument(doc);
                    return;
                } else if (choice !== 'Overwrite') {
                    return;
                }
            }

            // Write and open file
            const encoder = new TextEncoder();
            await vscode.workspace.fs.writeFile(fileUri, encoder.encode(noteContent));

            const doc = await vscode.workspace.openTextDocument(fileUri);
            await vscode.window.showTextDocument(doc);

            vscode.window.showInformationMessage(`✅ Successfully created note for: "${details.title}"`);
        } catch (e: any) {
            vscode.window.showErrorMessage(`Failed to create note: ${e.message}`);
        }
    });
}

export function generateNoteContent(details: ProblemDetails): string {
    return `# ${details.title}

> **Difficulty:** ${details.difficulty}  
> **Topic / Pattern:** ${details.topic}  
> **Link:** [${details.title}](${details.link})

---

## 📝 Problem Statement

${details.description.trim()}

### Examples
\`\`\`text
${details.examples.trim()}
\`\`\`

---

## 💡 Intuition & Core Approach

* **The Core Idea:** [Insert core algorithmic intuition here]
* **Key Steps:**
  - [Step 1]
  - [Step 2]

---

## 💻 Implementation (Java)

\`\`\`java
${details.starterCode.trim()}
\`\`\`

---

## 📊 Complexity Analysis

| Metric | Complexity | Explanation |
| :--- | :--- | :--- |
| **Time Complexity** | $O(N)$ | [Provide justification] |
| **Space Complexity** | $O(1)$ | [Provide justification] |

---

## ⚠️ Edge Cases & Pitfalls to Avoid

* **Edge Case 1:** [Describe edge case and handling]
`;
}

async function checkFileExists(uri: vscode.Uri): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch {
        return false;
    }
}
