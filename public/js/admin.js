/* ===== CONFIRM DESTRUCTIVE ACTIONS ===== */
document.addEventListener('click', (e) => {
  const button = e.target.closest('[data-confirm]');
  if (button && !window.confirm(button.dataset.confirm)) e.preventDefault();
});
