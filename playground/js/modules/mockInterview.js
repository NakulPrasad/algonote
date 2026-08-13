// Mock Interview Module

import { parseNoteData } from './linter.js';

export class MockInterviewSession {
  constructor(provider, noteText, apiConfig, onFallbackNotify) {
    this.provider = provider;
    this.noteText = noteText;
    this.noteData = parseNoteData(noteText);
    this.apiConfig = apiConfig;
    this.onFallbackNotify = onFallbackNotify;
    
    this.history = []; // Array of { role: 'user'|'model', text: string }
    this.offlineStep = 0;
  }

  // Starts the session and returns the initial interviewer message
  async start() {
    const initMessage = `Hello! I am your AlgoNode AI interviewer. I've reviewed your note on **${this.noteData.title}** (${this.noteData.difficulty} difficulty). Let's begin the mock interview.\n\nCould you explain the **core idea** of your approach in plain English?`;
    this.history.push({ role: 'model', text: initMessage });
    return initMessage;
  }

  // Sends the user message and gets the next interviewer response
  async sendMessage(userMessage) {
    this.history.push({ role: 'user', text: userMessage });

    if (this.provider === 'local') {
      try {
        return await this.sendViaLocalServer(userMessage);
      } catch (err) {
        console.warn('Local interview failed, trying fallback...', err.message);
        
        if (this.apiConfig.apiKey) {
          if (this.onFallbackNotify) this.onFallbackNotify('Gemini API');
          try {
            return await this.sendViaGemini(userMessage);
          } catch (geminiErr) {
            console.warn('Gemini interview fallback failed, trying offline...', geminiErr.message);
          }
        }
        
        if (this.onFallbackNotify) this.onFallbackNotify('Offline Rules');
        return this.getNextOfflineResponse(userMessage);
      }
    } else if (this.provider === 'gemini') {
      try {
        return await this.sendViaGemini(userMessage);
      } catch (err) {
        console.warn('Gemini interview failed, falling back to offline...', err.message);
        if (this.onFallbackNotify) this.onFallbackNotify('Offline Rules');
        return this.getNextOfflineResponse(userMessage);
      }
    } else {
      return this.getNextOfflineResponse(userMessage);
    }
  }

  // 1. Fetch interviewer response from VS Code Integration Server
  async sendViaLocalServer(userMessage) {
    if (!this.apiConfig.port) {
      throw new Error('VS Code local server port is not configured.');
    }

    const url = `http://localhost:${this.apiConfig.port}/api/interview`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noteText: this.noteText,
        history: this.history
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned error status: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    this.history.push({ role: 'model', text: data.reply });
    return data.reply;
  }

  // 2. Fetch interviewer response directly from Google Gemini API
  async sendViaGemini(userMessage) {
    if (!this.apiConfig.apiKey) {
      throw new Error('Gemini API Key is missing.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiConfig.apiKey}`;
    
    // Construct Gemini conversational content body
    const contents = [];
    
    // Add system instruction as prefix/first prompt
    let systemInstruction = `You are a technical software engineering interviewer. You are conducting a mock coding interview for a candidate who has written this DSA study note:\n---\n${this.noteText.slice(0, 3000)}\n---\n
Conduct the interview professionally. Ask follow-up questions one by one. Challenge their complexities, check edge cases (like empty arrays, null pointers, duplicates, bounds), and ask about optimization trade-offs. Keep responses conversational, short and clear (max 3 sentences per reply).`;

    // Map history to Gemini API formats: { role: 'user'|'model', parts: [{ text: '' }] }
    // We prepend system instruction to the very first user message or as a system instruction parameter.
    // To make it simple, we construct a conversation history
    const geminiHistory = [
      { role: 'user', parts: [{ text: systemInstruction + "\n\nStart the interview." }] }
    ];

    for (const h of this.history) {
      geminiHistory.push({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }]
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiHistory
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson?.error?.message || `HTTP ${response.status}`;
      throw new Error(msg);
    }

    const resJson = await response.json();
    const reply = resJson.candidates[0].content.parts[0].text;
    this.history.push({ role: 'model', text: reply });
    return reply;
  }

  // 3. Standalone Offline Interview State Machine
  getNextOfflineResponse(userMessage) {
    this.offlineStep++;
    let reply = '';

    const answers = [
      `Understood. Let's talk about complexity. Your note indicates a **Time Complexity of ${this.noteData.complexity.time}**. Can you explain why it runs in this time bound, and what operations contribute to it?`,
      `Got it. Now, how does your implementation handle **edge cases**? For example, how does it handle empty inputs, null pointers, or duplicate values? Are there any pitfalls you explicitly avoid?`,
      `Excellent explanation. If you were asked to optimize this solution further, or use a different data structure (like using two pointers instead of a hash table, or vice versa), what would be the trade-offs in time and space?\n\nThis wraps up our mock interview! You did a fantastic job explaining your thought process, approach structure, and Big-O trade-offs. Keep practice!`,
      `Thank you for participating! Our mock interview is complete. Click 'Reset' to start a new interview session anytime.`
    ];

    if (this.offlineStep <= answers.length) {
      reply = answers[this.offlineStep - 1];
    } else {
      reply = `The interview is already complete. Please click 'Reset' to start over.`;
    }

    this.history.push({ role: 'model', text: reply });
    return reply;
  }
}
