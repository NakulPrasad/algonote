import * as vscode from 'vscode';
import * as path from 'path';

export interface TemplateVariables {
    title?: string;
    difficulty?: string;
    topic?: string;
    link?: string;
    description?: string;
    examples?: string;
    starterCode?: string;
    intuition?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    edgeCases?: string;
    visualization?: string;
}

export const DEFAULT_TEMPLATE = `# \${title}

> **Difficulty:** \${difficulty}  
> **Topic / Pattern:** \${topic}  
> **Link:** [\${title}](\${link})

---

## 📋 Problem Statement

\${description}

### Examples
\`\`\`text
\${examples}
\`\`\`

---

## 💡 Intuition & Core Approach

\${intuition}

---

## 🎨 Visualization / Dry Run

\${visualization}

---

## 💻 Implementation (Java)

\`\`\`java
\${starterCode}
\`\`\`

---

## 📊 Complexity Analysis

| Metric | Complexity | Explanation |
| :--- | :--- | :--- |
| **Time Complexity** | \${timeComplexity} | [Provide justification] |
| **Space Complexity** | \${spaceComplexity} | [Provide justification] |

---

## ⚠️ Edge Cases & Pitfalls to Avoid

\${edgeCases}
`;

/**
 * Searches for a user-defined template in:
 * 1. Configuration setting 'algonote.customTemplatePath'
 * 2. .algonote/template.md in the workspace
 * 3. TEMPLATE.md in the workspace root
 */
export async function getCustomTemplateUri(): Promise<vscode.Uri | null> {
    const config = vscode.workspace.getConfiguration('algonote');
    const customSetting = config.get<string>('customTemplatePath');

    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (customSetting && customSetting.trim()) {
        if (path.isAbsolute(customSetting)) {
            const uri = vscode.Uri.file(customSetting);
            if (await fileExists(uri)) {
                return uri;
            }
        } else if (workspaceFolders && workspaceFolders.length > 0) {
            const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, customSetting.trim());
            if (await fileExists(uri)) {
                return uri;
            }
        }
    }

    if (workspaceFolders && workspaceFolders.length > 0) {
        // Check .algonote/template.md
        const dotAlgoUri = vscode.Uri.joinPath(workspaceFolders[0].uri, '.algonote', 'template.md');
        if (await fileExists(dotAlgoUri)) {
            return dotAlgoUri;
        }

        // Check TEMPLATE.md in workspace root
        const rootTemplateUri = vscode.Uri.joinPath(workspaceFolders[0].uri, 'TEMPLATE.md');
        if (await fileExists(rootTemplateUri)) {
            return rootTemplateUri;
        }
    }

    return null;
}

/**
 * Reads the active template content (custom file if exists, else DEFAULT_TEMPLATE).
 */
export async function getTemplateContent(): Promise<string> {
    const customUri = await getCustomTemplateUri();
    if (customUri) {
        try {
            const data = await vscode.workspace.fs.readFile(customUri);
            const content = new TextDecoder('utf-8').decode(data);
            if (content.trim()) {
                return content;
            }
        } catch {
            // Fall back to default on read failure
        }
    }
    return DEFAULT_TEMPLATE;
}

/**
 * Replaces placeholders like ${title} or {{title}} with provided values.
 */
export function renderTemplate(templateString: string, variables: TemplateVariables): string {
    const defaults: Record<string, string> = {
        title: variables.title || '[Problem Title]',
        difficulty: variables.difficulty || 'Easy',
        topic: variables.topic || '[Topic]',
        link: variables.link || 'URL',
        description: variables.description || '[Insert problem description here]',
        examples: variables.examples || 'Input: \nOutput: ',
        starterCode: variables.starterCode || 'class Solution {\n    // Write code here\n}',
        intuition: variables.intuition || '* **The Core Idea:** [Insert core algorithmic intuition here]\n* **Key Steps:**\n  - [Step 1]\n  - [Step 2]',
        timeComplexity: variables.timeComplexity || '$O(N)$',
        spaceComplexity: variables.spaceComplexity || '$O(1)$',
        edgeCases: variables.edgeCases || '* **Edge Case 1:** [Describe edge case and handling]',
        visualization: variables.visualization !== undefined ? variables.visualization : '[If applicable, embed visual diagram/illustration here]\n![visualization](images/image-name.png)'
    };

    let result = templateString;

    for (const [key, val] of Object.entries(defaults)) {
        // Match ${key} and {{key}}
        const regex1 = new RegExp(`\\$\\{${key}\\}`, 'g');
        const regex2 = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(regex1, val).replace(regex2, val);
    }

    // Also support alias ${code} or {{code}} for starterCode
    result = result.replace(/\$\{code\}/g, defaults.starterCode).replace(/\{\{code\}\}/g, defaults.starterCode);

    return result;
}

/**
 * Creates or opens a custom template file so the user can easily modify it.
 */
export async function openOrCreateTemplateFile(): Promise<vscode.TextDocument | null> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage('Please open a workspace folder first before editing the template.');
        return null;
    }

    const existingUri = await getCustomTemplateUri();
    const targetUri = existingUri || vscode.Uri.joinPath(workspaceFolders[0].uri, 'TEMPLATE.md');

    if (!(await fileExists(targetUri))) {
        const starterContent = `<!-- 
  AlgoNote Custom Template
  Available placeholders:
    \${title} or {{title}}                  - Problem Title
    \${difficulty} or {{difficulty}}        - Difficulty (Easy, Medium, Hard, Basic)
    \${topic} or {{topic}}                  - Pattern or Category (e.g. Sliding Window)
    \${link} or {{link}}                    - Problem URL
    \${description} or {{description}}      - Problem description
    \${examples} or {{examples}}            - Test examples
    \${intuition} or {{intuition}}          - Core intuition & approach
    \${starterCode} or {{starterCode}}      - Starter / Implementation code
    \${timeComplexity} or {{timeComplexity}}- Time Complexity (e.g. $O(N)$)
    \${spaceComplexity} or {{spaceComplexity}}- Space Complexity (e.g. $O(1)$)
    \${edgeCases} or {{edgeCases}}          - Edge cases list
    \${visualization} or {{visualization}}  - Diagram / trace images
-->

${DEFAULT_TEMPLATE}`;

        const encoder = new TextEncoder();
        await vscode.workspace.fs.writeFile(targetUri, encoder.encode(starterContent));
    }

    const doc = await vscode.workspace.openTextDocument(targetUri);
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage('You can customize this template. AlgoNote will automatically use it for new notes and formatting.');
    return doc;
}

async function fileExists(uri: vscode.Uri): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch {
        return false;
    }
}
