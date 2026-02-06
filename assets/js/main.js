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

  if (isScrolling) return;
  isScrolling = true;

  const scene = scenes[index];
  const style = getComputedStyle(scene);
  const paddingTop = parseInt(style.paddingTop, 10) || 0;

  window.scrollTo({
    top: scene.offsetTop - paddingTop,
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
  project.isTransitioning = true;

  project.images.forEach((img, i) => {
    img.classList.toggle("active", i === project.index);
  });

  project.steps.forEach((step, i) => {
    step.classList.toggle("active", i === project.index);
  });

  setTimeout(() => {
    project.isTransitioning = false;
  }, 450);
}

/* =========================
   WHEEL CONTROL (PROJECT LOCK – CLEAN)
========================= */

if (!isMobile()) {
  window.addEventListener(
    "wheel",
    (e) => {
      const currentSceneIndex = getCurrentSceneIndex();
      const currentScene = scenes[currentSceneIndex];

      const currentProject = projects.find(
        (p) => p.section === currentScene
      );

      /* ===== PROJECT SECTION ===== */
      if (currentProject && currentProject.steps.length > 0) {
        e.preventDefault();

        if (currentProject.isTransitioning) return;

        if (e.deltaY > 0) {
          if (currentProject.index < currentProject.steps.length - 1) {
            currentProject.index++;
            updateProjectView(currentProject);
            return;
          }
          scrollToScene(currentSceneIndex + 1);
          return;
        }

        if (e.deltaY < 0) {
          if (currentProject.index > 0) {
            currentProject.index--;
            updateProjectView(currentProject);
            return;
          }
          scrollToScene(currentSceneIndex - 1);
          return;
        }
      }

      /* ===== NON-PROJECT SCENE ===== */
      e.preventDefault();

      if (e.deltaY > 0) {
        scrollToScene(currentSceneIndex + 1);
      } else {
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

/* =========================
   PROJECT JUMP NAV
========================= */

const projectNavButtons = document.querySelectorAll(".project-nav button");

projectNavButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const projectIndex = Number(btn.dataset.project);

    const targetProject = document.querySelectorAll(".project-sticky")[projectIndex];
    if (!targetProject) return;

    setActiveProjectNav(projectIndex); // ✅ 추가

    window.scrollTo({
      top: targetProject.offsetTop,
      behavior: "smooth",
    });
  });
});

function setActiveProjectNav(index) {
  projectNavButtons.forEach((btn, i) => {
    btn.classList.toggle("active", i === index);
  });
}

function updateProjectNavOnScroll() {
  const 기준선 = window.scrollY + window.innerHeight * 0.5;

  // ✅ 먼저 전부 비활성화
  setActiveProjectNav(-1);

  projectSections.forEach((section, index) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;

    if (기준선 >= top && 기준선 < bottom) {
      setActiveProjectNav(index);
    }
  });
}

window.addEventListener("scroll", updateProjectNavOnScroll);
updateProjectNavOnScroll();


/* =========================
   LOGO → SCROLL TO TOP
========================= */

const logo = document.querySelector(".logo");

if (logo) {
  logo.addEventListener("click", () => {
    // 이미 스크롤 중이면 무시
    if (isScrolling) return;

    isScrolling = true;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // 스크롤 종료 후 잠금 해제
    setTimeout(() => {
      isScrolling = false;
    }, 700);
  });
}

/* =========================
   CONTACT TAKEOVER CONTROL
========================= */

const contactTakeover = document.getElementById("contactTakeover");
const contactTrigger = document.getElementById("contactTrigger");

window.addEventListener("scroll", () => {
  if (!contactTakeover || !contactTrigger) return;

  const triggerTop = contactTrigger.getBoundingClientRect().top;

  if (triggerTop <= window.innerHeight * 0.3) {
    contactTakeover.classList.add("active");
    document.body.classList.add("contact-open");
  } else {
    contactTakeover.classList.remove("active");
    document.body.classList.remove("contact-open");
  }
});