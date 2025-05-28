// menu.js (enhanced and fixed menu interaction)
const menu = document.getElementById('menu');
const openBtn = document.getElementById('mobile-menu');
const closeBtn = document.getElementById('close-menu');

function openMenu() {
  menu.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  menu.style.animation = 'fadeIn 0.4s ease forwards';
}

function closeMenu() {
  menu.style.animation = 'fadeOut 0.4s ease forwards';
  setTimeout(() => {
    menu.style.display = 'none';
    document.body.style.overflow = 'auto';
  }, 400);
}

openBtn.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);
document.querySelectorAll('.menu-item').forEach(item => item.addEventListener('click', closeMenu));

// Keyframes injection for smooth menu transitions
const styleTag = document.createElement('style');
styleTag.textContent = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-10px); }
}`;
document.head.appendChild(styleTag);

// Fix typewriter safely without injecting HTML directly
const text = document.querySelector('.typewriter');
const originalText = 'Zakariya Ireed — Software Developer';
let i = 0;
text.textContent = '';
function type() {
  if (i < originalText.length) {
    text.textContent += originalText.charAt(i);
    i++;
    setTimeout(type, 50);
  }
}
setTimeout(type, 300);