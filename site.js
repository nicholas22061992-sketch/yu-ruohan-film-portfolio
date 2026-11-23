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

const stage = document.querySelector('.motion-stack');
const panels = [...stage.children];
const buttons = [...document.querySelectorAll('[data-panel]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;
let animations = [];

function setPanel(index, direction) {
  if (index === current) return;
  animations.forEach(animation => animation.cancel());
  const outgoing = panels[current];
  const incoming = panels[index];
  current = index;
  panels.forEach((panel, i) => {
    panel.classList.toggle('is-current', i === current);
    panel.setAttribute('aria-hidden', String(i !== current));
    buttons[i].setAttribute('aria-pressed', String(i === current));
  });
  if (reducedMotion.matches || !incoming.animate) return;

  const slide = (element, y, duration, from, to) => element.animate([
    { opacity: from, transform: `translateY(${from === 0 ? y : 0}px)` },
    { opacity: to, transform: `translateY(${to === 0 ? y : 0}px)` }
  ], { duration, easing: 'cubic-bezier(.22,.7,.24,1)' });

  animations = [
    slide(outgoing, -18 * direction, 500, 1, 0),
    slide(incoming, 12 * direction, 550, 0, 1),
    slide(incoming.querySelector('.motion-type'), 58 * direction, 700, 0, 1),
    slide(incoming.querySelector('img, .sticker-art'), 135 * direction, 810, 0, 1)
  ];
}

panels.forEach((panel, i) => panel.setAttribute('aria-hidden', String(i !== 0)));
panels[0].classList.add('is-current');
buttons.forEach((button, i) => button.addEventListener('click', () => {
  setPanel(i, i > current ? 1 : -1);
}));

document.addEventListener('keydown', event => {
  const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
  if (!direction || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || dialog.open) return;
  if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable], video')) return;

  const bounds = stage.getBoundingClientRect();
  if (bounds.top >= window.innerHeight || bounds.bottom <= 0) return;

  event.preventDefault();
  if (event.repeat) return;
  setPanel((current + direction + panels.length) % panels.length, direction);
});

const motionToggle = document.querySelector('.cover-motion-toggle');
const cover = document.querySelector('.motion-hero');

function setDecorativeMotion(enabled) {
  cover.classList.toggle('cover-animated', enabled);
  motionToggle.textContent = enabled ? '暂停动效' : '播放动效';
}
setDecorativeMotion(!reducedMotion.matches);
motionToggle.hidden = false;
motionToggle.addEventListener('click', () => {
  setDecorativeMotion(!cover.classList.contains('cover-animated'));
});
reducedMotion.addEventListener('change', event => setDecorativeMotion(!event.matches));
