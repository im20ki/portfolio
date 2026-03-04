/* =========================
   1) BASIC SETUP / UTILS
========================= */
const scenes = document.querySelectorAll(".scene");
let isImageHovered = false;
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

/* =========================
   2) SCENE HELPERS
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
  if (currentAnimation) return;

  const scene = scenes[index];
  const style = getComputedStyle(scene);
  const paddingTop = parseInt(style.paddingTop, 10) || 0;

  const startY = window.scrollY;
  const targetY = scene.offsetTop - paddingTop;

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

/* =========================
   3) PROJECT SECTIONS SETUP
   (⚠️ wheel / view update가 의존하므로 순서 유지)
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

if (!isMobile()) {
  projects.forEach((project) => {
    updateProjectView(project);
  });
}

/* =========================
   4) PROJECT VIEW UPDATE
========================= */
function updateProjectView(project) {
  project.isTransitioning = true;

  project.media.forEach((el, i) => {
    el.classList.toggle("active", i === project.index);
  });

  project.steps.forEach((step, i) => {
    step.classList.toggle("active", i === project.index);
  });

  // hover caption
  const captionBox = project.section.querySelector(".project-hover-caption");
  const activeMedia = project.media[project.index];

  if (captionBox && activeMedia && isImageHovered) {
    captionBox.textContent = activeMedia.dataset.caption || "";
    captionBox.classList.add("active");
  }

  setTimeout(() => {
    project.isTransitioning = false;
  }, 450);
}

/* =========================
   5) WHEEL CONTROL (PC ONLY)
   (⚠️ projects / modal 변수 의존 → 아래 modal 선언보다 위에 있지만,
    기존 파일도 동일 구조였고 동작 정상. 그대로 유지)
========================= */
if (!isMobile()) {
  window.addEventListener(
    "wheel",
    (e) => {
      // ✅ 첫 로딩 직후 1회: 브라우저가 먹는 2~3px 스크롤 슬립 제거
      if (!firstWheelFixDone) {
        const idx = getCurrentSceneIndex();
        const scene = scenes[idx];
        if (scene) window.scrollTo(0, scene.offsetTop);
        firstWheelFixDone = true;
      }

      // ✅ 모달이 열려 있으면 wheel 완전 차단
      if (modal.classList.contains("active")) {
        return;
      }

      // ✅ 애니메이션 도는 중이면 wheel 입력을 막고 끝
      if (currentAnimation) {
        e.preventDefault();
        return;
      }

      if (Math.abs(e.deltaY) < 30) return;
      const currentSceneIndex = getCurrentSceneIndex();
      const currentScene = scenes[currentSceneIndex];

      const currentProject = projects.find((p) => p.section === currentScene);

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
        const nextIndex = currentSceneIndex + 1;
        if (!isAlreadyInScene(nextIndex)) {
          scrollToScene(nextIndex);
        }
      } else {
        const prevIndex = currentSceneIndex - 1;
        if (!isAlreadyInScene(prevIndex)) {
          scrollToScene(prevIndex);
        }
      }
    },
    { passive: false }
  );
}

/* =========================
   6) REVEAL
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
   7) HERO MICRO MOVE (PC ONLY)
========================= */
const heroUI = document.querySelector(".hero-content.cyber-ui");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

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
   8) SPLINE LOADER / PREWARM (PC ONLY)
========================= */
const splineViewer = document.querySelector("spline-viewer");
const heroLoader = document.querySelector(".hero-loader");

if (splineViewer && !isMobile()) {
  const heroSection = document.getElementById("hero");
  const heroBg = document.querySelector("#hero .hero-bg");

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

  function isHeroInView() {
    const rect = heroSection.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

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

if (splineViewer && heroLoader) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      heroLoader.classList.add("hidden");
      window.dispatchEvent(new Event("resize"));
    }, 500);
  });
}

/* =========================
   9) PROJECT JUMP NAV
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
   10) LOGO → SCROLL TO TOP
========================= */
const logo = document.querySelector(".logo");

if (logo) {
  logo.addEventListener("click", () => {
    if (currentAnimation) return;
    scrollToScene(0);
  });
}

/* =========================
   11) CONTACT TAKEOVER CONTROL
========================= */
const contactTakeover = document.getElementById("contactTakeover");
const contactTrigger = document.getElementById("contactTrigger");

window.addEventListener("scroll", () => {
  if (!contactTakeover) return;

  // ✅ 모바일 (trigger 기준으로 변경)
  if (window.innerWidth <= 768) {
    if (!contactTrigger) return;

    const triggerTop = contactTrigger.getBoundingClientRect().top;

    if (triggerTop <= window.innerHeight * 0.8) {
      contactTakeover.classList.add("active");
      document.body.classList.add("contact-open");
    } else {
      contactTakeover.classList.remove("active");
      document.body.classList.remove("contact-open");
    }

    return;
  }

  // ✅ PC
  if (!contactTrigger) return;

  const triggerTop = contactTrigger.getBoundingClientRect().top;

  if (triggerTop <= window.innerHeight * 0.3) {
    contactTakeover.classList.add("active");
    document.body.classList.add("contact-open");
  } else {
    contactTakeover.classList.remove("active");
    document.body.classList.remove("contact-open");
  }
});

/* =========================
   12) MOBILE HEADER SCROLL STATE
========================= */
function handleMobileHeader() {
  if (window.innerWidth > 768) {
    document.body.classList.remove("mobile-header-scrolled");
    return;
  }

  if (window.scrollY > 20) {
    document.body.classList.add("mobile-header-scrolled");
  } else {
    document.body.classList.remove("mobile-header-scrolled");
  }
}

/* =========================
   13) IMAGE MODAL SYSTEM
========================= */
const modal = document.getElementById("imageModal");
const modalBody = document.querySelector(".img-modal-body");
const modalDim = document.querySelector(".img-modal-dim");
const modalClose = document.querySelector(".img-modal-close");
const modalContent = document.querySelector(".img-modal-content");

// ✅ 모달에서 굴린 휠이 window까지 올라가지 않게 차단 (모달 스크롤은 그대로)
if (modalContent) {
  modalContent.addEventListener("wheel", (e) => {
    e.stopPropagation();
  }, { passive: true });
}

function openImageModal(clickedImg) {
  modalBody.innerHTML = "";
  if (!clickedImg) return;

  // ✅ PC는 기존처럼 한 장만
  if (!isMobile()) {
    const clone = clickedImg.cloneNode(true);

    clone.style.display = "block";
    clone.style.width = "auto";
    clone.style.height = "auto";
    clone.style.maxWidth = "none";
    clone.style.maxHeight = "none";

    modalBody.appendChild(clone);
  }
  // ✅ 모바일은 해당 프로젝트 이미지 전부
  else {
    const section = clickedImg.closest(".project-sticky");
    const allImages = section.querySelectorAll(
      ".project-image-area img.media:not(.youtube-thumb)"
    );

    allImages.forEach((img) => {
      const clone = img.cloneNode(true);

      clone.style.width = "100%";
      clone.style.height = "auto";
      clone.style.display = "block";
      clone.style.marginBottom = "20px";

      modalBody.appendChild(clone);
    });
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeImageModal() {
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

modalDim.addEventListener("click", closeImageModal);
modalClose.addEventListener("click", closeImageModal);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeImageModal();
});

document.addEventListener("click", (e) => {
  const clickedImg = e.target.closest(".project-image-area img.media-img:not(.youtube-thumb)");
  if (!clickedImg) return;

  openImageModal(clickedImg);
});

/* =========================
   14) PC IMAGE & YOUTUBE HOVER CAPTION (EVENT DELEGATION)
========================= */
if (!isMobile()) {

  document.addEventListener("mouseover", (e) => {

    const target = e.target.closest(
      ".project-image-area img.media, .project-image-area .youtube-thumb"
    );

    if (!target) return;

    const section = target.closest(".project-sticky");
    if (!section) return;

    const captionBox = section.querySelector(".project-hover-caption");
    if (!captionBox) return;

    isImageHovered = true;

    const text = target.dataset.caption || "";
    captionBox.textContent = text;
    captionBox.classList.add("active");
  });

  document.addEventListener("mouseout", (e) => {

    const target = e.target.closest(
      ".project-image-area img.media, .project-image-area .youtube-thumb"
    );

    if (!target) return;

    const section = target.closest(".project-sticky");
    if (!section) return;

    const captionBox = section.querySelector(".project-hover-caption");
    if (!captionBox) return;

    isImageHovered = false;
    captionBox.classList.remove("active");
  });
}

/* =========================
   15) PC ONLY - YOUTUBE THUMBNAIL MODE
========================= */
if (!isMobile()) {
  document.querySelectorAll(".youtube-grid").forEach((grid) => {
    const iframes = grid.querySelectorAll("iframe");

    grid.innerHTML = ""; // PC에서만 iframe 제거

    iframes.forEach((iframe) => {
      const src = iframe.src;
      const videoId = (src.split("/embed/")[1] || "").split("?")[0];
      const caption = iframe.dataset.caption || "";

      const img = document.createElement("img");
      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      img.className = "youtube-thumb";
      img.dataset.video = videoId;
      img.dataset.caption = caption;

      grid.appendChild(img);
    });
  });
}

/* =========================
   16) PC ONLY - VIDEO MODAL (NO CONFLICT)
========================= */
if (!isMobile()) {
  const videoModalEl = document.createElement("div");
  videoModalEl.className = "video-modal";
  videoModalEl.innerHTML = `
    <div class="video-dim"></div>
    <div class="video-content">
      <button class="video-close" type="button">✕</button>
      <div class="video-frame"></div>
    </div>
  `;
  document.body.appendChild(videoModalEl);

  const videoFrameBox = videoModalEl.querySelector(".video-frame");
  const videoCloseBtn = videoModalEl.querySelector(".video-close");
  const videoDimEl = videoModalEl.querySelector(".video-dim");

  document.addEventListener("click", (e) => {
    if (isMobile()) return;

    const thumb = e.target.closest(".youtube-thumb");
    if (!thumb) return;

    const activeMedia = document.querySelector(".project-image-area .media.active");
    if (!activeMedia || !activeMedia.contains(thumb)) return;

    const id = thumb.dataset.video;
    if (!id) return;

    videoFrameBox.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${id}?autoplay=1"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
        title="YouTube video"
      ></iframe>
    `;

    videoModalEl.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  function closeVideoModal() {
    videoModalEl.classList.remove("active");
    videoFrameBox.innerHTML = "";
    document.body.style.overflow = "";
  }

  videoCloseBtn.addEventListener("click", closeVideoModal);
  videoDimEl.addEventListener("click", closeVideoModal);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeVideoModal();
  });
}

/* =========================
   17) MOBILE ONLY - YOUTUBE BLOCK MODE
========================= */
if (isMobile()) {
  document.querySelectorAll(".youtube-grid").forEach((grid) => {
    const iframes = Array.from(grid.querySelectorAll("iframe"));
    const imageArea = grid.parentElement;

    const youtubeArea = document.createElement("div");
    youtubeArea.className = "project-youtube-area";

    iframes.forEach((iframe) => {
      const wrapper = document.createElement("div");
      wrapper.className = "youtube-single";

      wrapper.appendChild(iframe);
      youtubeArea.appendChild(wrapper);
    });

    imageArea.insertAdjacentElement("afterend", youtubeArea);
    grid.remove();
  });
}

/* =========================
   IMAGE QUAD CLICK (P4)
   기존 기능 변경 없음
========================= */

document.querySelectorAll(".image-quad img").forEach((img) => {
  img.addEventListener("click", () => {
    openImageModal(img);
  });
});

/* =========================
   18) INIT (event bind)
========================= */
window.addEventListener("scroll", handleMobileHeader);
window.addEventListener("load", handleMobileHeader);

