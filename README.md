# 🧠 AlgoNote AI (VS Code Extension)

**AlgoNote AI** is your ultimate note-first study companion for Data Structures and Algorithms. It turns static problem-solving notes into interactive learning tools with active recall quizzes, mock interview simulators, timed grill modes, structural linting, and spaced repetition revision tracking.

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/NakulMahato.algonote?style=for-the-badge&logo=visual-studio-code&label=VS%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=NakulMahato.algonote)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/NakulMahato.algonote?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=NakulMahato.algonote)

🛍️ **VS Code Marketplace:** [https://marketplace.visualstudio.com/items?itemName=NakulMahato.algonote](https://marketplace.visualstudio.com/items?itemName=NakulMahato.algonote)  
🌐 **Website & Live Demo:** [https://nakulprasad.github.io/algonote/](https://nakulprasad.github.io/algonote/)  
📦 **Download Latest Release:** [GitHub Release v0.1.19](https://github.com/NakulPrasad/algonote/releases/tag/v0.1.19)

---

## 📝 The Core Philosophy: Note-Taking First

In **AlgoNote AI**, the study note is the foundation of everything. Before running active recall quizzes, interactive mock interviews, or timed grill modes, the extension runs a **Pre-flight Check**:
1. **Template Completeness Check:** Verifies that your note template is fully filled with no empty fields or unresolved `[Placeholder]` tags.
2. **Code Verification:** Checks that code inside the Java block is syntactically sound and ready before quizzing you on it.

---

## ✨ Features at a Glance

### 1. 🛡️ Pre-flight Note & Code Validation
Runs automatic structural diagnostics on active notes, prompting you to finish filling out key templates and resolving code syntax issues before attempting practice sessions.

### 2. 🧪 Code-Blank MCQs & Active Recall
Practice questions are generated directly from your active note. The engine blanks out 1-2 lines from your *own code* inside the notes and quizzes you on identifying the missing logic.

### 3. 💬 Copilot Chat Participant (`@algo`)
Type `@algo` directly in the VS Code Copilot Chat sidebar to interact with your active note using specialized slash commands:
- `@algo /interview`: Starts a note-driven mock interview where the AI reviews your approach and asks target follow-ups.
- `@algo /grill`: Starts a timed drill session with anti-cheat window focus detection to simulate real interview pressure.
- `@algo /mcq`: Generates 3 active recall questions with hidden collapsible spoiler answers.
- `@algo /lint`: Audits active note structure for missing headers or placeholders.
- `@algo /dryrun`: Generates step-by-step trace tables for your solutions.
- `@algo /complexity`: Performs time and space complexity analysis.

### 4. 🤖 Multi-Provider AI Engine
Choose your favorite AI model in VS Code settings:
- **GitHub Copilot** (Built-in via `vscode.lm` — zero API keys required!)
- **Google Gemini API** (`gemini-1.5-flash`, `gemini-1.5-pro`)
- **Local Ollama** (Offline LLMs like `llama3`, `mistral`, `qwen2.5-coder`)
- **Custom OpenAI-Compatible API** (OpenRouter, DeepSeek, LocalAI, vLLM)

### 5. 📊 Revision Dashboard (Spaced Repetition)
An Activity Bar TreeView (`algonote-revision`) that automatically scans your workspace markdown notes and organizes them into **Due for Revision Today** vs **Upcoming** folders.

### 6. ⚡ Smart Inline Completions & Snippets
Expand structural structures inside markdown and java files:
- `dsa-dp-table` $\rightarrow$ Generates DP State Transition Table in Markdown.
- `dsa-dryrun-table` $\rightarrow$ Inserts variable trace table skeleton.
- `dsa-dsu` $\rightarrow$ Injects complete Java Disjoint Set Union class implementation.

---

## ⚙️ Extension Settings

Customize settings in `Settings -> AlgoNote AI` or your `settings.json`:

```json
{
  // Select AI Provider: "copilot" | "gemini" | "ollama" | "custom"
  "algonote.aiProvider": "copilot",

  // Copilot Model Preference
  "algonote.copilotModel": "gpt-4o",

  // Google Gemini Configuration
  "algonote.geminiApiKey": "YOUR_GEMINI_API_KEY",
  "algonote.geminiModel": "gemini-1.5-flash",

  // Local Ollama Configuration
  "algonote.ollamaUrl": "http://localhost:11434",
  "algonote.ollamaModel": "llama3",

  // Custom API Configuration (DeepSeek, OpenRouter, etc.)
  "algonote.customEndpoint": "https://api.deepseek.com/v1",
  "algonote.customApiKey": "YOUR_CUSTOM_KEY",
  "algonote.customModel": "deepseek-chat",

  // Select where Quiz panel launches: "sidebar" | "editor-one" | "editor-two" | "browser"
  "algonote.quizLocation": "sidebar"
}
```

---

## ⌨️ Available Commands

| Command Title | ID | Description |
|:---|:---|:---|
| **AlgoNote: Enforce Template** | `algonote.enforceTemplate` | Standardizes current Markdown note formatting |
| **AlgoNote: Fill Details with AI** | `algonote.fillDetails` | Auto-fills intuition, complexities, and edge cases |
| **AlgoNote: Start MCQ Quiz** | `algonote.startQuiz` | Focuses Quiz panel and generates AI questions |
| **AlgoNote: Open MCQ Quiz Panel** | `algonote.openQuizPanel` | Opens quiz as a full editor tab |
| **AlgoNote: Refresh Revision Sidebar** | `algonote.showRevisionTree` | Refreshes the revision tree view |
| **AlgoNote: New Problem Note** | `algonote.createProblemNote` | Creates a new note template file |

---

## 🚀 Installation

Install the `.vsix` package using VS Code CLI:

```powershell
code --install-extension "algonote-0.1.11.vsix"
```

