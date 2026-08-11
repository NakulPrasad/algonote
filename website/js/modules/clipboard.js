// Clipboard Copier for VSIX install commands
export function setupCopyButtons() {
  const copyBtn = document.getElementById('copy-cmd-btn');
  const cmdText = document.getElementById('cmd-text');

  if (!copyBtn || !cmdText) return;

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(cmdText.innerText);
      const originalText = copyBtn.innerText;
      copyBtn.innerText = 'Copied! ✓';
      copyBtn.style.background = '#10b981';
      copyBtn.style.color = '#fff';

      setTimeout(() => {
        copyBtn.innerText = originalText;
        copyBtn.style.background = '';
        copyBtn.style.color = '';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  });
}
