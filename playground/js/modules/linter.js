// Note Linter and Markdown Parser module

export const PLACEHOLDERS = [
  /\[Insert problem description here\]/gi,
  /\[Provide justification\]/gi,
  /\[Describe edge case.*?\]/gi,
  /\[Describe edgecase.*?\]/gi,
  /\[Topic\]/g,
  /\[Platform\]/g,
  /\[Step \d+\]/gi,
  /\[Insert core algorithmic intuition here\]/gi,
  /\[Update Topic\]/gi,
  /URL/g
];

export const REQUIRED_SECTIONS = [
  { regex: /##\s*(?:📝\s*)?Problem Statement/i, name: "Problem Statement" },
  { regex: /##\s*(?:💡\s*)?Intuition & Core Approach/i, name: "Intuition & Core Approach" },
  { regex: /##\s*(?:💻\s*)?Implementation/i, name: "Implementation" },
  { regex: /##\s*(?:📊\s*)?Complexity Analysis/i, name: "Complexity Analysis" },
  { regex: /##\s*(?:⚠️\s*)?Edge Cases & Pitfalls to Avoid/i, name: "Edge Cases & Pitfalls to Avoid" }
];

// Lints the markdown text and returns warnings/errors
export function lintNote(text) {
  const problems = [];
  
  if (!text || text.trim() === '') {
    problems.push({
      severity: 'error',
      message: 'Note is empty. Load a sample note or paste your note.',
      section: 'General'
    });
    return problems;
  }

  // 1. Check placeholders
  for (const regex of PLACEHOLDERS) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      problems.push({
        severity: 'warning',
        message: `Placeholder needs to be filled: "${match[0]}"`,
        section: 'Placeholders'
      });
    }
  }

  // 2. Check required structural sections
  for (const section of REQUIRED_SECTIONS) {
    if (!section.regex.test(text)) {
      problems.push({
        severity: 'warning',
        message: `Missing structural section: "${section.name}"`,
        section: 'Structure',
        header: section.name
      });
    }
  }

  // 3. Code Block validation
  const codeBlockMatch = text.match(/```[^\n]*\n([\s\S]*?)```/);
  if (!codeBlockMatch || codeBlockMatch[1].trim() === '') {
    problems.push({
      severity: 'error',
      message: 'No code block found in the note or it is empty.',
      section: 'Implementation'
    });
  }

  return problems;
}

// Parses key data structures from Note text
export function parseNoteData(text) {
  const data = {
    title: 'DSA Problem',
    difficulty: 'Medium',
    topic: 'General',
    code: '',
    complexity: { time: 'O(N)', space: 'O(1)' },
    edgeCases: [],
    intuition: ''
  };

  if (!text) return data;

  // Title extraction
  const titleMatch = text.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    data.title = titleMatch[1].trim();
  }

  // Difficulty extraction
  const difficultyMatch = text.match(/>\s*\*\*Difficulty:\*\*\s*(.+)$/m);
  if (difficultyMatch) {
    data.difficulty = difficultyMatch[1].replace(/[^a-zA-Z]/g, '').trim();
  }

  // Topic extraction
  const topicMatch = text.match(/>\s*\*\*Topic\s*\/\s*Pattern:\*\*\s*(.+)$/m);
  if (topicMatch) {
    data.topic = topicMatch[1].replace(/[\[\]]/g, '').trim();
  }

  // Code block extraction
  const codeMatch = text.match(/```(?:java|python|cpp|javascript)?\n([\s\S]*?)```/);
  if (codeMatch) {
    data.code = codeMatch[1];
  }

  // Complexity extraction
  // Find Time and Space Complexity in table: | **Time Complexity** | $O(N)$ | ... |
  const timeComplexityMatch = text.match(/Time\s+Complexity\*\*?\s*\|\s*\*?\$?([^\$\|]+)\$?/i);
  if (timeComplexityMatch) {
    data.complexity.time = timeComplexityMatch[1].trim();
  }
  const spaceComplexityMatch = text.match(/Space\s+Complexity\*\*?\s*\|\s*\*?\$?([^\$\|]+)\$?/i);
  if (spaceComplexityMatch) {
    data.complexity.space = spaceComplexityMatch[1].trim();
  }

  // Edge cases extraction
  // Extract bullet points after "Edge Cases & Pitfalls to Avoid"
  const edgeCasesIndex = text.search(/Edge\s+Cases\s+&/i);
  if (edgeCasesIndex !== -1) {
    const linesAfter = text.slice(edgeCasesIndex).split('\n');
    for (let i = 1; i < linesAfter.length; i++) {
      const line = linesAfter[i].trim();
      if (line.startsWith('*') || line.startsWith('-')) {
        data.edgeCases.push(line.slice(1).trim());
      } else if (line.startsWith('##')) {
        break; // Reached next section
      }
    }
  }

  // Intuition extraction
  const intuitionIndex = text.search(/##\s+(?:💡\s+)?Intuition/i);
  if (intuitionIndex !== -1) {
    const linesAfter = text.slice(intuitionIndex).split('\n');
    let content = '';
    for (let i = 1; i < linesAfter.length; i++) {
      const line = linesAfter[i].trim();
      if (line.startsWith('##')) break;
      if (line) content += line + ' ';
    }
    data.intuition = content.trim();
  }

  return data;
}

// Generate boilerplate note text
export function getBoilerplate(sectionName) {
  if (sectionName === 'Problem Statement') {
    return `\n## 📝 Problem Statement\n\n[Insert problem description here]\n\n### Examples\n\`\`\`text\nInput: \nOutput: \n\`\`\`\n`;
  }
  if (sectionName === 'Intuition & Core Approach') {
    return `\n## 💡 Intuition & Core Approach\n\n* **The Core Idea:** [Insert core algorithmic intuition here]\n* **Key Steps:**\n  - [Step 1]\n  - [Step 2]\n`;
  }
  if (sectionName === 'Implementation') {
    return `\n## 💻 Implementation\n\n\`\`\`java\nclass Solution {\n    // Write code here\n}\n\`\`\`\n`;
  }
  if (sectionName === 'Complexity Analysis') {
    return `\n## 📊 Complexity Analysis\n\n| Metric | Complexity | Explanation |\n| :--- | :--- | :--- |\n| **Time Complexity** | $O(N)$ | [Provide justification] |\n| **Space Complexity** | $O(1)$ | [Provide justification] |\n`;
  }
  if (sectionName === 'Edge Cases & Pitfalls to Avoid') {
    return `\n## ⚠️ Edge Cases & Pitfalls to Avoid\n\n* **Edge Case 1:** [Describe edge case and handling]\n`;
  }
  return '';
}
