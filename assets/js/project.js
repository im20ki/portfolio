/* =========================
   PROJECT SYSTEM
========================= */

const projectSections = document.querySelectorAll(".project-sticky");

const projectMediaMap = [
    // PROJECT 01
    [
        [0],        // step 0 -> media 0
        [1],        // step 1 -> media 1
        [2],        // step 2 -> media 2
        [3]         // step 3 -> media 3
    ],

    // PROJECT 02
    [
        [0],
        [1],
        [2],
        [3]
    ],

    // PROJECT 03
    [
        [0],
        [1],
        [2],
        [3]
    ],

    // PROJECT 04
    [
        [0],        // 프로젝트 소개
        [1, 2],     // 기획 및 전략 수립
        [3],        // 디자인 및 제작 실행
        [4, 5]      // 운영 및 성과 관리
    ]
];

const stepImageCounts = [
    [1, 1, 3, 1],     // PROJECT 01
    [1, 4, 5, 2],     // PROJECT 02
    [1, 1, 1, 1],     // PROJECT 03
    [1, 3, 1, 1]      // PROJECT 04
];


const projects = Array.from(projectSections).map((section, projectIndex) => {
    return {
        section,
        steps: section.querySelectorAll(".step"),
        media: section.querySelectorAll(".project-image-area .media"),
        mediaMap: projectMediaMap[projectIndex] || [],
        stepImageCounts: stepImageCounts[projectIndex] || [],   // ⭐ 이 줄 추가
        stepIndex: 0,
        imageIndex: 0,
        imageCount: [],
        isTransitioning: false,
    };
});

function updateProjectView(project) {

    project.isTransitioning = true;
    project.media.forEach((el, i) => {
        el.classList.toggle("active", i === project.stepIndex);
    });

    const media = project.media[project.stepIndex];
    let imgs = [];

    if (media && !media.classList.contains("youtube-grid") && !media.classList.contains("image-quad")) {
        imgs = media.querySelectorAll("img");
    }

    imgs.forEach((img, i) => {
        img.style.display = (i === project.imageIndex) ? "block" : "none";
    });

    project.steps.forEach((step, i) => {
        step.classList.toggle("active", i === project.stepIndex);
    });

    const captionBox = project.section.querySelector(".project-hover-caption");
    const activeMedia = project.media[project.stepIndex];
    let activeImg = null;

    if (activeMedia) {
        const imgs = activeMedia.querySelectorAll("img");
        activeImg = imgs[project.imageIndex] || imgs[0];
    }

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
/* =========================
   MOBILE ONLY
   PROJECT1 - 3번 프레임만 첫 장 높이로 고정
========================= */
function syncProject1ThirdFrameOnly() {
    if (!isMobile()) return;

    const project1 = document.querySelector(".project-sticky");
    if (!project1) return;

    const firstImg = project1.querySelector(".project-image-area .media:nth-child(1) .frame .media-img");
    const thirdFrame = project1.querySelector(".project-image-area .media:nth-child(3) .frame");

    if (!firstImg || !thirdFrame) return;

    const apply = () => {
        const firstRect = firstImg.getBoundingClientRect();
        if (!firstRect.width || !firstRect.height) return;

        const thirdStyle = window.getComputedStyle(thirdFrame);
        const paddingTop = parseFloat(thirdStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(thirdStyle.paddingBottom) || 0;

        const innerHeight = Math.round(firstRect.height);
        const outerHeight = Math.round(innerHeight + paddingTop + paddingBottom);

        project1.style.setProperty("--project1-third-frame-inner-height", `${innerHeight}px`);
        project1.style.setProperty("--project1-third-frame-height", `${outerHeight}px`);

        thirdFrame.scrollTop = 0;
    };

    if (firstImg.complete) {
        apply();
    } else {
        firstImg.addEventListener("load", apply, { once: true });
    }

    requestAnimationFrame(apply);
    setTimeout(apply, 100);
    setTimeout(apply, 300);
}

document.addEventListener("DOMContentLoaded", syncProject1ThirdFrameOnly);
window.addEventListener("load", syncProject1ThirdFrameOnly);
window.addEventListener("resize", syncProject1ThirdFrameOnly);
window.addEventListener("orientationchange", syncProject1ThirdFrameOnly);

if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncProject1ThirdFrameOnly);
}

/* =========================
   MOBILE MULTI IMAGE VERTICAL SLIDER
========================= */

function setupMobileVerticalSliders() {

    if (!isMobile()) return;

    const frames = document.querySelectorAll(".project-image-area .media .frame");

    frames.forEach(frame => {

        const images = Array.from(frame.querySelectorAll(".media-img"));
        if (images.length <= 1) return;

        frame.classList.add("has-multi-images");

        const track = document.createElement("div");
        track.className = "multi-frame-track";

        images.forEach(img => track.appendChild(img));

        frame.appendChild(track);

        let index = 0;
        let startY = 0;
        let deltaY = 0;

        function update() {
            track.style.transform = `translateY(-${index * 100}%)`;
        }

        frame.addEventListener("touchstart", (e) => {
            startY = e.touches[0].clientY;
            deltaY = 0;
        }, { passive: true });

        frame.addEventListener("touchmove", (e) => {
            deltaY = e.touches[0].clientY - startY;
        }, { passive: true });

        frame.addEventListener("touchend", () => {

            const threshold = 40;

            if (deltaY < -threshold && index < images.length - 1) {
                index++;
            }

            if (deltaY > threshold && index > 0) {
                index--;
            }

            update();
        });

        update();

    });
}

document.addEventListener("DOMContentLoaded", setupMobileVerticalSliders);