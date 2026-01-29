const scenes = document.querySelectorAll(".scene");
let currentIndex = 0;
let isScrolling = false;

const isMobile = window.innerWidth <= 768;

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

if (!isMobile) {
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
}

const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const triggerPoint = window.innerHeight * 0.85;

  reveals.forEach((el) => {
    const top = el.getBoundingClientRect().top;

    if (top < triggerPoint) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

