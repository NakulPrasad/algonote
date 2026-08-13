// Main AlgoNote Playground Application

import { lintNote, parseNoteData, getBoilerplate } from './modules/linter.js';
import { generateQuiz } from './modules/quizGenerator.js';
import { MockInterviewSession } from './modules/mockInterview.js';
import { loadDryRun, generateGenericTrace } from './modules/dryRun.js';

// Pre-configured sample notes
const SAMPLE_NOTES = {
  'two-sum': `# E. Two Sum

> **Difficulty:** Easy  
> **Topic / Pattern:** [HashMap / Complement]  
> **Link:** [LeetCode](https://leetcode.com/problems/two-sum/)

---

## 📝 Problem Statement

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.
You may assume that each input would have exactly one solution, and you may not use the same element twice.

### Examples
\`\`\`text
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
\`\`\`

---

## 💡 Intuition & Core Approach

* **The Core Idea:** Instead of scanning the array for each number with a nested loop (O(N^2) time), we can store the complements of numbers we have already seen in a HashMap.
* **Key Steps:**
  - For each number \`nums[i]\`, calculate its complement: \`target - nums[i]\`.
  - If the complement already exists in our HashMap, it means we found the pair! Return their indices.
  - Otherwise, store the current number \`nums[i]\` and its index \`i\` in the map.

---

## 💻 Implementation (Java)

\`\`\`java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}
\`\`\`

---

## 📊 Complexity Analysis

| Metric | Complexity | Explanation |
| :--- | :--- | :--- |
| **Time Complexity** | $O(N)$ | We traverse the list containing $N$ elements exactly once. Each look-up in the table costs only $O(1)$ time. |
| **Space Complexity** | $O(N)$ | The extra space required depends on the number of items stored in the hash table, which stores at most $N$ elements. |

---

## ⚠️ Edge Cases & Pitfalls to Avoid

* **Edge Case 1:** Duplicate values in input. A HashMap can handle duplicates since we match complements immediately before inserting the current value.
`,
  'valid-parentheses': `# M. Valid Parentheses

> **Difficulty:** Medium  
> **Topic / Pattern:** [Stack]  
> **Link:** [LeetCode](https://leetcode.com/problems/valid-parentheses/)

---

## 📝 Problem Statement

Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.
An input string is valid if opening brackets are closed by the same type of brackets, and closed in the correct order.

### Examples
\`\`\`text
Input: s = "()[]{}"
Output: true
\`\`\`

---

## 💡 Intuition & Core Approach

* **The Core Idea:** We use a Stack to track open brackets. A stack is Last-In-First-Out (LIFO), which perfectly mirrors the nested nature of balanced parentheses.
* **Key Steps:**
  - Loop through each character in the string.
  - If it is an opening bracket, push its expected closing bracket onto the stack.
  - If it is a closing bracket, pop the top of the stack and verify it matches the current bracket.
  - At the end, check if the stack is empty (if not, we have unmatched open brackets).

---

## 💻 Implementation (Java)

\`\`\`java
class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c)
                return false;
        }
        return stack.isEmpty();
    }
}
\`\`\`

---

## 📊 Complexity Analysis

| Metric | Complexity | Explanation |
| :--- | :--- | :--- |
| **Time Complexity** | $O(N)$ | We traverse the string containing $N$ elements exactly once. Stack operations push and pop cost $O(1)$. |
| **Space Complexity** | $O(N)$ | In the worst case, the stack can grow to size $N$ (e.g., all open brackets like "(((((("). |

---

## ⚠️ Edge Cases & Pitfalls to Avoid

* **Edge Case 1:** Only closing brackets (e.g., "]]"). The stack is empty when popping, which must return false.
`,
  'binary-tree-inorder': `# M. Binary Tree Inorder Traversal

> **Difficulty:** Medium  
> **Topic / Pattern:** [Binary Tree / DFS]  
> **Link:** [LeetCode](https://leetcode.com/problems/binary-tree-inorder-traversal/)

---

## 📝 Problem Statement

Given the \`root\` of a binary tree, return the inorder traversal of its nodes' values.

### Examples
\`\`\`text
Input: root = [1,null,2,3]
Output: [1,3,2]
\`\`\`

---

## 💡 Intuition & Core Approach

* **The Core Idea:** DFS recursion following Left -> Root -> Right visiting order.
* **Key Steps:**
  - If the node is null, return.
  - Recursively visit node.left.
  - Process/add node.val to results.
  - Recursively visit node.right.

---

## 💻 Implementation (Java)

\`\`\`java
class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        helper(root, res);
        return res;
    }

    private void helper(TreeNode node, List<Integer> res) {
        if (node == null) return;
        helper(node.left, res);
        res.add(node.val);
        helper(node.right, res);
    }
}
\`\`\`

---

## 📊 Complexity Analysis

| Metric | Complexity | Explanation |
| :--- | :--- | :--- |
| **Time Complexity** | $O(N)$ | We visit each node in the tree containing $N$ nodes exactly once. |
| **Space Complexity** | $O(D)$ | Space is used by the call stack recursion, bounded by the maximum depth $D$ of the tree (average $O(\\log N)$, worst case $O(N)$). |

---

## ⚠️ Edge Cases & Pitfalls to Avoid

* **Edge Case 1:** Empty tree (root is null). Should return an empty list immediately.
`
};

// Global App State
let activeNoteText = '';
let parsedData = null;
let apiPort = null;
let activeTab = 'problems-tab';

// Quiz Session State
let quizQuestions = [];
let quizCurrentScore = 0;
let quizAnsweredCount = 0;
let quizTimerInterval = null;
let quizSeconds = 0;

// Mock Interview Session
let interviewSession = null;

// Grill Mode State
let grillQuestions = [];
let grillCurrentIndex = 0;
let grillStrikes = 0;
let grillScore = 0;
let grillTimerInterval = null;
let grillTimeRemaining = 20;
let grillActive = false;

// Dry Run State
let activeDryRun = null;
let dryRunTestCaseIndex = 0;
let dryRunStepIndex = 0;
let dryRunPlayInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initApp();
});

function initApp() {
  const editor = document.getElementById('markdown-editor');
  const lineNumbers = document.getElementById('line-numbers');
  const sampleSelect = document.getElementById('sample-notes-select');
  const preflightBtn = document.getElementById('preflight-btn');
  const settingsToggle = document.getElementById('settings-toggle-btn');
  const settingsDrawer = document.getElementById('settings-drawer');
  const settingsClose = document.getElementById('settings-close-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  
  // 1. Line numbers sync and change tracking
  editor.addEventListener('input', () => {
    updateEditorLines();
    onNoteChanged(editor.value);
  });
  
  editor.addEventListener('scroll', () => {
    lineNumbers.scrollTop = editor.scrollTop;
  });

  // 2. Load Sample Note dropdown
  sampleSelect.addEventListener('change', (e) => {
    const noteText = SAMPLE_NOTES[e.target.value];
    if (noteText) {
      editor.value = noteText;
      updateEditorLines();
      onNoteChanged(noteText);
      triggerTab('problems-tab');
    }
  });

  // 3. Preflight action button
  preflightBtn.addEventListener('click', () => {
    const problems = lintNote(editor.value);
    triggerTab('problems-tab');
    if (problems.length === 0) {
      alert('🛡️ Pre-flight Check Successful! Note has no placeholders and all required sections are present.');
    } else {
      alert(`🛡️ Pre-flight check found ${problems.length} warning(s). Fill details or add missing headers.`);
    }
  });

  // 4. Settings Drawer toggle
  const toggleDrawer = (open) => {
    settingsDrawer.classList.toggle('open', open);
    drawerBackdrop.classList.toggle('active', open);
  };
  settingsToggle.addEventListener('click', () => toggleDrawer(true));
  
  const quizSettingsToggle = document.getElementById('quiz-settings-toggle-btn');
  if (quizSettingsToggle) {
    quizSettingsToggle.addEventListener('click', () => toggleDrawer(true));
  }
  const interviewSettingsToggle = document.getElementById('interview-settings-toggle-btn');
  if (interviewSettingsToggle) {
    interviewSettingsToggle.addEventListener('click', () => toggleDrawer(true));
  }

  settingsClose.addEventListener('click', () => toggleDrawer(false));
  drawerBackdrop.addEventListener('click', () => toggleDrawer(false));

  const providerSelect = document.getElementById('ai-provider-select');
  const geminiGroup = document.getElementById('gemini-key-group');
  const geminiInput = document.getElementById('gemini-api-key');

  // Load settings from localStorage
  const savedProvider = localStorage.getItem('algonote_provider') || 'local';
  const savedGeminiKey = localStorage.getItem('algonote_gemini_key') || '';
  
  providerSelect.value = savedProvider;
  geminiInput.value = savedGeminiKey;
  if (savedProvider === 'gemini') geminiGroup.classList.remove('hidden');

  providerSelect.addEventListener('change', (e) => {
    localStorage.setItem('algonote_provider', e.target.value);
    if (e.target.value === 'gemini') {
      geminiGroup.classList.remove('hidden');
    } else {
      geminiGroup.classList.add('hidden');
    }
  });

  geminiInput.addEventListener('input', (e) => {
    localStorage.setItem('algonote_gemini_key', e.target.value);
  });

  // 5. Tabs Navigation
  document.querySelectorAll('.console-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      triggerTab(btn.dataset.tab);
    });
  });

  // 6. Initialize sub-applications
  initQuizApp();
  initInterviewApp();
  initGrillApp();
  initDryRunApp();

  // 7. Parse incoming URL parameters
  parseUrlParams();
}

function triggerTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll('.console-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === tabId);
  });

  // Special triggers when entering tabs
  if (tabId === 'dryrun-tab') {
    onDryRunTabEntered();
  } else if (tabId === 'complexity-tab') {
    onComplexityTabEntered();
  }
}

// URL Params Parser
function parseUrlParams() {
  const hash = window.location.hash;
  if (!hash) {
    // Default load: load Two Sum as sample
    document.getElementById('sample-notes-select').value = 'two-sum';
    const initialText = SAMPLE_NOTES['two-sum'];
    document.getElementById('markdown-editor').value = initialText;
    updateEditorLines();
    onNoteChanged(initialText);
    return;
  }

  const params = new URLSearchParams(hash.slice(1));
  const noteBase64 = params.get('note');
  const port = params.get('port');

  if (port) {
    apiPort = port;
    document.getElementById('ai-provider-select').value = 'local';
    localStorage.setItem('algonote_provider', 'local');
  }

  if (noteBase64) {
    try {
      // Decode unicode base64 correctly
      const decodedText = decodeURIComponent(escape(window.atob(noteBase64)));
      document.getElementById('markdown-editor').value = decodedText;
      updateEditorLines();
      onNoteChanged(decodedText);
      
      // Auto-remove sample select highlight since they imported a custom note
      document.getElementById('sample-notes-select').value = '';
    } catch (e) {
      console.error('Failed to decode note text from URL hash:', e);
      alert('Failed to load note from URL parameters.');
    }
  }
}

// Editor Line Counter
function updateEditorLines() {
  const editor = document.getElementById('markdown-editor');
  const lineNumbers = document.getElementById('line-numbers');
  const lines = editor.value.split('\n').length;
  
  let linesHtml = '';
  for (let i = 1; i <= lines; i++) {
    linesHtml += `${i}<br>`;
  }
  lineNumbers.innerHTML = linesHtml;
  
  // Status text
  document.getElementById('editor-status').innerText = `Lines: ${lines} | Chars: ${editor.value.length}`;
}

// Live Note State Tracker
function onNoteChanged(text) {
  activeNoteText = text;
  parsedData = parseNoteData(text);

  // 1. Run Live Diagnostics
  const problems = lintNote(text);
  renderProblemsList(problems);

  // 2. Update Footer Validation Indicator
  const indicator = document.getElementById('validation-indicator');
  const errors = problems.filter(p => p.severity === 'error');
  if (errors.length > 0) {
    indicator.className = 'indicator-error';
    indicator.innerText = `🔴 Invalid Note: ${errors[0].message}`;
  } else if (problems.length > 0) {
    indicator.className = 'indicator-warning';
    indicator.innerText = `⚠️ Preflight Warning: ${problems.length} structures missing or placeholders present.`;
  } else {
    indicator.className = 'indicator-ok';
    indicator.innerText = `🟢 Note Valid! Pre-flight check passed.`;
  }

  // 3. Clear sessions if note changed significantly
  resetInterview();
  resetDryRun();
}

// Render problems in diagnostics panel
function renderProblemsList(problems) {
  const container = document.getElementById('problems-list');
  if (problems.length === 0) {
    container.innerHTML = `
      <div class="problem-item success">
        <div class="problem-meta">
          <span class="problem-title">🛡️ All Pre-flight checks passed!</span>
          <span class="problem-desc">No placeholder strings found and all required sections are present. Ready for Quiz & Mock Interview simulation!</span>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = problems.map(prob => {
    const isError = prob.severity === 'error';
    const badge = isError ? 'Error' : 'Warning';
    const isHeaderMissing = prob.section === 'Structure';
    const quickFixButton = isHeaderMissing ? `
      <button class="btn-primary-sm" onclick="insertQuickFix('${prob.header.replace(/'/g, "\\'")}')">Quick Fix</button>
    ` : '';
    
    return `
      <div class="problem-item ${isError ? 'error' : ''}">
        <div class="problem-meta">
          <span class="problem-title">${badge}: ${prob.message}</span>
          <span class="problem-desc">Section: ${prob.section}</span>
        </div>
        ${quickFixButton}
      </div>
    `;
  }).join('');
}

// Quick Fix implementation attached to window object so it can be called from inline onclick HTML
window.insertQuickFix = function(sectionHeader) {
  const editor = document.getElementById('markdown-editor');
  const text = editor.value;
  const boilerplate = getBoilerplate(sectionHeader);
  
  // Append boilerplate to end of text
  editor.value = text.trim() + '\n\n' + boilerplate;
  updateEditorLines();
  onNoteChanged(editor.value);
};

// ==========================================================================
// MCQ QUIZ SUB-APPLICATION
// ==========================================================================
function initQuizApp() {
  const generateBtn = document.getElementById('quiz-generate-btn');
  const startCta = document.getElementById('quiz-start-cta');
  
  const triggerQuizGen = async () => {
    const provider = localStorage.getItem('algonote_provider') || 'local';
    const format = document.getElementById('quiz-format-select').value;
    const count = parseInt(document.getElementById('quiz-count').value, 10);
    const apiKey = localStorage.getItem('algonote_gemini_key') || '';
    
    // Validate preflight check
    const problems = lintNote(activeNoteText);
    const errors = problems.filter(p => p.severity === 'error');
    if (errors.length > 0) {
      alert(`Cannot start quiz! ${errors[0].message}`);
      triggerTab('problems-tab');
      return;
    }

    const bodyContainer = document.getElementById('quiz-body');
    bodyContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <span class="dots" style="font-size: 2rem;">⚡ Generating quiz from active note...</span>
      </div>
    `;
    document.getElementById('quiz-progress-container').classList.add('hidden');
    generateBtn.disabled = true;

    try {
      quizQuestions = await generateQuiz(provider, activeNoteText, format, count, {
        port: apiPort,
        apiKey: apiKey
      }, (fallbackProvider) => {
        showToast(`⚠️ Copilot server offline. Fell back to ${fallbackProvider}!`, 'warning');
      });

      if (!quizQuestions || quizQuestions.length === 0) {
        throw new Error('Generated quiz returned empty array of questions.');
      }
      
      startQuizSession();
    } catch (err) {
      alert(err.message);
      bodyContainer.innerHTML = `
        <div class="welcome-screen">
          <h3 style="color: var(--accent-red);">⚡ Generation Failed</h3>
          <p>${err.message}</p>
          <button id="quiz-retry-btn" class="btn-secondary">Try Again</button>
        </div>
      `;
      document.getElementById('quiz-retry-btn')?.addEventListener('click', triggerQuizGen);
    } finally {
      generateBtn.disabled = false;
    }
  };

  generateBtn.addEventListener('click', triggerQuizGen);
  startCta.addEventListener('click', triggerQuizGen);
}

function startQuizSession() {
  quizCurrentScore = 0;
  quizAnsweredCount = 0;
  quizSeconds = 0;
  clearInterval(quizTimerInterval);

  // Set progress and timer
  document.getElementById('quiz-progress-container').classList.remove('hidden');
  updateQuizProgress();
  
  quizTimerInterval = setInterval(() => {
    quizSeconds++;
    const m = Math.floor(quizSeconds / 60).toString().padStart(2, '0');
    const s = (quizSeconds % 60).toString().padStart(2, '0');
    document.getElementById('quiz-timer').innerText = `Timer: ${m}:${s}`;
  }, 1000);

  renderQuizQuestion(0);
}

function updateQuizProgress() {
  const percent = (quizAnsweredCount / quizQuestions.length) * 100;
  document.getElementById('quiz-progress-bar').style.width = `${percent}%`;
}

function renderQuizQuestion(index) {
  const q = quizQuestions[index];
  const bodyContainer = document.getElementById('quiz-body');

  bodyContainer.innerHTML = `
    <div class="card" id="qcard-${index}">
      <div class="quiz-question-text"><strong>Question ${index + 1} of ${quizQuestions.length}:</strong><br><br>${renderTextMarkdown(q.question)}</div>
      <div class="quiz-options">
        ${q.options.map((opt, optIdx) => `
          <button class="quiz-option" onclick="handleSelectAnswer(this, ${index}, ${optIdx})">
            ${String.fromCharCode(65 + optIdx)}) ${renderTextMarkdown(opt)}
          </button>
        `).join('')}
      </div>
      <div id="quiz-feedback-box" class="quiz-feedback hidden"></div>
    </div>
  `;
}

window.handleSelectAnswer = function(btn, qIdx, optIdx) {
  const q = quizQuestions[qIdx];
  const card = btn.parentElement;
  if (card.dataset.answered === 'true') return;
  card.dataset.answered = 'true';

  // Disable all options
  const options = card.querySelectorAll('.quiz-option');
  options.forEach(o => o.disabled = true);

  const isCorrect = (optIdx === q.correctIndex);
  const feedbackBox = document.getElementById('quiz-feedback-box');
  
  if (isCorrect) {
    btn.classList.add('correct');
    quizCurrentScore++;
    feedbackBox.className = 'quiz-feedback';
    feedbackBox.innerHTML = `🎉 <strong>Correct!</strong><br>${renderTextMarkdown(q.explanation)}`;
  } else {
    btn.classList.add('incorrect');
    options[q.correctIndex].classList.add('correct');
    feedbackBox.className = 'quiz-feedback incorrect-fb';
    feedbackBox.innerHTML = `❌ <strong>Incorrect.</strong><br>${renderTextMarkdown(q.explanation)}`;
  }
  
  feedbackBox.classList.remove('hidden');
  quizAnsweredCount++;
  updateQuizProgress();

  // Next Question or Score Report
  setTimeout(() => {
    if (qIdx + 1 < quizQuestions.length) {
      renderQuizQuestion(qIdx + 1);
    } else {
      endQuizSession();
    }
  }, 3500);
};

function endQuizSession() {
  clearInterval(quizTimerInterval);
  document.getElementById('quiz-progress-container').classList.add('hidden');
  
  const m = Math.floor(quizSeconds / 60).toString().padStart(2, '0');
  const s = (quizSeconds % 60).toString().padStart(2, '0');
  const scorePercent = Math.round((quizCurrentScore / quizQuestions.length) * 100);

  const bodyContainer = document.getElementById('quiz-body');
  bodyContainer.innerHTML = `
    <div class="welcome-screen">
      <h3>🏆 Practice Complete!</h3>
      <p style="font-size: 2.5rem; font-weight: 800; color: var(--accent-cyan); margin: 0.5rem 0;">
        ${quizCurrentScore} / ${quizQuestions.length}
      </p>
      <p>Success Rate: <strong>${scorePercent}%</strong><br>Time Taken: <strong>${m}:${s}</strong></p>
      <button id="quiz-restart-btn" class="btn-primary">Restart Practice</button>
    </div>
  `;
  document.getElementById('quiz-restart-btn').addEventListener('click', () => {
    triggerTab('quiz-tab');
    startQuizSession();
  });
}

// Simple Markdown Renderer for plain text questions
function renderTextMarkdown(text) {
  if (!text) return '';
  let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/```[^\n]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  return html;
}

// ==========================================================================
// MOCK INTERVIEW SUB-APPLICATION
// ==========================================================================
function initInterviewApp() {
  const startBtn = document.getElementById('start-interview-btn');
  const sendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input');
  const resetBtn = document.getElementById('reset-interview-btn');

  startBtn.addEventListener('click', async () => {
    // Validate preflight check
    const problems = lintNote(activeNoteText);
    const errors = problems.filter(p => p.severity === 'error');
    if (errors.length > 0) {
      alert(`Cannot start interview! ${errors[0].message}`);
      triggerTab('problems-tab');
      return;
    }

    startBtn.parentElement.classList.add('hidden');
    chatInput.disabled = false;
    sendBtn.disabled = false;

    const provider = localStorage.getItem('algonote_provider') || 'local';
    const apiKey = localStorage.getItem('algonote_gemini_key') || '';

    showTyping(true);
    
    interviewSession = new MockInterviewSession(provider, activeNoteText, {
      port: apiPort,
      apiKey: apiKey
    }, (fallbackProvider) => {
      showToast(`⚠️ Copilot server offline. Fell back to ${fallbackProvider}!`, 'warning');
    });

    try {
      const greeting = await interviewSession.start();
      showTyping(false);
      appendMessage('interviewer', greeting);
    } catch (e) {
      showTyping(false);
      appendMessage('system-message', `Failed to start: ${e.message}`);
    }
  });

  const handleSend = async () => {
    const text = chatInput.value.trim();
    if (!text || !interviewSession) return;

    chatInput.value = '';
    appendMessage('user', text);
    showTyping(true);

    try {
      const reply = await interviewSession.sendMessage(text);
      showTyping(false);
      appendMessage('interviewer', reply);
    } catch (e) {
      showTyping(false);
      appendMessage('system-message', `Failed to fetch response: ${e.message}`);
    }
  };

  sendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  resetBtn.addEventListener('click', resetInterview);
}

function resetInterview() {
  interviewSession = null;
  const startBtn = document.getElementById('start-interview-btn');
  if (startBtn) startBtn.parentElement.classList.remove('hidden');
  
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  if (chatInput) {
    chatInput.value = '';
    chatInput.disabled = true;
  }
  if (sendBtn) sendBtn.disabled = true;

  const msgBox = document.getElementById('interview-messages');
  if (msgBox) {
    msgBox.innerHTML = `
      <div class="message system-message">
        <span>The interviewer is reading your note. Ask a question or click "Start Interview" to begin.</span>
      </div>
    `;
  }
}

function appendMessage(role, text) {
  const box = document.getElementById('interview-messages');
  if (!box) return;

  const bubble = document.createElement('div');
  bubble.className = `message ${role}`;
  bubble.innerHTML = renderTextMarkdown(text);
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
}

function showTyping(show) {
  const typing = document.getElementById('chat-typing');
  if (typing) typing.classList.toggle('hidden', !show);
}

// ==========================================================================
// TIMED GRILL MODE
// ==========================================================================
function initGrillApp() {
  const startBtn = document.getElementById('start-grill-btn');
  const resumeBtn = document.getElementById('resume-grill-btn');

  startBtn.addEventListener('click', async () => {
    // Validate preflight check
    const problems = lintNote(activeNoteText);
    const errors = problems.filter(p => p.severity === 'error');
    if (errors.length > 0) {
      alert(`Cannot start Grill Mode! ${errors[0].message}`);
      triggerTab('problems-tab');
      return;
    }

    // Load quiz questions
    const provider = localStorage.getItem('algonote_provider') || 'local';
    const apiKey = localStorage.getItem('algonote_gemini_key') || '';
    
    document.getElementById('grill-intro').classList.add('hidden');
    const playPanel = document.getElementById('grill-play');
    playPanel.classList.remove('hidden');
    playPanel.innerHTML = `<div style="text-align: center; padding: 2rem;"><span class="dots">⚡ Preparing grill questions...</span></div>`;

    try {
      grillQuestions = await generateQuiz(provider, activeNoteText, 'multiple-choice', 5, {
        port: apiPort,
        apiKey: apiKey
      }, (fallbackProvider) => {
        showToast(`⚠️ Copilot server offline. Fell back to ${fallbackProvider}!`, 'warning');
      });

      if (!grillQuestions || grillQuestions.length === 0) {
        throw new Error('Grill questions failed to generate.');
      }

      startGrillSession();
    } catch (e) {
      alert(e.message);
      document.getElementById('grill-intro').classList.remove('hidden');
      playPanel.classList.add('hidden');
    }
  });

  // Focus anti-cheat tracker
  window.addEventListener('blur', () => {
    if (grillActive) {
      grillStrikes++;
      updateGrillStrikes();
      showCheatOverlay(true);
      clearInterval(grillTimerInterval);
    }
  });

  resumeBtn.addEventListener('click', () => {
    showCheatOverlay(false);
    if (grillActive) {
      if (grillStrikes >= 3) {
        endGrillSession(true); // Failure due to strikes
      } else {
        resumeGrillTimer();
      }
    }
  });
}

function startGrillSession() {
  grillCurrentIndex = 0;
  grillStrikes = 0;
  grillScore = 0;
  grillActive = true;

  const playPanel = document.getElementById('grill-play');
  playPanel.innerHTML = `
    <div class="grill-header">
      <div class="grill-score">Question <span id="grill-current-index">1</span>/<span id="grill-total-count">5</span></div>
      <div class="grill-strikes">Strikes: <span id="grill-strike-counter"></span></div>
      <div class="grill-timer-ring">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"></circle>
          <circle id="timer-circle-progress" cx="20" cy="20" r="16" fill="none" stroke="var(--accent-red)" stroke-width="3" stroke-dasharray="100.5" stroke-dashoffset="0" transform="rotate(-90 20 20)"></circle>
        </svg>
        <span id="grill-time-text">20</span>
      </div>
    </div>
    
    <div id="grill-question-card" class="card">
      <!-- Question content -->
    </div>
  `;

  updateGrillStrikes();
  loadGrillQuestion(0);
}

function updateGrillStrikes() {
  const strikesBox = document.getElementById('grill-strike-counter');
  if (!strikesBox) return;

  let strikeString = '';
  for (let i = 0; i < 3; i++) {
    strikeString += i < grillStrikes ? '❌' : '⚪';
  }
  strikesBox.innerText = strikeString;
}

function showCheatOverlay(show) {
  const overlay = document.getElementById('grill-cheat-overlay');
  const strikesAlert = overlay.querySelector('.strike-alert-symbols');
  strikesAlert.innerText = '❌'.repeat(grillStrikes);
  overlay.classList.toggle('hidden', !show);
}

function loadGrillQuestion(index) {
  const q = grillQuestions[index];
  document.getElementById('grill-current-index').innerText = index + 1;
  document.getElementById('grill-total-count').innerText = grillQuestions.length;

  const qCard = document.getElementById('grill-question-card');
  qCard.dataset.answered = 'false';
  qCard.innerHTML = `
    <div class="quiz-question-text">${renderTextMarkdown(q.question)}</div>
    <div class="quiz-options">
      ${q.options.map((opt, optIdx) => `
        <button class="quiz-option" onclick="handleGrillAnswer(this, ${index}, ${optIdx})">
          ${String.fromCharCode(65 + optIdx)}) ${renderTextMarkdown(opt)}
        </button>
      `).join('')}
    </div>
  `;

  grillTimeRemaining = 20;
  resumeGrillTimer();
}

function resumeGrillTimer() {
  clearInterval(grillTimerInterval);
  updateGrillCircle();

  grillTimerInterval = setInterval(() => {
    grillTimeRemaining--;
    document.getElementById('grill-time-text').innerText = grillTimeRemaining;
    updateGrillCircle();

    if (grillTimeRemaining <= 0) {
      clearInterval(grillTimerInterval);
      // Timeout: trigger wrong answer automatically
      grillStrikes++;
      updateGrillStrikes();
      
      const options = document.getElementById('grill-question-card').querySelectorAll('.quiz-option');
      options.forEach(o => o.disabled = true);
      options[grillQuestions[grillCurrentIndex].correctIndex].classList.add('correct');

      setTimeout(() => {
        if (grillStrikes >= 3) {
          endGrillSession(true);
        } else if (grillCurrentIndex + 1 < grillQuestions.length) {
          grillCurrentIndex++;
          loadGrillQuestion(grillCurrentIndex);
        } else {
          endGrillSession(false);
        }
      }, 2000);
    }
  }, 1000);
}

function updateGrillCircle() {
  const circle = document.getElementById('timer-circle-progress');
  if (!circle) return;

  const circumference = 2 * Math.PI * 16; // ~100.53
  const offset = circumference - (grillTimeRemaining / 20) * circumference;
  circle.style.strokeDashoffset = offset;
}

window.handleGrillAnswer = function(btn, qIdx, optIdx) {
  const q = grillQuestions[qIdx];
  const card = btn.parentElement;
  if (card.dataset.answered === 'true') return;
  card.dataset.answered = 'true';
  clearInterval(grillTimerInterval);

  const options = card.querySelectorAll('.quiz-option');
  options.forEach(o => o.disabled = true);

  const isCorrect = (optIdx === q.correctIndex);
  if (isCorrect) {
    btn.classList.add('correct');
    grillScore++;
  } else {
    btn.classList.add('incorrect');
    options[q.correctIndex].classList.add('correct');
    grillStrikes++;
    updateGrillStrikes();
  }

  setTimeout(() => {
    if (grillStrikes >= 3) {
      endGrillSession(true);
    } else if (qIdx + 1 < grillQuestions.length) {
      grillCurrentIndex++;
      loadGrillQuestion(grillCurrentIndex);
    } else {
      endGrillSession(false);
    }
  }, 2500);
};

function endGrillSession(failed) {
  grillActive = false;
  clearInterval(grillTimerInterval);

  const playPanel = document.getElementById('grill-play');
  const percent = Math.round((grillScore / grillQuestions.length) * 100);
  const isPass = percent >= 80 && !failed;

  playPanel.innerHTML = `
    <div class="welcome-screen">
      ${isPass ? `
        <h2 style="color: var(--accent-green); font-size: 2rem;">🏆 CHALLENGE PASSED!</h2>
        <p>Excellent focus under pressure.</p>
      ` : `
        <h2 style="color: var(--accent-red); font-size: 2rem;">❌ CHALLENGE FAILED</h2>
        <p>${failed ? 'Failed due to Focus anti-cheat strikes.' : 'Score below 80% passing threshold.'}</p>
      `}
      <p style="font-size: 3rem; font-weight: 800; color: var(--accent-cyan); margin: 1rem 0;">
        ${grillScore} / ${grillQuestions.length}
      </p>
      <p>Passing Rate: <strong>80%</strong> | Your Rate: <strong>${percent}%</strong></p>
      <p>Strikes Registered: <strong>${grillStrikes} / 3</strong></p>
      <button id="grill-restart-btn" class="btn-danger">Retry Grill Challenge</button>
    </div>
  `;

  document.getElementById('grill-restart-btn').addEventListener('click', () => {
    document.getElementById('grill-intro').classList.remove('hidden');
    playPanel.classList.add('hidden');
  });
}

// ==========================================================================
// VARIABLE DRY RUN SIMULATOR
// ==========================================================================
function initDryRunApp() {
  const prevBtn = document.getElementById('dryrun-prev-btn');
  const nextBtn = document.getElementById('dryrun-next-btn');
  const playBtn = document.getElementById('dryrun-play-btn');
  const select = document.getElementById('dryrun-testcase-select');

  const onSelectCase = () => {
    if (!activeDryRun) return;
    const testcase = activeDryRun.testcases[select.selectedIndex];
    if (!testcase) return;
    
    dryRunTestCaseIndex = select.selectedIndex;
    dryRunStepIndex = 0;
    renderDryRunStep();
  };

  select.addEventListener('change', onSelectCase);

  prevBtn.addEventListener('click', () => {
    if (dryRunStepIndex > 0) {
      dryRunStepIndex--;
      renderDryRunStep();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (activeDryRun) {
      const testcase = activeDryRun.testcases[dryRunTestCaseIndex];
      if (dryRunStepIndex + 1 < testcase.steps.length) {
        dryRunStepIndex++;
        renderDryRunStep();
      }
    }
  });

  playBtn.addEventListener('click', () => {
    if (dryRunPlayInterval) {
      // Pause
      clearInterval(dryRunPlayInterval);
      dryRunPlayInterval = null;
      playBtn.innerText = '▶️ Play';
    } else {
      // Play
      playBtn.innerText = '⏸️ Pause';
      dryRunPlayInterval = setInterval(() => {
        const testcase = activeDryRun.testcases[dryRunTestCaseIndex];
        if (dryRunStepIndex + 1 < testcase.steps.length) {
          dryRunStepIndex++;
          renderDryRunStep();
        } else {
          clearInterval(dryRunPlayInterval);
          dryRunPlayInterval = null;
          playBtn.innerText = '▶️ Play';
        }
      }, 1500);
    }
  });
}

function resetDryRun() {
  activeDryRun = null;
  dryRunStepIndex = 0;
  clearInterval(dryRunPlayInterval);
  dryRunPlayInterval = null;
}

function onDryRunTabEntered() {
  if (activeDryRun) return; // Already loaded

  const select = document.getElementById('dryrun-testcase-select');
  select.innerHTML = '';
  resetDryRun();

  // Heuristic matching for preconfigured traces
  const noteTitle = parsedData.title.toLowerCase();
  let key = '';
  if (noteTitle.includes('two sum')) key = 'two-sum';
  else if (noteTitle.includes('parentheses')) key = 'valid-parentheses';
  else if (noteTitle.includes('inorder')) key = 'binary-tree-inorder';

  if (key) {
    activeDryRun = loadDryRun(key);
  } else {
    // Generate fallback generic debugger trace
    activeDryRun = generateGenericTrace(parsedData.code);
  }

  // Populate test cases
  activeDryRun.testcases.forEach((tc, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.innerText = tc.name;
    select.appendChild(opt);
  });
  
  select.selectedIndex = 0;
  dryRunTestCaseIndex = 0;
  
  // Render code wrapper
  const codeLines = activeDryRun.code.split('\n');
  const codeDisplay = document.getElementById('dryrun-code-display');
  codeDisplay.innerHTML = codeLines.map((line, idx) => `
    <span class="dryrun-code-line" id="dr-line-${idx + 1}">${escapeHtml(line)}</span>
  `).join('');

  renderDryRunStep();
}

function renderDryRunStep() {
  if (!activeDryRun) return;
  const testcase = activeDryRun.testcases[dryRunTestCaseIndex];
  const step = testcase.steps[dryRunStepIndex];
  if (!step) return;

  // Highlight active line
  document.querySelectorAll('.dryrun-code-line').forEach(l => l.classList.remove('active-line'));
  const activeLineEl = document.getElementById(`dr-line-${step.line}`);
  if (activeLineEl) {
    activeLineEl.classList.add('active-line');
    // Scroll into view if needed
    activeLineEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // Update step labels
  document.getElementById('dryrun-step-display').innerText = `Step ${dryRunStepIndex + 1} / ${testcase.steps.length}`;
  document.getElementById('dryrun-prev-btn').disabled = dryRunStepIndex === 0;
  document.getElementById('dryrun-next-btn').disabled = dryRunStepIndex === testcase.steps.length - 1;
  document.getElementById('dryrun-play-btn').disabled = testcase.steps.length <= 1;

  // Build Trace Variables Table
  const tableHeader = document.getElementById('trace-header-row');
  const tableBody = document.getElementById('trace-body');
  
  // Dynamic header variables
  const variables = Object.keys(step.vars);
  tableHeader.innerHTML = `
    <th>Line</th>
    ${variables.map(v => `<th>${escapeHtml(v)}</th>`).join('')}
    <th>Explanation</th>
  `;

  // Render trace rows: show previous steps in grey and highlight changes in active row
  let tbodyHtml = '';
  // Show up to 4 previous trace rows for timeline context
  const startIdx = Math.max(0, dryRunStepIndex - 3);
  for (let i = startIdx; i <= dryRunStepIndex; i++) {
    const s = testcase.steps[i];
    const isActiveRow = i === dryRunStepIndex;
    
    tbodyHtml += `
      <tr class="${isActiveRow ? 'active-row' : ''}" style="opacity: ${isActiveRow ? 1 : 0.4};">
        <td>Line ${s.line}</td>
        ${variables.map(v => {
          const val = s.vars[v] !== undefined ? s.vars[v] : '-';
          // Check if variable changed from previous step to add a transition flash
          const prevVal = i > 0 ? testcase.steps[i - 1].vars[v] : undefined;
          const isChanged = isActiveRow && prevVal !== undefined && prevVal !== s.vars[v];
          
          return `<td><span class="${isChanged ? 'changed' : ''}">${escapeHtml(val)}</span></td>`;
        }).join('')}
        <td>${escapeHtml(s.explanation)}</td>
      </tr>
    `;
  }
  
  tableBody.innerHTML = tbodyHtml;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ==========================================================================
// COMPLEXITY VISUALIZATION
// ==========================================================================
function onComplexityTabEntered() {
  if (!parsedData) return;

  const timeComplexity = parsedData.complexity.time || 'O(N)';
  const spaceComplexity = parsedData.complexity.space || 'O(1)';
  
  document.getElementById('active-time-complexity').innerText = timeComplexity;
  document.getElementById('active-space-complexity').innerText = spaceComplexity;

  // Rate Efficiency Rank
  let rank = 'O(N) - Fair';
  let desc = 'Medium Efficiency';
  
  const tc = timeComplexity.toLowerCase().replace(/\s/g, '');
  if (tc.includes('1')) {
    rank = 'O(1) - Optimal';
  } else if (tc.includes('logn')) {
    rank = 'O(log N) - Excellent';
  } else if (tc.includes('nlogn')) {
    rank = 'O(N log N) - Efficient';
  } else if (tc.includes('n2') || tc.includes('n^2')) {
    rank = 'O(N²) - Inefficient';
  } else if (tc.includes('n')) {
    rank = 'O(N) - Fair';
  }
  
  document.getElementById('active-efficiency-rank').innerText = rank;

  // Highlight curve matching note complexity
  document.querySelectorAll('#complexity-svg path, #complexity-svg line').forEach(el => {
    if (el.id) el.style.strokeWidth = '1.5';
  });

  const activePoint = document.getElementById('active-complexity-point');
  
  // Position active point on graph based on complexity
  if (tc.includes('1')) {
    document.getElementById('curve-o1').style.strokeWidth = '3.5';
    animatePoint(250, 290);
  } else if (tc.includes('logn')) {
    document.getElementById('curve-ologn').style.strokeWidth = '3.5';
    animatePoint(250, 245);
  } else if (tc.includes('nlogn')) {
    document.getElementById('curve-onlogn').style.strokeWidth = '3.5';
    animatePoint(250, 140);
  } else if (tc.includes('n2') || tc.includes('n^2')) {
    document.getElementById('curve-on2').style.strokeWidth = '3.5';
    animatePoint(180, 120);
  } else {
    // Default O(N)
    document.getElementById('curve-on').style.strokeWidth = '3.5';
    animatePoint(250, 205);
  }
}

function animatePoint(cx, cy) {
  const pt = document.getElementById('active-complexity-point');
  pt.setAttribute('cx', cx);
  pt.setAttribute('cy', cy);
}

// Neural Network Canvas particles background reuse
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 15), 60);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.2 + 0.8
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.3)';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 242, 254, ${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(render);
  }

  render();
}

function showToast(message, type = 'info') {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '0.9rem';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '999';
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    document.body.appendChild(toast);
  }
  
  if (type === 'error') {
    toast.style.background = 'rgba(239, 68, 68, 0.95)';
    toast.style.color = '#fff';
    toast.style.border = '1px solid #ef4444';
  } else if (type === 'warning') {
    toast.style.background = 'rgba(245, 158, 11, 0.95)';
    toast.style.color = '#fff';
    toast.style.border = '1px solid #f59e0b';
  } else {
    toast.style.background = 'rgba(15, 23, 42, 0.95)';
    toast.style.color = 'var(--accent-cyan)';
    toast.style.border = '1px solid var(--accent-cyan)';
  }
  
  toast.innerText = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 4000);
}
