import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        // Passed to `--extensionDevelopmentPath`
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // The path to test runner
        // Passed to --extensionTestsPath
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // Path to your local VS Code executable
        const vscodeExecutablePath = 'C:\\Users\\nakul\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe';

        // Run integration tests using local VS Code
        await runTests({ 
            vscodeExecutablePath,
            extensionDevelopmentPath, 
            extensionTestsPath 
        });
    } catch (err) {
        console.error('Failed to run tests', err);
        process.exit(1);
    }
}

main();
