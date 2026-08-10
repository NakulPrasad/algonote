import * as vscode from 'vscode';
import { enforceTemplate } from './formatter';
import { updateDiagnostics } from './linter';

export function registerChatParticipant(context: vscode.ExtensionContext) {
    const dsaParticipant = vscode.chat.createChatParticipant('dsa-helper.dsa', async (request, ctx, response, token) => {
        const command = request.command;

        // Always use the model the user already has selected in Copilot chat.
        // This respects their active model (GPT-4o, Claude, etc.) automatically.
        const model = request.model;

        const activeEditor = vscode.window.activeTextEditor;
        const noteText = activeEditor?.document?.getText() ?? '';

        const systemPrompt = 'You are a specialized DSA (Data Structures & Algorithms) coding assistant. You help students write, review, and improve their problem-solving notes and code.';

        if (command === 'lint') {
            // Run structural lint check
            const collection = vscode.languages.createDiagnosticCollection('dsa-helper-temp');
            if (activeEditor) {
                updateDiagnostics(activeEditor.document, collection);
            }
            const diags = activeEditor ? (collection.get(activeEditor.document.uri) || []) : [];
            collection.dispose();

            if (diags.length === 0) {
                response.markdown('✅ **Perfect!** No missing sections or unfilled placeholders found in this note.');
                return;
            }

            const issueList = diags.map(d => `- ${d.message}`).join('\n');
            const prompt = `${systemPrompt}

A student has the following DSA note issues:
${issueList}

Briefly explain what each issue means for a student's notes and provide 1-line actionable fix suggestions.`;

            response.markdown('**Lint Report** — issues found:\n\n');
            diags.forEach(d => response.markdown(`- ⚠️ ${d.message}\n`));
            response.markdown('\n---\n\n**AI Suggestions:**\n\n');

            const aiResponse = await model.sendRequest([
                vscode.LanguageModelChatMessage.User(prompt)
            ], {}, token);
            for await (const chunk of aiResponse.text) {
                response.markdown(chunk);
            }

            response.button({ command: 'dsa-helper.enforceTemplate', title: '$(tools) Enforce Template' });
            response.button({ command: 'dsa-helper.fillDetails', title: '$(sparkle) Auto-fill with Copilot' });
        }
        else if (command === 'mcq') {
            if (!activeEditor || !noteText) {
                response.markdown('Please open a DSA note first.');
                return;
            }

            const prompt = `${systemPrompt}

Based on this DSA note:
---
${noteText.slice(0, 3000)}
---

Generate exactly 3 multiple-choice questions to test understanding of this problem.
DO NOT reveal the correct answers directly in the open text! Hide the answers and explanations inside a collapsible Markdown \`<details>\` tag for each question.

Format each question as:
**Q1: [Question text]**
- A) ...
- B) ...
- C) ...
- D) ...

<details>
<summary>💡 <b>Show Answer & Explanation</b></summary>

✅ **Correct Answer: [Letter]**

**Explanation:** [Detailed explanation why]
</details>
`;

            response.markdown('### 🧪 Active Recall Quiz\n\n');
            const aiResponse = await model.sendRequest([
                vscode.LanguageModelChatMessage.User(prompt)
            ], {}, token);
            for await (const chunk of aiResponse.text) {
                response.markdown(chunk);
            }
            response.button({ command: 'dsa-helper.startQuiz', title: '$(beaker) Open Interactive Quiz' });
        }
        else if (command === 'dryrun') {
            if (!activeEditor || !noteText) {
                response.markdown('Please open a DSA note with a Java code block first.');
                return;
            }

            const prompt = `${systemPrompt}

Here is a DSA problem note with Java code:
---
${noteText.slice(0, 3000)}
---

Create a step-by-step dry-run trace for a representative sample input. Format the trace as a Markdown table showing variable states at each step. Conclude with the final output and key observations.`;

            response.markdown('### 🔍 Dry Run Trace\n\n');
            const aiResponse = await model.sendRequest([
                vscode.LanguageModelChatMessage.User(prompt)
            ], {}, token);
            for await (const chunk of aiResponse.text) {
                response.markdown(chunk);
            }
        }
        else if (command === 'complexity') {
            if (!activeEditor || !noteText) {
                response.markdown('Please open a DSA note with a Java code block first.');
                return;
            }

            const prompt = `${systemPrompt}

Analyze the following Java solution:
---
${noteText.slice(0, 3000)}
---

Provide a formal Big-O complexity analysis:
1. **Time Complexity**: State the complexity with Big-O notation and a precise mathematical justification (count each loop, recursion, etc.)
2. **Space Complexity**: Analyze the auxiliary space used (excluding input)
3. **Identify potential bottlenecks** (e.g. nested loops, sorting, recursion depth)
4. Suggest any improvements if applicable.`;

            response.markdown('### 📊 Complexity Analysis\n\n');
            const aiResponse = await model.sendRequest([
                vscode.LanguageModelChatMessage.User(prompt)
            ], {}, token);
            for await (const chunk of aiResponse.text) {
                response.markdown(chunk);
            }
        }
        else if (command === 'template') {
            if (!activeEditor) {
                response.markdown('Please open a Markdown file first.');
                return;
            }
            response.markdown('Enforcing the standard DSA template structure...\n\n');
            await enforceTemplate(activeEditor.document);
            response.markdown('✅ Template enforced. All standard sections are now present.');
        }
        else {
            // Default help message when @dsa is invoked without a command
            response.markdown(`## 🧠 DSA Note Helper

I'm your DSA study assistant. Here's what I can do:

| Command | What it does |
|:---|:---|
| \`/lint\` | Check for missing sections & placeholders, suggest fixes |
| \`/mcq\` | Generate 3 quiz questions from your current note |
| \`/dryrun\` | Produce a step-by-step variable trace table |
| \`/complexity\` | Formal Big-O time & space analysis of your code |
| \`/template\` | Enforce the standard DSA note structure |

Open a DSA Markdown note and try \`@dsa /lint\`!`);
        }
    });

    dsaParticipant.iconPath = new vscode.ThemeIcon('hubot');
    context.subscriptions.push(dsaParticipant);
}
