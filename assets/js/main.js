const scenes = document.querySelectorAll(".scene");
let isScrolling = false;

const isMobile = window.innerWidth <= 768;

function getCurrentSceneIndex() {
  // 현재 스크롤 위치 기준으로 "가장 가까운" scene index 계산
  let index = 0;
  const 기준선 = window.scrollY + window.innerHeight * 0.5;

  scenes.forEach((scene, i) => {
    if (기준선 >= scene.offsetTop) index = i;
  });

  return index;
}

function scrollToScene(index) {
  if (index < 0 || index >= scenes.length) return;

  isScrolling = true;

  window.scrollTo({
    top: scenes[index].offsetTop,
    behavior: "smooth",
  });

  // 스무스 스크롤 도중 휠 연타 방지 잠금
  setTimeout(() => {
    isScrolling = false;
  }, 700);
}

if (!isMobile) {
  window.addEventListener(
    "wheel",
    (e) => {
      // ✅ 기본 스크롤(일반 스크롤)이 같이 일어나면 스냅이 깨집니다
      e.preventDefault();

      if (isScrolling) return;

      const current = getCurrentSceneIndex();

      if (e.deltaY > 0) {
        scrollToScene(current + 1);
      } else if (e.deltaY < 0) {
        scrollToScene(current - 1);
      }
    },
    { passive: false } // ✅ preventDefault가 먹게 만드는 핵심 옵션
  );
}

/* reveal (너 원래 코드 유지) */
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const triggerPoint = window.innerHeight * 0.85;

  reveals.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < triggerPoint) el.classList.add("active");
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

/* HERO CYBER UI MICRO MOVE */
const heroUI = document.querySelector('.hero-content.cyber-ui');

if (heroUI) {
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 12;
    const y = (e.clientY / window.innerHeight - 0.5) * 12;

    heroUI.style.transform =
  `translate(-50%, 0) translate(${x}px, ${-y}px)`;
  });
}