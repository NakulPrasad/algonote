import * as vscode from 'vscode';

export class DsaCompletionProvider implements vscode.InlineCompletionItemProvider {
    public provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.InlineCompletionItem[]> {
        
        const textBeforeCursor = document.lineAt(position.line).text.substring(0, position.character);
        const items: vscode.InlineCompletionItem[] = [];

        // Markdown Completions
        if (document.languageId === 'markdown') {
            if (textBeforeCursor.endsWith('dsa-dp-table')) {
                const snippet = `
| State | Condition | Transition |
| :--- | :--- | :--- |
| $dp[i]$ | Base Case ($i=0$) | $0$ |
| $dp[i]$ | $nums[i] > 0$ | $dp[i-1] + nums[i]$ |
`;
                items.push(new vscode.InlineCompletionItem(snippet, new vscode.Range(position, position)));
            } else if (textBeforeCursor.endsWith('dsa-dryrun-table')) {
                const snippet = `
| Step | Variables | Output |
| :--- | :--- | :--- |
| 1 | | |
| 2 | | |
`;
                items.push(new vscode.InlineCompletionItem(snippet, new vscode.Range(position, position)));
            }
        }
        
        // Java Code Completions
        if (document.languageId === 'java') {
            if (textBeforeCursor.trim() === 'dsa-dsu') {
                const snippet = `
class DisjointSet {
    int[] parent, rank;
    public DisjointSet(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    public int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]);
    }
    public void union(int i, int j) {
        int rootI = find(i);
        int rootJ = find(j);
        if (rootI != rootJ) {
            if (rank[rootI] < rank[rootJ]) parent[rootI] = rootJ;
            else if (rank[rootI] > rank[rootJ]) parent[rootJ] = rootI;
            else {
                parent[rootJ] = rootI;
                rank[rootI]++;
            }
        }
    }
}`;
                items.push(new vscode.InlineCompletionItem(snippet, new vscode.Range(position, position)));
            }
        }

        return items;
    }
}
