# 🧠 AlgoNote Project Analysis & Onboarding Guide

Welcome to the **AlgoNote** workspace! This document provides a high-level overview of the architecture, key components, configuration keys, commands, and the test suite configuration of this project. Reading this file will get any new agent or developer up to speed immediately.

---

## 🛠️ Technology Stack & Project Structure

- **Language & Platform**: TypeScript, VS Code Extension API.
- **Frontend / Landing Webpage**: Located in the [website/](file:///d:/Desktop/Projects/algonote/website) folder, structured in vanilla HTML/JS/CSS.
- **Extension Code**: All source code files reside under the [src/](file:///d:/Desktop/Projects/algonote/src) directory.

### Key Directory Layout

```text
algonote/
├── .vscode/               # Workspace launch and task configuration files
├── src/                   # Extension source code
│   ├── test/              # Unit test runner and test suites
│   │   ├── runTest.ts     # Launch script for @vscode/test-electron
│   │   └── suite/         # Unit test suites (*.test.ts)
│   ├── aiService.ts       # AI providers configuration & note-filling logic
│   ├── chatParticipant.ts # @algo Chat Participant commands (lint, mcq, dryrun, etc.)
│   ├── codeActions.ts     # CodeActions (Quick Fix lightbulbs) provider
│   ├── completionProvider.ts # Inline code and template snippet completion
│   ├── extension.ts       # Extension main activation entry point
│   ├── formatter.ts       # Enforces standard Markdown templates
│   ├── linter.ts          # Checks for missing headers and template placeholders
│   ├── mcqView.ts         # Sidebar & panel MCQ WebView Provider
│   └── revisionTree.ts    # Revision Tree view (spaced repetition)
├── website/               # Vanilla landing page for AlgoNote
├── package.json           # Extension manifests, commands, view IDs, and configurations
└── tsconfig.json          # TypeScript compilation options
```

---

## 🚀 Key Features & Extension Components

### 1. Multi-Provider AI Engine ([aiService.ts](file:///d:/Desktop/Projects/algonote/src/aiService.ts))
Exposes the `askAI()` helper, which reads configuration properties under `algonote.*` and routes requests to the appropriate model:
- **GitHub Copilot**: Built-in, uses the VS Code `vscode.lm` language model APIs.
- **Google Gemini**: Connects using a Gemini API Key.
- **Ollama**: Connects to a local server.
- **Custom**: Connects to any OpenAI-compatible custom endpoint.

### 2. `@algo` Chat Participant ([chatParticipant.ts](file:///d:/Desktop/Projects/algonote/src/chatParticipant.ts))
Directly integrates into Copilot Chat. Users can trigger commands by typing:
- `@algo /lint`: Scans active note and lists structural issues.
- `@algo /mcq`: Generates 3 practice questions with details-hidden answer spoilers.
- `@algo /dryrun`: Outputs a trace table for Java code.
- `@algo /complexity`: Performs time and space Big-O complexity analysis.
- `@algo /template`: Normalizes structural headers.

### 3. Structural Linter & Formatters ([linter.ts](file:///d:/Desktop/Projects/algonote/src/linter.ts) & [formatter.ts](file:///d:/Desktop/Projects/algonote/src/formatter.ts))
- **Linter**: Adds warnings if required sections (`## 📝 Problem Statement`, `## 💡 Intuition & Core Approach`, etc.) or default placeholders (e.g. `[Insert problem description here]`) are present in Markdown files.
- **Formatter**: Reorganizes Markdown files into a standard structure, parsing difficulty prefixes (e.g. `E. `, `M. `, `H. `) from filenames.

### 4. Interactive MCQ WebView ([mcqView.ts](file:///d:/Desktop/Projects/algonote/src/mcqView.ts))
Registers `algonote-quiz` in the Activity Bar sidebar and resolves webviews to display interactive active recall multiple-choice quizzes generated dynamically by AI.

### 5. Revision Spaced Repetition Tree ([revisionTree.ts](file:///d:/Desktop/Projects/algonote/src/revisionTree.ts))
Exposes `algonote-revision` inside the sidebar, analyzing Markdown files to categorize them into "Due for Revision Today" vs "Upcoming".

---

## 🧪 Testing Setup & Execution

- **Framework**: Mocha (`tdd` UI) + `@vscode/test-electron` for launching a sandboxed VS Code instance.
- **Test Entry Point**: [runTest.ts](file:///d:/Desktop/Projects/algonote/src/test/runTest.ts) downloads VS Code stable and runs tests.
- **Suite Configurations**: [index.ts](file:///d:/Desktop/Projects/algonote/src/test/suite/index.ts) loads compiled `*.test.js` files using `glob`.

### Running Tests
To run all tests locally, compile TypeScript and start the runner:
```powershell
npm run compile
npm test
```

---

## 📝 Important Extension Identifiers

Use the following identifiers in `package.json` and code when contributing:
- **Configuration Section**: `algonote` (e.g., config properties: `algonote.aiProvider`, `algonote.geminiApiKey`, etc.)
- **Command Prefix**: `algonote.` (e.g., `algonote.enforceTemplate`, `algonote.fillDetails`, `algonote.startQuiz`)
- **Webview Sidebar View ID**: `algonote-quiz`
- **Revision Sidebar View ID**: `algonote-revision`
- **Chat Participant ID**: `algonote.algo` (trigger name: `@algo`)
