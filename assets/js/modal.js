/* =========================
   IMAGE MODAL SYSTEM
========================= */

const modal = document.getElementById("imageModal");
const modalBody = document.querySelector(".img-modal-body");
const modalDim = document.querySelector(".img-modal-dim");
const modalClose = document.querySelector(".img-modal-close");
const modalContent = document.querySelector(".img-modal-content");

// ✅ 모달 안에서 굴린 휠이 window까지 전달되지 않게 차단
if (modalContent) {
  modalContent.addEventListener(
    "wheel",
    (e) => {
      e.stopPropagation();
    },
    { passive: true }
  );
}

function openImageModal(clickedImg) {
  if (!modal || !modalBody) return;

  modalBody.innerHTML = "";
  if (!clickedImg) return;

  // PC: 클릭한 이미지 1장만
  if (!isMobile()) {
    const clone = clickedImg.cloneNode(true);

    clone.style.display = "block";
    clone.style.width = "auto";
    clone.style.height = "auto";
    clone.style.maxWidth = "none";
    clone.style.maxHeight = "none";

    modalBody.appendChild(clone);
  }
  // 모바일: 해당 프로젝트 이미지 전부
  else {
    const section = clickedImg.closest(".project-sticky");
    if (!section) return;

    const allImages = section.querySelectorAll(
      ".project-image-area img.media-img:not(.youtube-thumb)"
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
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

if (modalDim) {
  modalDim.addEventListener("click", closeImageModal);
}

if (modalClose) {
  modalClose.addEventListener("click", closeImageModal);
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeImageModal();
});

document.addEventListener("click", (e) => {
  const clickedImg = e.target.closest(
    ".project-image-area img.media-img:not(.youtube-thumb)"
  );
  if (!clickedImg) return;

  openImageModal(clickedImg);
});

/* =========================
   PC ONLY - YOUTUBE THUMBNAIL MODE
========================= */

if (!isMobile()) {
  document.querySelectorAll(".youtube-grid").forEach((grid) => {
    const iframes = grid.querySelectorAll("iframe");

    grid.innerHTML = "";

    iframes.forEach((iframe) => {
      const src = iframe.src;
      const videoId = (src.split("/embed/")[1] || "").split("?")[0];
      const caption = iframe.dataset.caption || "";

      const img = document.createElement("img");
      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      img.className = "youtube-thumb media-img";
      img.dataset.video = videoId;
      img.dataset.caption = caption;

      grid.appendChild(img);
    });
  });
}

/* =========================
   PC ONLY - VIDEO MODAL
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

  function openVideoModal(videoId) {
    if (!videoId) return;

    videoFrameBox.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${videoId}?autoplay=1"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>
    `;

    videoModalEl.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeVideoModal() {
    videoModalEl.classList.remove("active");
    videoFrameBox.innerHTML = "";
    document.body.style.overflow = "";
  }

  videoCloseBtn.addEventListener("click", closeVideoModal);
  videoDimEl.addEventListener("click", closeVideoModal);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && videoModalEl.classList.contains("active")) {
      closeVideoModal();
    }
  });

  document.addEventListener("click", (e) => {
    const thumb = e.target.closest(".youtube-thumb");
    if (!thumb) return;

    const videoId = thumb.dataset.video;
    openVideoModal(videoId);
  });
}

/* =========================
   IMAGE QUAD CLICK SUPPORT
========================= */

document.addEventListener("click", (e) => {
  const quadImg = e.target.closest(".image-quad img");
  if (!quadImg) return;

  openImageModal(quadImg);
});