/* =========================
   BASIC SETUP
========================= */
const scenes = document.querySelectorAll(".scene");
let isImageHovered = false;
let currentAnimation = null;
let firstWheelFixDone = false;

function isAlreadyInScene(index) {
  if (index < 0 || index >= scenes.length) return true;

  const scene = scenes[index];
  const top = scene.offsetTop;
  const bottom = top + scene.offsetHeight;
  const middle = window.scrollY + window.innerHeight * 0.5;

  return middle >= top && middle < bottom;
}

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
   PROJECT SECTIONS SETUP
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
   PROJECT VIEW UPDATE
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
   WHEEL CONTROL (PROJECT LOCK – CLEAN)
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
   HERO MICRO MOVE (SMOOTH)
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
    // 👉 부드럽게 따라가게 만드는 핵심
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    heroUI.style.transform =
      `translate(-50%, 0) translate(${currentX}px, ${-currentY}px)`;

    requestAnimationFrame(animateHero);
  }

  animateHero();
}


/* =========================
   SPLINE LOADER
========================= */
const splineViewer = document.querySelector("spline-viewer");
const heroLoader = document.querySelector(".hero-loader");

/* =========================
   SPLINE PREWARM (PC ONLY)
   hero가 화면에 없어도 spline을 미리 실행시키기
========================= */
if (splineViewer && !isMobile()) {
  const heroSection = document.getElementById("hero");
  const heroBg = document.querySelector("#hero .hero-bg");

  // ✅ 화면에는 안 보이지만 "뷰포트 안"에 존재하는 예열 컨테이너
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
    // hero가 보이면 hero-bg에 꽂고, 안 보이면 prewarmBox에 꽂아서 계속 실행
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
      // ✅ Spline 강제 초기화 트리거
      window.dispatchEvent(new Event("resize"));
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
    if (currentAnimation) return;

    scrollToScene(0);
  });
}

/* =========================
   CONTACT TAKEOVER CONTROL
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
   MOBILE HEADER SCROLL STATE
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
   IMAGE MODAL SYSTEM
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

  const clone = clickedImg.cloneNode(true);

  /* ✅ PC에서만 원본 사이즈 유지 */
  clone.style.width = "auto";
  clone.style.height = "auto";
  clone.style.maxWidth = "none";
  clone.style.maxHeight = "none";
  clone.style.display = "block";

  modalBody.appendChild(clone);

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

  if (isMobile()) return; // 🔥 PC만 작동

  const clickedImg = e.target.closest(".project-image-area img.media:not(.youtube-thumb)");
  if (!clickedImg) return;

  const section = clickedImg.closest(".project-sticky");

  openImageModal(clickedImg);

});

/* =========================
   PC IMAGE HOVER CAPTION (CUSTOM)
========================= */
if (!isMobile()) {
  document.querySelectorAll(".project-sticky").forEach((section) => {
    // ✅ img만 말고, 이미지+유튜브를 모두 잡기
    const mediaItems = section.querySelectorAll(".project-image-area .media");
    const captionBox = section.querySelector(".project-hover-caption");
    if (!captionBox) return;

    mediaItems.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        isImageHovered = true;

        const text = el.dataset.caption || "";
        captionBox.textContent = text;
        captionBox.classList.add("active");
      });

      el.addEventListener("mouseleave", () => {
        isImageHovered = false;
        captionBox.classList.remove("active");
      });
    });
  });
}

/* =========================
   PC ONLY - YOUTUBE THUMBNAIL MODE
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
      img.dataset.caption = caption;   // 🔥 여기 추가

      grid.appendChild(img);
    });

  });

}

/* =========================
   PC ONLY - VIDEO MODAL (NO CONFLICT)
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

  // 썸네일 클릭 → 모달 오픈
  document.addEventListener("click", (e) => {

    if (isMobile()) return;

    const thumb = e.target.closest(".youtube-thumb");
    if (!thumb) return;

    // 🔥 현재 active media 안에 있는 썸네일인지 확인
    const activeMedia = document.querySelector(
      ".project-image-area .media.active"
    );

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
    videoFrameBox.innerHTML = ""; // iframe 제거 = 재생 중지
    document.body.style.overflow = "";
  }

  videoCloseBtn.addEventListener("click", closeVideoModal);
  videoDimEl.addEventListener("click", closeVideoModal);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeVideoModal();
  });
}

