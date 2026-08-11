// Interactive MCQ Demo Logic
export function initQuizDemo() {
  const options = document.querySelectorAll('.quiz-option');
  const feedback = document.getElementById('quiz-feedback');

  if (!options.length || !feedback) return;

  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      // Disable all options once selected
      options.forEach((o) => (o.disabled = true));

      const isCorrect = opt.dataset.correct === 'true';

      if (isCorrect) {
        opt.classList.add('correct');
        feedback.className = 'quiz-feedback show success';
        feedback.innerHTML = '🎉 <strong>Correct!</strong> HashMap average lookups are O(1) due to direct hash indexing. In worst case hash collisions, it degrades to O(n).';
      } else {
        opt.classList.add('incorrect');
        // highlight correct one
        document.querySelector('.quiz-option[data-correct="true"]')?.classList.add('correct');
        feedback.className = 'quiz-feedback show error';
        feedback.innerHTML = '❌ <strong>Incorrect.</strong> Average time complexity is O(1). HashMap uses direct bucket indexing based on key hash codes.';
      }
    });
  });
}
