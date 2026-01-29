const scenes = document.querySelectorAll(".scene");
let currentIndex = 0;
let isScrolling = false;

function scrollToScene(index) {
  if (index < 0 || index >= scenes.length) return;

  isScrolling = true;
  currentIndex = index;

  window.scrollTo({
    top: scenes[index].offsetTop,
    behavior: "smooth",
  });

  setTimeout(() => {
    isScrolling = false;
  }, 700);
}

// 마우스 휠 제어
window.addEventListener(
  "wheel",
  (e) => {
    if (isScrolling) return;

    if (e.deltaY > 0) {
      scrollToScene(currentIndex + 1);
    } else {
      scrollToScene(currentIndex - 1);
    }
  },
  { passive: false }
);

// 새로고침 시 현재 위치 보정
window.addEventListener("load", () => {
  const scrollY = window.scrollY;
  scenes.forEach((scene, index) => {
    if (scrollY >= scene.offsetTop) {
      currentIndex = index;
    }
  });
});
