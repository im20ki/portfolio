/* =========================
   BASIC SETUP
========================= */
const scenes = document.querySelectorAll(".scene");
let isScrolling = false;

function isMobile() {
  return window.innerWidth <= 768;
}

/* =========================
   SCENE HELPERS
========================= */
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

  isScrolling = true;
  window.scrollTo({
    top: scenes[index].offsetTop,
    behavior: "smooth",
  });

  setTimeout(() => {
    isScrolling = false;
  }, 700);
}

/* =========================
   PROJECT SECTIONS SETUP
========================= */
const projectSections = document.querySelectorAll(".project-sticky");

const projects = Array.from(projectSections).map((section) => {
  return {
    section,
    steps: section.querySelectorAll(".step"),
    images: section.querySelectorAll(".project-image-area img"),
    index: 0,
    isTransitioning: false,
  };
});

projects.forEach((project) => {
  updateProjectView(project);
});

/* =========================
   PROJECT VIEW UPDATE
========================= */
function updateProjectView(project) {
  project.images.forEach((img, i) => {
    img.classList.toggle("active", i === project.index);
  });

  project.steps.forEach((step, i) => {
    step.classList.toggle("active", i === project.index);
  });
}

/* =========================
   WHEEL CONTROL (CORE)
========================= */
if (!isMobile()) {
  window.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (isScrolling) return;

      const currentSceneIndex = getCurrentSceneIndex();
      const currentScene = scenes[currentSceneIndex];

      const currentProject = projects.find(
        (p) => p.section === currentScene
      );

      /* ===== PROJECT SECTION ===== */
      if (currentProject && currentProject.steps.length > 0) {
        if (currentProject.isTransitioning) return;

        // scroll down
        if (e.deltaY > 0) {
          if (currentProject.index < currentProject.steps.length - 1) {
            currentProject.isTransitioning = true;
            currentProject.index++;
            updateProjectView(currentProject);

            setTimeout(() => {
              currentProject.isTransitioning = false;
            }, 400);

            return;
          } else {
            scrollToScene(currentSceneIndex + 1);
            return;
          }
        }

        // scroll up
        if (e.deltaY < 0) {
          if (currentProject.index > 0) {
            currentProject.isTransitioning = true;
            currentProject.index--;
            updateProjectView(currentProject);

            setTimeout(() => {
              currentProject.isTransitioning = false;
            }, 400);

            return;
          } else {
            scrollToScene(currentSceneIndex - 1);
            return;
          }
        }
      }

      /* ===== NORMAL SCENE ===== */
      if (e.deltaY > 0) {
        scrollToScene(currentSceneIndex + 1);
      } else if (e.deltaY < 0) {
        scrollToScene(currentSceneIndex - 1);
      }
    },
    { passive: false }
  );
}

/* =========================
   REVEAL
========================= */
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

/* =========================
   HERO MICRO MOVE
========================= */
const heroUI = document.querySelector(".hero-content.cyber-ui");

if (heroUI && !isMobile()) {
  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 12;
    const y = (e.clientY / window.innerHeight - 0.5) * 12;

    heroUI.style.transform =
      `translate(-50%, 0) translate(${x}px, ${-y}px)`;
  });
}

/* =========================
   SPLINE LOADER
========================= */
const splineViewer = document.querySelector("spline-viewer");
const heroLoader = document.querySelector(".hero-loader");

if (splineViewer && heroLoader) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      heroLoader.classList.add("hidden");
    }, 500);
  });
}
