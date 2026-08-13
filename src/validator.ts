import * as vscode from 'vscode';
import { askCopilot } from './aiService';

export async function validateActiveNoteWithAI(document: vscode.TextDocument): Promise<{ isValid: boolean; message?: string }> {
    const config = vscode.workspace.getConfiguration('algonote');
    const strictPreflightCheck = config.get<boolean>('strictPreflightCheck', true);

    if (!strictPreflightCheck) {
        return { isValid: true };
    }

    const text = document.getText();

    const prompt = `You are a DSA validator. Check if the following note content has:
1. A solution code block (in any programming language, e.g. Java, Python, C++, Go, JS, Rust).
2. An explanation of the algorithmic intuition/approach.

Note content:
---
${text.slice(0, 3000)}
---

Respond ONLY with a JSON object in this format (no markdown formatting or extra text):
{
  "isValid": true or false,
  "message": "If isValid is false, provide a clear, helpful user error message explaining what is missing (e.g., 'No code block found. Add your solution inside a code block first.'). If isValid is true, leave this empty."
}`;

    try {
        let raw = await askCopilot(prompt);
        raw = raw.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        const res = JSON.parse(raw);
        return {
            isValid: !!res.isValid,
            message: res.message || undefined
        };
    } catch (e: any) {
        return validateActiveNote(document);
    }
}

export function validateActiveNote(document: vscode.TextDocument): { isValid: boolean; message?: string } {
    const text = document.getText();

    // Check if Intuition is present and filled (not empty and no intuition placeholder)
    const hasIntuition = /##\s+(?:💡\s+)?Intuition/i.test(text);
    let intuitionFilled = false;
    if (hasIntuition) {
        const intuitionIndex = text.search(/##\s+(?:💡\s+)?Intuition/i);
        const textAfterIntuition = text.slice(intuitionIndex);
        const nextHeaderIndex = textAfterIntuition.slice(2).search(/##/);
        const intuitionContent = nextHeaderIndex === -1 ? textAfterIntuition : textAfterIntuition.slice(0, nextHeaderIndex + 2);
        
        const hasIntuitionPlaceholder = /\[Insert core algorithmic intuition here\]/gi.test(intuitionContent);
        const cleanIntuition = intuitionContent.replace(/##\s+(?:💡\s+)?Intuition[^\n]*/i, '').trim();
        if (cleanIntuition !== '' && !hasIntuitionPlaceholder) {
            intuitionFilled = true;
        }
    }

    // Check if Implementation is present and filled (has non-empty code block)
    const hasImplementation = /##\s+(?:💻\s+)?Implementation/i.test(text);
    let implementationFilled = false;
    if (hasImplementation) {
        const implementationIndex = text.search(/##\s+(?:💻\s+)?Implementation/i);
        const textAfterImplementation = text.slice(implementationIndex);
        const codeBlockMatch = textAfterImplementation.match(/```[^\n]*\n([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1].trim() !== '') {
            implementationFilled = true;
        }
    }

    // Fallback: Check for any generic non-empty code block
    let genericCodeFilled = false;
    const genericCodeMatch = text.match(/```[^\n]*\n([\s\S]*?)```/);
    if (genericCodeMatch && genericCodeMatch[1].trim() !== '') {
        genericCodeFilled = true;
    }

    if (intuitionFilled || implementationFilled || genericCodeFilled) {
        return { isValid: true };
    }

    return {
        isValid: false,
        message: 'Your note is incomplete! Please fill in either the "Intuition" section or a code block first before starting the quiz.'
    };
}
