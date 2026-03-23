/* =========================
   1. DOM CACHE
========================= */

const reveals = document.querySelectorAll(".reveal");

const heroUI = document.querySelector(".hero-content.cyber-ui");

const splineViewer = document.querySelector("spline-viewer");
const heroLoader = document.querySelector(".hero-loader");

const heroSection = document.getElementById("hero");
const heroBg = document.querySelector("#hero .hero-bg");

/* =========================
   2. STATE
========================= */

let targetX = 0;
let targetY = 0;

let currentX = 0;
let currentY = 0;

/* =========================
   3. UTIL
========================= */

function isHeroInView() {
  const rect = heroSection.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

/* =========================
   4. REVEAL
========================= */

function revealOnScroll() {

  const triggerPoint = window.innerHeight * 0.85;

  reveals.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < triggerPoint) el.classList.add("active");
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

/* =========================
   5. HERO MICRO MOVE
========================= */

if (heroUI && !isMobile()) {

  window.addEventListener("mousemove", (e) => {

    targetX = (e.clientX / window.innerWidth - 0.5) * 12;
    targetY = (e.clientY / window.innerHeight - 0.5) * 12;

  });

  function animateHero() {

    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    heroUI.style.transform =
      `translate(-50%, 0) translate(${currentX}px, ${-currentY}px)`;

    requestAnimationFrame(animateHero);
  }

  animateHero();
}

/* =========================
   6. SPLINE SYSTEM
========================= */

if (splineViewer && !isMobile()) {

  const prewarmBox = document.createElement("div");

  prewarmBox.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
    z-index: -1;
  `;

  document.body.appendChild(prewarmBox);

  function placeSpline() {

    if (isHeroInView()) {

      if (heroBg && splineViewer.parentElement !== heroBg) {
        heroBg.appendChild(splineViewer);
      }

    } else {

      if (splineViewer.parentElement !== prewarmBox) {
        prewarmBox.appendChild(splineViewer);
      }
    }
  }

  window.addEventListener("scroll", placeSpline, { passive: true });
  window.addEventListener("load", placeSpline);

  placeSpline();
}

/* =========================
   7. SPLINE LOADER
========================= */

if (splineViewer && heroLoader) {

  window.addEventListener("load", () => {

    setTimeout(() => {

      heroLoader.classList.add("hidden");

      window.dispatchEvent(new Event("resize"));

    }, 500);

  });
}