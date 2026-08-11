// Main ES6 Entry Point Module
import { initParticles } from './modules/particles.js';
import { initQuizDemo } from './modules/quizDemo.js';
import { initScrollAnimations } from './modules/animations.js';
import { setupCopyButtons } from './modules/clipboard.js';

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initQuizDemo();
  initScrollAnimations();
  setupCopyButtons();

  // Mobile menu toggle
  const toggleBtn = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
});
