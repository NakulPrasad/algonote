import * as assert from 'assert';
import * as vscode from 'vscode';
import { RevisionTreeProvider } from '../../revisionTree';

suite('Revision Tree Provider Unit Test Suite', () => {
    const provider = new RevisionTreeProvider();

    test('getTreeItem returns the item itself', () => {
        const item = new vscode.TreeItem('Test');
        assert.strictEqual(provider.getTreeItem(item as any), item);
    });

    test('getChildren returns category items when element is undefined', async () => {
        const categories = await provider.getChildren();
        assert.ok(categories);
        assert.strictEqual(categories.length, 2);
        assert.strictEqual(categories[0].label, 'Due for Revision Today');
        assert.strictEqual(categories[1].label, 'Upcoming');
    });

    test('getChildren returns empty array for sub-items/leaves', async () => {
        const categories = await provider.getChildren();
        const firstCategory = categories[0];
        const subItems = await provider.getChildren(firstCategory);
        assert.ok(subItems);
        assert.strictEqual(subItems.length, 0);
    });
});
