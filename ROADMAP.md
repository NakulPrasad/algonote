# 🗺️ AlgoNote Feature Roadmap: v1.0 & v2.0 Releases

This roadmap outlines the plan for stabilizing the core application for the stable **v1.0** release and introducing advanced, futuristic capabilities in **v2.0**.

---

## 🚀 v1.0 Stable Release: Polish, Reliability & Integration
The goal of v1.0 is to perfect the user experience, stabilize the multi-provider AI engine, and add key retention tracking features.

### 📅 Spaced Repetition & Study Logging
- **Frontmatter Note Logger**: Automatically append study logs, revision streaks, and quiz histories inside the Markdown note's frontmatter metadata block when a quiz is completed.
- **Custom Spaced Repetition Intervals**: Allow users to adjust repetition interval days (e.g., SM-2 algorithm parameters: 1, 3, 7, 14, 30 days) directly from the settings panel.
- **Tagging & Filtering**: Support sorting and grouping the Revision Dashboard by topic tags (e.g., `#dp`, `#graphs`, `#sliding-window`) and difficulty.

### 🧪 Advanced Practice Quizzes
- **Flashcard Study Mode**: Add a flashcard mode in the editor panel showing a concept, question, or dry run on the front, and code/explanation on the back with user self-grading.
- **Quiz Performance Analytics**: A dashboard tracking quiz scores over time to visualize retention progress per topic.

### 🎨 Visual & Structural Improvements
- **Language snippet templates**: Add structured templates for Python, C++, and Javascript alongside Java.
- **Webview Theme Integration**: Fully style scrollbars, dropdowns, and input elements using matching VS Code Theme tokens (`var(--vscode-...)`).

---

## 🔮 v2.0 Release: Real-time Execution, Audio & Gamification
v2.0 focuses on interactive learning tools, AI execution sandboxes, audio integrations, and gamification.

### 💻 Real-Time Execution Sandbox & Visualizer
- **Local Runtime Sandbox**: Safely run user code blocks (Java, Python, JS) directly inside the webview editor.
- **Pointer/Variable Graph Visualizer**: Graphically map data structures (trees, lists, heaps, maps) and variables during code execution (similar to Python Tutor).

### 🎙️ AI Voice Coaching (Audio Interviews)
- **Voice Mock Interviews**: Integrate speech-to-text (STT) and text-to-speech (TTS) into the Web Playground so users can speak their answers out loud during mock interviews.

### 👥 Collaboration & Peer Review
- **Share Study Session Logs**: Export revision summaries, mock interview logs, or notes to GitHub Gist or a web dashboard.
- **Collaborative Challenge Lobby**: Joint multiplayer "Grill Mode" sessions where peers can tackle quiz challenges together.

### 🏆 Gamification & Goals
- **Daily Coding Goals**: Set goals (e.g. "Solve 3 Binary Search questions this week") with streak counters, badges, and reminder notifications.
- **LeetCode Sync**: Automatically pull LeetCode submission statistics and match them to your local note revisions.
