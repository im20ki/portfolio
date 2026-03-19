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
        [1],     // 기획 및 전략 수립
        [2],        // 디자인 및 제작 실행
        [3]      // 운영 및 성과 관리
    ]
];

const stepImageCounts = [
    [1, 1, 4, 1],     // PROJECT 01
    [1, 4, 5, 2],     // PROJECT 02
    [1, 1, 1, 1],     // PROJECT 03
    [1, 4, 1, 4]      // PROJECT 04
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
    let activeTarget = null;

    if (activeMedia) {
        const targets = activeMedia.querySelectorAll("img, iframe[data-caption]");
        activeTarget = targets[project.imageIndex] || targets[0];
    }

    if (captionBox && activeMedia) {

        const textEl = captionBox.querySelector(".caption-text");

        if (textEl) {
            textEl.textContent = activeTarget?.dataset.caption || "";
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
        const target = e.target.closest(".project-image-area img, .project-image-area iframe[data-caption]");
        if (!target) return;

        const section = target.closest(".project-sticky");
        if (!section) return;

        const captionBox = section.querySelector(".project-hover-caption");
        if (!captionBox) return;

        const textEl = captionBox.querySelector(".caption-text");
        const text = target.dataset.caption || "";

        if (textEl) textEl.textContent = text;

        captionBox.classList.add("active");
        captionBox.classList.add("hover");
    });

    document.addEventListener("mouseout", (e) => {
        const target = e.target.closest(".project-image-area img, .project-image-area iframe[data-caption]");
        if (!target) return;

        const section = target.closest(".project-sticky");
        if (!section) return;

        const captionBox = section.querySelector(".project-hover-caption");
        if (!captionBox) return;

        captionBox.classList.remove("hover");
    });
}

function getMediaCaptionTargets(media) {
    if (!media) return [];
    return Array.from(media.querySelectorAll(".media-img, iframe[data-caption]"));
}

function getActiveCaptionFromMedia(media) {
    const targets = getMediaCaptionTargets(media);
    if (!targets.length) return "";

    const activeByIndex = targets.find(
        (el) => Number(el.dataset.mobileIndex || 0) === Number(media.dataset.activeInnerIndex || 0)
    );

    return (activeByIndex || targets[0]).dataset.caption || "";
}

function updateMobileProjectCaption(section, media) {
    if (!isMobile() || !section) return;

    const captionBox = section.querySelector(".project-hover-caption");
    const textEl = captionBox?.querySelector(".caption-text");
    if (!captionBox || !textEl) return;

    const text = getActiveCaptionFromMedia(media);
    textEl.textContent = text;
    captionBox.classList.toggle("active", Boolean(text));
}

function updateMobileProjectActiveMedia(section) {
    if (!isMobile() || !section) return;

    const imageArea = section.querySelector(".project-image-area");
    const mediaList = Array.from(section.querySelectorAll(".project-image-area .media"));
    if (!imageArea || !mediaList.length) return;

    const areaRect = imageArea.getBoundingClientRect();
    const areaCenter = areaRect.left + areaRect.width * 0.5;

    let activeMedia = mediaList[0];
    let minDistance = Infinity;

    mediaList.forEach((media) => {
        const rect = media.getBoundingClientRect();
        const mediaCenter = rect.left + rect.width * 0.5;
        const distance = Math.abs(areaCenter - mediaCenter);

        if (distance < minDistance) {
            minDistance = distance;
            activeMedia = media;
        }
    });

    mediaList.forEach((media) => {
        media.classList.toggle("active", media === activeMedia);
    });

    updateMobileProjectCaption(section, activeMedia);
}

function setupMobileProjectCaptions() {
    if (!isMobile()) return;

    const sections = document.querySelectorAll(".project-sticky");

    sections.forEach((section) => {
        const imageArea = section.querySelector(".project-image-area");
        if (!imageArea) return;

        let rafId = null;
        let scrollTimeout = null;
        let isTicking = false;

        const update = () => {
            updateMobileProjectActiveMedia(section);
        };

        const requestUpdate = () => {
            // 🔥 RAF 중복 방지
            if (!isTicking) {
                rafId = requestAnimationFrame(() => {
                    update();
                    isTicking = false;
                });
                isTicking = true;
            }

            // 🔥 scroll 멈춤 보정
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(update, 120);
        };

        imageArea.addEventListener("scroll", requestUpdate, { passive: true });

        // 🔥 최초 1회만 실행
        requestAnimationFrame(update);
    });

    // 🔥 전역 1회만 등록 (중복 제거)
    window.addEventListener("resize", () => {
        document.querySelectorAll(".project-sticky").forEach((section) => {
            updateMobileProjectActiveMedia(section);
        });
    });
}

function setupMobileVerticalSliders() {
    if (!isMobile()) return;

    const frames = document.querySelectorAll(".project-image-area .media .frame");

    frames.forEach((frame) => {
        const media = frame.closest(".media");
        const section = frame.closest(".project-sticky");
        const captionTargets = Array.from(frame.querySelectorAll(".media-img, iframe[data-caption]"));

        captionTargets.forEach((el, idx) => {
            el.dataset.mobileIndex = idx;
        });

        if (captionTargets.length && media) {
            media.dataset.activeInnerIndex = "0";
        }

        const images = Array.from(frame.querySelectorAll(".media-img"));
        const iframes = Array.from(frame.querySelectorAll("iframe[data-caption]"));

        if (images.length <= 1) {
            if (iframes.length > 1) {
                let rafId = null;

                const updateIframeCaption = () => {
                    if (rafId) cancelAnimationFrame(rafId);

                    rafId = requestAnimationFrame(() => {
                        const pageHeight = Math.max(frame.clientHeight, 1);
                        let index = Math.round(frame.scrollTop / pageHeight);

                        index = Math.max(0, Math.min(iframes.length - 1, index));

                        if (media) media.dataset.activeInnerIndex = String(index);
                        updateMobileProjectCaption(section, media);
                    });
                };

                frame.addEventListener("scroll", updateIframeCaption, { passive: true });
                window.addEventListener("resize", updateIframeCaption);
                window.addEventListener("load", updateIframeCaption);

                updateIframeCaption();
                return;
            }

            updateMobileProjectCaption(section, media);
            return;
        }

        frame.classList.add("has-multi-images");

        const track = document.createElement("div");
        track.className = "multi-frame-track";

        images.forEach((img) => track.appendChild(img));
        frame.appendChild(track);

        const indicator = document.createElement("div");
        indicator.className = "frame-indicator";
        indicator.setAttribute("aria-hidden", "true");

        images.forEach((_, idx) => {
            const dot = document.createElement("span");
            dot.className = "frame-indicator-dot";

            if (idx === 0) {
                dot.classList.add("active");
            }

            indicator.appendChild(dot);
        });

        frame.appendChild(indicator);

        let index = 0;

        let startY = 0;
        let deltaY = 0;
        let rafId = null;

        function applyTransform(offsetPercent = 0) {
            const base = -index * 100;
            track.style.transform = `translate3d(0, ${base + offsetPercent}%, 0)`;
        }

        function updateIndicator() {
            const dots = indicator.querySelectorAll(".frame-indicator-dot");
            dots.forEach((dot, idx) => {
                dot.classList.toggle("active", idx === index);
            });
        }

        function update() {
            track.style.transition = "transform 0.25s cubic-bezier(0.22,1,0.36,1)";
            applyTransform(0);

            if (media) media.dataset.activeInnerIndex = String(index);
            updateIndicator();
            updateMobileProjectCaption(section, media);
        }

        frame.addEventListener(
            "touchstart",
            (e) => {
                startY = e.touches[0].clientY;
                deltaY = 0;
                track.style.transition = "none";
            },
            { passive: true }
        );

        frame.addEventListener(
            "touchmove",
            (e) => {
                deltaY = e.touches[0].clientY - startY;

                if (Math.abs(deltaY) > 6) {
                    e.preventDefault();
                }

                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const height = Math.max(frame.clientHeight, 1);
                    const percent = (deltaY / height) * 100;
                    const limited = Math.max(-25, Math.min(25, percent));
                    applyTransform(limited);
                });
            },
            { passive: false }
        );

        frame.addEventListener("touchend", () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }

            const height = Math.max(frame.clientHeight, 1);
            const ratio = Math.abs(deltaY) / height;

            const thresholdRatio = 0.18;

            if (deltaY < 0 && ratio > thresholdRatio && index < images.length - 1) {
                index++;
            }

            if (deltaY > 0 && ratio > thresholdRatio && index > 0) {
                index--;
            }

            update();
        });

        update();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupMobileVerticalSliders();
    setupMobileProjectCaptions();
});