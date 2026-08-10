import * as vscode from 'vscode';

export class DsaCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] | undefined {
        const actions: vscode.CodeAction[] = [];

        for (const diagnostic of context.diagnostics) {
            if (diagnostic.code === 'dsa-placeholder') {
                actions.push(this.createAiFillAction(document, diagnostic));
            } else if (diagnostic.code === 'dsa-missing-header') {
                actions.push(this.createTemplateFix(document, diagnostic));
            }
        }

        return actions;
    }

    private createAiFillAction(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction {
        const action = new vscode.CodeAction('Fill placeholder using AI', vscode.CodeActionKind.QuickFix);
        action.command = {
            command: 'dsa-helper.fillDetails',
            title: 'Fill Details with AI',
            tooltip: 'Uses Gemini/Ollama to fill the current missing details'
        };
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        return action;
    }

    private createTemplateFix(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction {
        const action = new vscode.CodeAction('Enforce complete DSA template', vscode.CodeActionKind.QuickFix);
        action.command = {
            command: 'dsa-helper.enforceTemplate',
            title: 'Enforce Template',
            tooltip: 'Applies standard boilerplate missing headers'
        };
        action.diagnostics = [diagnostic];
        return action;
    }
}
