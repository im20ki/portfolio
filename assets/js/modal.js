/* =========================
   IMAGE MODAL SYSTEM
========================= */

const modal = document.getElementById("imageModal");
const modalBody = document.querySelector(".img-modal-body");
const modalDim = document.querySelector(".img-modal-dim");
const modalClose = document.querySelector(".img-modal-close");
const modalContent = document.querySelector(".img-modal-content");

let mobileModalTarget = null;

// 모달 안에서 굴린 휠이 window까지 전달되지 않게 차단
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
  mobileModalTarget = null;

  if (modalContent) {
    modalContent.scrollTop = 0;
  }

  if (!clickedImg) return;

  /* ======================
     PC : 클릭한 이미지 1장
  ====================== */
  if (!isMobile()) {
    const clone = clickedImg.cloneNode(true);

    clone.style.display = "block";
    clone.style.width = "auto";
    clone.style.height = "auto";
    clone.style.maxWidth = "none";
    clone.style.maxHeight = "none";

    modalBody.appendChild(clone);
  }

  /* ======================
     MOBILE : 프로젝트 전체 이미지
  ====================== */
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

  /* ======================
     모바일 스크롤 위치 맞추기
  ====================== */
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

if (modalDim) modalDim.addEventListener("click", closeImageModal);
if (modalClose) modalClose.addEventListener("click", closeImageModal);

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