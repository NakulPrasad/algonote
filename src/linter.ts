import * as vscode from 'vscode';

export const PLACEHOLDERS = [
    /\[Insert problem description here\]/gi,
    /\[Provide justification\]/gi,
    /\[Describe edge case.*?\]/gi,
    /\[Describe edgecase.*?\]/gi,
    /\[Topic\]/g,
    /\[Platform\]/g,
    /\[Step \d+\]/gi,
    /\[Insert core algorithmic intuition here\]/gi,
    /\[Update Topic\]/gi,
    /URL/g
];

export const REQUIRED_SECTIONS = [
    { regex: /## 📝 Problem Statement/i, name: "Problem Statement" },
    { regex: /## 💡 Intuition & Core Approach/i, name: "Intuition & Core Approach" },
    { regex: /## 💻 Implementation/i, name: "Implementation" },
    { regex: /## 📊 Complexity Analysis/i, name: "Complexity Analysis" },
    { regex: /## ⚠️ Edge Cases & Pitfalls to Avoid/i, name: "Edge Cases & Pitfalls to Avoid" }
];

export function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    // Check placeholders
    for (const regex of PLACEHOLDERS) {
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            const diagnostic = new vscode.Diagnostic(
                range,
                `Placeholder needs to be filled: "${match[0]}"`,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.source = 'AlgoNote AI';
            diagnostic.code = 'algonote-placeholder';
            diagnostics.push(diagnostic);
        }
    }

    // Check required structural sections
    let missingSections = [];
    for (const section of REQUIRED_SECTIONS) {
        if (!section.regex.test(text)) {
            missingSections.push(section.name);
        }
    }

    if (missingSections.length > 0) {
        // Place a warning at the top of the file
        const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 50));
        const diagnostic = new vscode.Diagnostic(
            range,
            `Missing structural sections: ${missingSections.join(', ')}. Use @algo /template or Quick Fixes to add them.`,
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.source = 'AlgoNote AI';
        diagnostic.code = 'algonote-missing-header';
        diagnostics.push(diagnostic);
    }

    collection.set(document.uri, diagnostics);
}
