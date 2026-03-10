/* =========================
   PROJECT SYSTEM
========================= */

const projectSections = document.querySelectorAll(".project-sticky");

const projects = Array.from(projectSections).map((section) => {
  return {
    section,
    steps: section.querySelectorAll(".step"),
    media: section.querySelectorAll(".project-image-area .media"),
    index: 0,
    isTransitioning: false,
  };
});

function updateProjectView(project) {

  project.isTransitioning = true;

  project.media.forEach((el, i) => {
    el.classList.toggle("active", i === project.index);
  });

  project.steps.forEach((step, i) => {
    step.classList.toggle("active", i === project.index);
  });

  const captionBox = project.section.querySelector(".project-hover-caption");
  const activeMedia = project.media[project.index];
  const activeImg = activeMedia ? activeMedia.querySelector("img") : null;

  if (captionBox && activeMedia) {

    const textEl = captionBox.querySelector(".caption-text");

    if (textEl) {
      textEl.textContent = activeImg?.dataset.caption || "";
    }

    captionBox.classList.add("active");
  }

  setTimeout(() => {
    project.isTransitioning = false;
  }, 450);
}

if (!isMobile()) {
  projects.forEach((project) => {
    updateProjectView(project);
  });
}

/* =========================
   PROJECT NAV
========================= */

const projectNavButtons = document.querySelectorAll(".project-nav button");

projectNavButtons.forEach((btn) => {
  btn.addEventListener("click", () => {

    const projectIndex = Number(btn.dataset.project);

    const targetProject = document.querySelectorAll(".project-sticky")[projectIndex];
    if (!targetProject) return;

    setActiveProjectNav(projectIndex);

    const header = document.querySelector(".site-header");
    const headerHeight = header ? header.offsetHeight : 0;

    window.scrollTo({
      top: targetProject.offsetTop - headerHeight - 10,
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
   HOVER CAPTION
========================= */

if (!isMobile()) {

  document.addEventListener("mouseover", (e) => {

    const img = e.target.closest(".project-image-area img");
    if (!img) return;

    const section = img.closest(".project-sticky");
    if (!section) return;

    const captionBox = section.querySelector(".project-hover-caption");
    if (!captionBox) return;

    const textEl = captionBox.querySelector(".caption-text");

    const text = img.dataset.caption || "";

    if (textEl) textEl.textContent = text;

    captionBox.classList.add("active");
    captionBox.classList.add("hover");

  });

  document.addEventListener("mouseout", (e) => {

    const img = e.target.closest(".project-image-area img");
    if (!img) return;

    const section = img.closest(".project-sticky");
    if (!section) return;

    const captionBox = section.querySelector(".project-hover-caption");
    if (!captionBox) return;

    captionBox.classList.remove("hover");

  });

}