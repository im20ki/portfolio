/* =========================
   1. DOM CACHE
========================= */

const modal = document.getElementById("imageModal");
const modalBody = document.querySelector(".img-modal-body");
const modalDim = document.querySelector(".img-modal-dim");
const modalClose = document.querySelector(".img-modal-close");
const modalContent = document.querySelector(".img-modal-content");

/* =========================
   2. STATE
========================= */

let videoModal = null;
let videoModalDim = null;
let videoModalClose = null;
let videoModalBody = null;

let mobileModalTarget = null;

/* =========================
   3. BASE EVENT (SCROLL BLOCK)
========================= */

if (modalContent) {
  modalContent.addEventListener(
    "wheel",
    (e) => {
      e.stopPropagation();
    },
    { passive: true }
  );
}

/* =========================
   4. IMAGE MODAL
========================= */

function openImageModal(clickedImg) {
  if (!modal || !modalBody) return;

  modalBody.innerHTML = "";
  mobileModalTarget = null;

  if (modalContent) {
    modalContent.scrollTop = 0;
  }

  if (!clickedImg) return;

  /* ---------- PC ---------- */
  if (!isMobile()) {
    const clone = clickedImg.cloneNode(true);

    clone.style.display = "block";
    clone.style.width = "auto";
    clone.style.height = "auto";
    clone.style.maxWidth = "none";
    clone.style.maxHeight = "none";

    modalBody.appendChild(clone);
  }

  /* ---------- MOBILE ---------- */
  else {
    const section = clickedImg.closest(".project-sticky");
    if (!section) return;

    const allImages = Array.from(
      section.querySelectorAll(
        ".project-image-area img.media-img:not(.youtube-thumb)"
      )
    );

    const clickedIndex = allImages.indexOf(clickedImg);

    allImages.forEach((img, index) => {
      const clone = img.cloneNode(true);

      clone.style.width = "100%";
      clone.style.height = "auto";
      clone.style.display = "block";
      clone.style.marginBottom = "20px";

      if (index === clickedIndex) {
        mobileModalTarget = clone;
      }

      modalBody.appendChild(clone);
    });
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  /* 모바일 위치 보정 */
  if (isMobile() && modalContent && mobileModalTarget) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const targetTop = mobileModalTarget.offsetTop - 16;
        modalContent.scrollTop = Math.max(targetTop, 0);
      });
    });
  }
}

function closeImageModal() {
  if (!modal) return;

  modal.classList.remove("active");
  document.body.style.overflow = "";
  mobileModalTarget = null;

  if (modalContent) {
    modalContent.scrollTop = 0;
  }
}

/* =========================
   5. VIDEO MODAL
========================= */

function ensureVideoModal() {
  if (videoModal) return;

  const modalEl = document.createElement("div");
  modalEl.id = "videoModal";
  modalEl.className = "video-modal";

  modalEl.innerHTML = `
    <div class="video-modal-dim"></div>
    <div class="video-content">
      <button class="video-close" type="button" aria-label="영상 닫기">✕</button>
      <div class="video-body"></div>
    </div>
  `;

  document.body.appendChild(modalEl);

  videoModal = modalEl;
  videoModalDim = modalEl.querySelector(".video-modal-dim");
  videoModalClose = modalEl.querySelector(".video-close");
  videoModalBody = modalEl.querySelector(".video-body");

  if (videoModalDim) {
    videoModalDim.addEventListener("click", closeVideoModal);
  }

  if (videoModalClose) {
    videoModalClose.addEventListener("click", closeVideoModal);
  }
}

function openVideoModal(videoId) {
  if (!videoId) return;

  ensureVideoModal();
  if (!videoModal || !videoModalBody) return;

  videoModalBody.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
  `;

  videoModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeVideoModal() {
  if (!videoModal || !videoModalBody) return;

  videoModal.classList.remove("active");
  videoModalBody.innerHTML = "";
  document.body.style.overflow = "";
}

/* =========================
   6. EVENT BINDING
========================= */

/* image modal */

if (modalDim) {
  modalDim.addEventListener("click", closeImageModal);
}

if (modalClose) {
  modalClose.addEventListener("click", closeImageModal);
}

/* ESC */

window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;

  closeImageModal();
  closeVideoModal();
});

/* GLOBAL CLICK */

document.addEventListener("click", (e) => {

  /* youtube thumb (PC/Mobile 공통) */
  const clickedThumb = e.target.closest(
    ".project-image-area .youtube-thumb-overlay[data-video-id]"
  );

  if (clickedThumb) {
    openVideoModal(clickedThumb.dataset.videoId);
    return;
  }

  /* mobile youtube grid */
  if (isMobile()) {
    const clickedYoutubeFrame = e.target.closest(
      ".project-image-area .youtube-grid .frame"
    );

    if (clickedYoutubeFrame) {
      const activeMedia = clickedYoutubeFrame.closest(".media.youtube-grid");
      const activeIndex = Number(activeMedia?.dataset.activeInnerIndex || 0);

      const iframes = Array.from(
        clickedYoutubeFrame.querySelectorAll("iframe[data-caption]")
      );

      const activeIframe = iframes[activeIndex] || iframes[0];

      const videoId = activeIframe
        ? getYoutubeIdFromSrc(activeIframe.src)
        : "";

      if (videoId) {
        openVideoModal(videoId);
        return;
      }
    }
  }

  /* image click */
  const clickedImg = e.target.closest(".project-image-area img.media-img");

  if (!clickedImg) return;

  openImageModal(clickedImg);
});