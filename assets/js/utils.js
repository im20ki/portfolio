/* =========================
   UTILS / GLOBAL
========================= */

const scenes = document.querySelectorAll(".scene");

let currentAnimation = null;
let firstWheelFixDone = false;

function isMobile() {
  return window.innerWidth <= 768;
}

function isAlreadyInScene(index) {
  if (index < 0 || index >= scenes.length) return true;

  const scene = scenes[index];
  const top = scene.offsetTop;
  const bottom = top + scene.offsetHeight;
  const middle = window.scrollY + window.innerHeight * 0.5;

  return middle >= top && middle < bottom;
}

function getCurrentSceneIndex() {
  let index = 0;
  const 기준선 = window.scrollY + window.innerHeight * 0.5;

  scenes.forEach((scene, i) => {
    if (기준선 >= scene.offsetTop) index = i;
  });

  return index;
}

function scrollToScene(index) {
  if (index < 0 || index >= scenes.length) return;
  if (currentAnimation) return;

  const scene = scenes[index];

  const startY = window.scrollY;
  const targetY = scene.offsetTop;

  const distance = targetY - startY;
  const duration = 850;
  let startTime = null;

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animateScroll(timestamp) {
    if (!startTime) startTime = timestamp;

    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      currentAnimation = requestAnimationFrame(animateScroll);
    } else {
      currentAnimation = null;
    }
  }

  currentAnimation = requestAnimationFrame(animateScroll);
}