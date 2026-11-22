const dialog = document.querySelector('dialog');
const player = document.querySelector('#player');
const error = document.querySelector('#play-error');
const direct = document.querySelector('#direct');
let opener;

document.querySelectorAll('[data-video]').forEach(button => {
  button.addEventListener('click', () => {
    opener = button;
    document.querySelector('#player-title').textContent = button.dataset.title ?? button.closest('article').querySelector('h3').textContent;
    error.hidden = true;
    direct.href = player.src = 'media/' + button.dataset.video + '.mp4';
    dialog.showModal();
    player.play().catch(() => {});
  });
});

player.addEventListener('error', () => {
  if (dialog.open) error.hidden = false;
});
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  }
});
dialog.addEventListener('close', () => {
  player.pause();
  player.removeAttribute('src');
  player.load();
  opener?.focus();
});
