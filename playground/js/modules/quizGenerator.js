// Quiz Generator Module

import { parseNoteData } from './linter.js';

export async function generateQuiz(provider, noteText, format, count, apiConfig, onFallbackNotify) {
  const noteData = parseNoteData(noteText);
  
  if (provider === 'local') {
    try {
      return await generateViaLocalServer(noteText, format, count, apiConfig.port);
    } catch (err) {
      console.warn('Local Copilot server failed, trying fallback...', err);
      
      // Try Gemini Direct if API key is present
      if (apiConfig.apiKey) {
        if (onFallbackNotify) onFallbackNotify('Gemini API');
        try {
          return await generateViaGeminiDirect(noteText, format, count, apiConfig.apiKey);
        } catch (geminiErr) {
          console.warn('Gemini fallback failed, trying offline...', geminiErr);
        }
      }
      
      // Default to Offline heuristics
      if (onFallbackNotify) onFallbackNotify('Offline Rules');
      return generateOfflineQuiz(noteData, format, count);
    }
  } else if (provider === 'gemini') {
    try {
      return await generateViaGeminiDirect(noteText, format, count, apiConfig.apiKey);
    } catch (err) {
      console.warn('Gemini direct failed, falling back to offline...', err);
      if (onFallbackNotify) onFallbackNotify('Offline Rules');
      return generateOfflineQuiz(noteData, format, count);
    }
  } else {
    return generateOfflineQuiz(noteData, format, count);
  }
}

// 1. Fetch from local VS Code Integration Server
async function generateViaLocalServer(noteText, format, count, port) {
  if (!port) {
    throw new Error('VS Code local server port is not configured. Is the AlgoNote extension active?');
  }

  const url = `http://localhost:${port}/api/generate`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteText, format, count })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned error status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data.questions;
  } catch (err) {
    console.warn('Local server failed, falling back to offline mode. Error:', err.message);
    throw new Error(`Local Server failed: ${err.message}. Try switching Provider to 'Offline Rules' or check VS Code.`);
  }
}

// 2. Fetch directly from Google Gemini API (Client-side)
async function generateViaGeminiDirect(noteText, format, count, apiKey) {
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Configure it in the settings panel.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const systemPrompt = `You are a DSA examiner. Based on this note:
---
${noteText.slice(0, 3500)}
---

Generate exactly ${count} quiz questions in format "${format}".
- 'code-fill' format: Blank out 1-2 important lines of code from the note, and ask the user to fill it.
- 'explain-concept' format: Conceptual questions explaining design decisions, data structures, or techniques in words.
- 'multiple-choice' format: Standard MCQs testing time/space complexity, edge cases, and correctness.

Output ONLY a JSON array matching this interface (no Markdown backticks, no wrap text, just raw JSON):
interface QuizQuestion {
    id: number;
    question: string;
    options: string[]; // exactly 4 options
    correctIndex: number; // 0, 1, 2, or 3
    explanation: string;
}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson?.error?.message || `HTTP ${response.status}`;
      throw new Error(msg);
    }

    const resJson = await response.json();
    const textContent = resJson.candidates[0].content.parts[0].text;
    const questions = JSON.parse(textContent.trim());
    return questions;
  } catch (err) {
    throw new Error(`Gemini API Error: ${err.message}`);
  }
}

// 3. Offline Heuristic Rule Quizzer (100% Offline / Fast)
function generateOfflineQuiz(noteData, format, count) {
  const pool = [];

  // Generate Complexity Question
  if (noteData.complexity && noteData.complexity.time) {
    pool.push({
      id: 1,
      question: `What is the Time Complexity of the implementation provided in the "${noteData.title}" note?`,
      options: [
        `O(1) - Constant Time`,
        `O(N) - Linear Time (where N is input size)`,
        `O(N log N) - Log-linear Time`,
        `O(N²) - Quadratic Time`
      ],
      correctIndex: noteData.complexity.time.includes('1') ? 0 : (noteData.complexity.time.includes('log') ? 2 : (noteData.complexity.time.includes('2') ? 3 : 1)),
      explanation: `The note specifies the Time Complexity is $${noteData.complexity.time}$ because of the single-pass loop scan or search pattern.`
    });
  }

  if (noteData.complexity && noteData.complexity.space) {
    pool.push({
      id: 2,
      question: `What is the Space Complexity of the implementation in your "${noteData.title}" note?`,
      options: [
        `O(1) - Constant space`,
        `O(N) - Linear auxiliary space`,
        `O(log N) - Logarithmic call stack space`,
        `O(N²) - Quadratic space`
      ],
      correctIndex: noteData.complexity.space.includes('1') ? 0 : (noteData.complexity.space.includes('log') ? 2 : (noteData.complexity.space.includes('2') ? 3 : 1)),
      explanation: `The note specifies the Space Complexity is $${noteData.complexity.space}$ based on the auxiliary data structure size.`
    });
  }

  // Pre-compiled questions for samples to make them feel amazing out of the box
  if (noteData.title.toLowerCase().includes('two sum')) {
    pool.push({
      id: 3,
      question: `In Two Sum, why is a HashMap preferred over sorting the array first and using two pointers?`,
      options: [
        `HashMap solves it in O(1) space, whereas two pointers requires O(N) space.`,
        `HashMap solves it in O(N) time without modifying indices, whereas sorting takes O(N log N) and shifts original indices.`,
        `HashMap is easier to implement but has a worse asymptotic time complexity.`,
        `HashMap automatically removes duplicate numbers from the input array.`
      ],
      correctIndex: 1,
      explanation: `Sorting takes O(N log N) time and scrambles elements' original positions. A HashMap stores complements and matches them in O(N) time while keeping original indices intact.`
    });

    pool.push({
      id: 4,
      question: `Identify the missing line in the Two Sum HashMap loop:\n\nint complement = target - nums[i];\nif (map.containsKey(complement)) {\n    // [MISSING CODE]\n}\nmap.put(nums[i], i);`,
      options: [
        `return new int[]{ i, complement };`,
        `return new int[]{ map.get(complement), i };`,
        `return new int[]{ map.get(nums[i]), i };`,
        `return new int[]{ 0, i };`
      ],
      correctIndex: 1,
      explanation: `We return the index of the complement from the map (which occurred earlier) and the current index 'i'.`
    });
  } else if (noteData.title.toLowerCase().includes('parentheses')) {
    pool.push({
      id: 3,
      question: `In Valid Parentheses, why do we push the matching opening bracket to the stack (or push closing complements) instead of counting brackets?`,
      options: [
        `Because we need to check if the brackets are nested in the correct order (LIFO).`,
        `Because bracket counting runs in O(N²) time.`,
        `Because stacks are faster than integer arithmetic variables in Java.`,
        `Because parentheses can have negative values.`
      ],
      correctIndex: 0,
      explanation: `Bracket order is Last-In-First-Out (LIFO). A simple integer count cannot verify nested ordering correctness, e.g., '([)]' has equal counts but is invalid.`
    });

    pool.push({
      id: 4,
      question: `Identify the missing check when popping a closing bracket 'c' from stack:\n\nif (c == ')') {\n    if (// [MISSING CHECK]) return false;\n}`,
      options: [
        `stack.isEmpty() || stack.pop() != '('`,
        `stack.peek() == '('`,
        `stack.pop() == ')'`,
        `!stack.isEmpty()`
      ],
      correctIndex: 0,
      explanation: `We must verify the stack isn't empty before popping. If empty, it means there is an unmatched closing bracket. If popped char != '(', it is mismatched.`
    });
  } else if (noteData.title.toLowerCase().includes('inorder')) {
    pool.push({
      id: 3,
      question: `What order of traversal does Inorder Traversal produce on a Binary Search Tree (BST)?`,
      options: [
        `Sorted ascending order`,
        `Level-by-level traversal`,
        `Sorted descending order`,
        `Reverse Polish notation`
      ],
      correctIndex: 0,
      explanation: `Inorder traversal of a BST visits Left Subtree -> Root -> Right Subtree, which yields the keys in sorted ascending order.`
    });

    pool.push({
      id: 4,
      question: `Identify the missing recursive call in a helper function DFS traversal for Inorder:\n\nif (node == null) return;\n// [MISSING LINE 1]\nlist.add(node.val);\n// [MISSING LINE 2]`,
      options: [
        `helper(node.left); ... helper(node.right);`,
        `helper(node.right); ... helper(node.left);`,
        `list.add(node.left.val); ... list.add(node.right.val);`,
        `return helper(node);`
      ],
      correctIndex: 0,
      explanation: `Inorder visits Left first recursively, adds current node value, and then visits Right recursively.`
    });
  } else {
    // Heuristics for custom note
    // Parse code to generate a custom code-blank question
    let question = `What does the loop or block in your code do?`;
    let options = [`Processes elements sequentially`, `Performs binary search`, `Sorts elements`, `Compares nested elements`];
    let correctIndex = 0;
    let explanation = `The code block in the implementation section loops through inputs.`;

    if (noteData.code) {
      const codeLines = noteData.code.split('\n').map(l => l.trim()).filter(l => l.length > 10 && !l.startsWith('//'));
      if (codeLines.length > 3) {
        const targetLine = codeLines[Math.floor(codeLines.length / 2)];
        const blankedLine = targetLine.slice(0, Math.floor(targetLine.length / 2)) + ' /* ??? */ ' + targetLine.slice(Math.floor(targetLine.length * 0.75));
        question = `Identify the correct line to complete this segment of your implementation:\n\n...\n${blankedLine}\n...`;
        options = [
          targetLine,
          targetLine.replace(/==/g, '!=').replace(/\+/g, '-'),
          `// TODO: complete implementation`,
          `break;`
        ];
        correctIndex = 0;
        explanation = `The correct line is "${targetLine}", matching the logic in the Implementation section of your note.`;
      }
    }

    pool.push({
      id: 3,
      question: question,
      options: options,
      correctIndex: correctIndex,
      explanation: explanation
    });

    // Edge Cases question
    if (noteData.edgeCases.length > 0) {
      pool.push({
        id: 4,
        question: `According to your note, which of the following edge cases must be handled or avoided?`,
        options: [
          noteData.edgeCases[0],
          `Allocating infinite memory`,
          `Unordered hash table collisions`,
          `Recursive stack overflow on small inputs`
        ],
        correctIndex: 0,
        explanation: `Your note explicitly lists "${noteData.edgeCases[0]}" as an edge case or pitfall to avoid.`
      });
    }
  }

  // Shuffle or slice to count
  return pool.slice(0, count);
}
