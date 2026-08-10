import * as vscode from 'vscode';
import * as path from 'path';

export class RevisionTreeProvider implements vscode.TreeDataProvider<RevisionItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<RevisionItem | undefined | void> = new vscode.EventEmitter<RevisionItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<RevisionItem | undefined | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: RevisionItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: RevisionItem): Promise<RevisionItem[]> {
        if (element) {
            // Leaf nodes
            return [];
        } else {
            // Root categories
            const files = await vscode.workspace.findFiles('**/*.md', '**/node_modules/**');
            
            // Dummy logic for spacing repetition - randomly assign files for demo
            const dueToday: RevisionItem[] = [];
            const upcoming: RevisionItem[] = [];
            
            for (let i = 0; i < files.length; i++) {
                const basename = path.basename(files[i].fsPath);
                if (basename.toLowerCase() === 'readme.md') continue;

                if (i % 2 === 0) {
                    dueToday.push(new RevisionItem(basename, vscode.TreeItemCollapsibleState.None, files[i], 'due'));
                } else {
                    upcoming.push(new RevisionItem(basename, vscode.TreeItemCollapsibleState.None, files[i], 'upcoming'));
                }
            }

            return [
                new RevisionItem('Due for Revision Today', vscode.TreeItemCollapsibleState.Expanded, undefined, 'category', dueToday),
                new RevisionItem('Upcoming', vscode.TreeItemCollapsibleState.Expanded, undefined, 'category', upcoming)
            ];
        }
    }
}

class RevisionItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly uri?: vscode.Uri,
        public readonly contextValueStr?: string,
        public readonly children?: RevisionItem[]
    ) {
        super(label, collapsibleState);
        this.contextValue = contextValueStr;

        if (uri) {
            this.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [uri]
            };
            this.iconPath = new vscode.ThemeIcon('markdown');
        } else if (contextValueStr === 'category') {
            this.iconPath = new vscode.ThemeIcon('folder');
        }
    }
}
