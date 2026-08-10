# 🧠 DSA Note Helper (VS Code Extension)

**DSA Note Helper** is your ultimate study companion for Data Structures and Algorithms. It turns static problem-solving notes into interactive learning tools with AI note filling, active recall quizzes, Copilot chat integration, structural linting, and spaced repetition tracking.

---

## ✨ Features at a Glance

### 1. 🤖 Multi-Provider AI Engine
Choose your favorite AI model in VS Code settings:
- **GitHub Copilot** (Built-in via `vscode.lm` — zero API keys required!)
- **Google Gemini API** (`gemini-1.5-flash`, `gemini-1.5-pro`)
- **Local Ollama** (Offline LLMs like `llama3`, `mistral`, `qwen2.5-coder`)
- **Custom OpenAI-Compatible API** (OpenRouter, DeepSeek, LocalAI, vLLM)

### 2. 💬 Copilot Chat Participant (`@dsa`)
Type `@dsa` directly in the VS Code Copilot Chat sidebar to interact with your active note:
- `@dsa /lint`: Scans your note and reports missing sections or un-replaced placeholders.
- `@dsa /mcq`: Generates 3 active recall quiz questions (with hidden collapsible answer spoilers).
- `@dsa /dryrun`: Outputs a step-by-step variable trace table for your Java solution.
- `@dsa /complexity`: Performs a formal Big-O time and space complexity breakdown.
- `@dsa /template`: Enforces the standard Markdown template structure.

### 3. 🧪 Interactive Active Recall Quiz Engine
Practice and test your retention before interviews!
- **Sidebar Quiz Webview**: Dedicated interactive quiz widget in the Activity Bar.
- **Full Editor Tab**: Run `DSA Note: Open MCQ Quiz Panel` for a wide-screen quiz interface.
- Instant green/red answer verification with detailed AI explanations.

### 4. 🛡️ Structural Linter & Quick Fixes (Lightbulbs 💡)
- Highlights missing mandatory section headers (`# Intuition`, `# Complexity`, `# Edge Cases`) and unfilled placeholders (e.g. `[Insert problem description here]`).
- Click the VS Code **Quick Fix Lightbulb** 💡 to auto-fill missing details using AI or enforce standard formatting.

### 5. 📊 Revision Dashboard (Spaced Repetition)
- Activity Bar TreeView (`dsa-helper-revision`) that organizes your workspace notes into **Due for Revision Today** vs **Upcoming** based on revision status.

### 6. ⚡ Smart Inline Completions & Snippets
Type triggers in Markdown or Java files to auto-expand templates:
- `dsa-dp-table` $\rightarrow$ Generates DP State Transition Table in Markdown.
- `dsa-dryrun-table` $\rightarrow$ Inserts variable trace table skeleton.
- `dsa-dsu` $\rightarrow$ Injects complete Java Disjoint Set Union (Union-Find) class implementation.

---

## ⚙️ Extension Settings

Customize settings in `Settings -> DSA Note Helper` or your `settings.json`:

```json
{
  // Select AI Provider: "copilot" | "gemini" | "ollama" | "custom"
  "dsa-helper.aiProvider": "copilot",

  // Copilot Model Preference
  "dsa-helper.copilotModel": "gpt-4o",

  // Google Gemini Configuration
  "dsa-helper.geminiApiKey": "YOUR_GEMINI_API_KEY",
  "dsa-helper.geminiModel": "gemini-1.5-flash",

  // Local Ollama Configuration
  "dsa-helper.ollamaUrl": "http://localhost:11434",
  "dsa-helper.ollamaModel": "llama3",

  // Custom API Configuration (DeepSeek, OpenRouter, etc.)
  "dsa-helper.customEndpoint": "https://api.deepseek.com/v1",
  "dsa-helper.customApiKey": "YOUR_CUSTOM_KEY",
  "dsa-helper.customModel": "deepseek-chat"
}
```

---

## ⌨️ Available Commands

| Command Title | ID | Description |
|:---|:---|:---|
| **DSA Note: Enforce Template** | `dsa-helper.enforceTemplate` | Standardizes current Markdown note formatting |
| **DSA Note: Fill Details with AI** | `dsa-helper.fillDetails` | Auto-fills intuition, Big-O complexity, and edge cases |
| **DSA Note: Start MCQ Quiz** | `dsa-helper.startQuiz` | Focuses Quiz panel and generates AI questions |
| **DSA Note: Open MCQ Quiz Panel** | `dsa-helper.openQuizPanel` | Opens quiz as a full editor tab |
| **DSA Note: Refresh Revision Sidebar** | `dsa-helper.showRevisionTree` | Refreshes the revision tree view |

---

## 🚀 Installation

Install the `.vsix` file using VS Code CLI:

```powershell
code --install-extension "dsa-note-helper-0.1.3.vsix"
```
