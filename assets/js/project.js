/* =========================
   1. DOM & DATA
========================= */

const projectSections = document.querySelectorAll(".project-sticky");

const projectMediaMap = [
    [[0],[1],[2],[3]],
    [[0],[1],[2],[3]],
    [[0],[1],[2],[3]],
    [[0],[1],[2],[3]]
];

const stepImageCounts = [
    [1,1,4,1],
    [1,4,5,2],
    [1,1,1,1],
    [1,4,1,4]
];

const projects = Array.from(projectSections).map((section, projectIndex) => ({
    section,
    steps: section.querySelectorAll(".step"),
    media: section.querySelectorAll(".project-image-area .media"),
    mediaMap: projectMediaMap[projectIndex] || [],
    stepImageCounts: stepImageCounts[projectIndex] || [],
    stepIndex: 0,
    imageIndex: 0,
    imageCount: [],
    isTransitioning: false,
}));

/* =========================
   2. PROJECT CORE
========================= */

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
    projects.forEach(updateProjectView);
}

/* =========================
   3. PROJECT NAV
========================= */

const projectNavButtons = document.querySelectorAll(".project-nav button");

function setActiveProjectNav(index) {
    projectNavButtons.forEach((btn, i) => {
        btn.classList.toggle("active", i === index);
    });
}

projectNavButtons.forEach((btn) => {
    btn.addEventListener("click", () => {

        const projectIndex = Number(btn.dataset.project);
        const targetProject = projectSections[projectIndex];
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
   4. CAPTION (PC HOVER)
========================= */

if (!isMobile()) {

    document.addEventListener("mouseover", (e) => {
        const target = e.target.closest(".project-image-area img, .project-image-area iframe[data-caption], .project-image-area .youtube-thumb-overlay[data-caption]");
        if (!target) return;

        const section = target.closest(".project-sticky");
        if (!section) return;

        const captionBox = section.querySelector(".project-hover-caption");
        if (!captionBox) return;

        const textEl = captionBox.querySelector(".caption-text");
        const text = target.dataset.caption || "";

        if (textEl) textEl.textContent = text;

        captionBox.classList.add("active", "hover");
    });

    document.addEventListener("mouseout", (e) => {
        const target = e.target.closest(".project-image-area img, .project-image-area iframe[data-caption], .project-image-area .youtube-thumb-overlay[data-caption]");
        if (!target) return;

        const section = target.closest(".project-sticky");
        if (!section) return;

        const captionBox = section.querySelector(".project-hover-caption");
        if (!captionBox) return;

        captionBox.classList.remove("hover");
    });
}

/* =========================
   5. MOBILE CAPTION CORE
========================= */

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

/* =========================
   6. MOBILE ACTIVE MEDIA
========================= */

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

/* =========================
   7. MOBILE CAPTION SETUP
========================= */

function setupMobileProjectCaptions() {
    if (!isMobile()) return;

    projectSections.forEach((section) => {

        const imageArea = section.querySelector(".project-image-area");
        if (!imageArea) return;

        let rafId = null;
        let scrollTimeout = null;
        let isTicking = false;

        const update = () => {
            updateMobileProjectActiveMedia(section);
        };

        const requestUpdate = () => {

            if (!isTicking) {
                rafId = requestAnimationFrame(() => {
                    update();
                    isTicking = false;
                });
                isTicking = true;
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(update, 120);
        };

        imageArea.addEventListener("scroll", requestUpdate, { passive: true });

        requestAnimationFrame(update);
    });

    window.addEventListener("resize", () => {
        projectSections.forEach(updateMobileProjectActiveMedia);
    });
}

/* =========================
   8. MOBILE VERTICAL SLIDER
========================= */

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

        if (images.length <= 1 && iframes.length > 1) {

            const indicator = document.createElement("div");
            indicator.className = "frame-indicator";
            indicator.setAttribute("aria-hidden", "true");

            iframes.forEach((_, idx) => {
                const dot = document.createElement("span");
                dot.className = "frame-indicator-dot";
                if (idx === 0) dot.classList.add("active");
                indicator.appendChild(dot);
            });

            media.appendChild(indicator);

            let rafId = null;

            const updateIframeCaption = () => {

                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {

                    const pageHeight = Math.max(frame.clientHeight, 1);
                    let index = Math.round(frame.scrollTop / pageHeight);

                    index = Math.max(0, Math.min(iframes.length - 1, index));

                    media.dataset.activeInnerIndex = String(index);

                    const dots = indicator.querySelectorAll(".frame-indicator-dot");
                    dots.forEach((dot, idx) => {
                        dot.classList.toggle("active", idx === index);
                    });

                    updateMobileProjectCaption(section, media);
                });
            };

            frame.addEventListener("scroll", updateIframeCaption, { passive: true });
            window.addEventListener("resize", updateIframeCaption);
            window.addEventListener("load", updateIframeCaption);

            updateIframeCaption();
            return;
        }

        if (images.length > 1) {

            frame.classList.add("has-multi-images");

            const track = document.createElement("div");
            track.className = "multi-frame-track";

            images.forEach((img) => track.appendChild(img));
            frame.appendChild(track);

            const indicator = document.createElement("div");
            indicator.className = "frame-indicator";

            images.forEach((_, idx) => {
                const dot = document.createElement("span");
                dot.className = "frame-indicator-dot";
                if (idx === 0) dot.classList.add("active");
                indicator.appendChild(dot);
            });

            media.appendChild(indicator);

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

                media.dataset.activeInnerIndex = String(index);
                updateIndicator();
                updateMobileProjectCaption(section, media);
            }

            frame.addEventListener("touchstart", (e) => {
                startY = e.touches[0].clientY;
                deltaY = 0;
                track.style.transition = "none";
            }, { passive: true });

            frame.addEventListener("touchmove", (e) => {

                if (!e.touches?.length) return;

                deltaY = e.touches[0].clientY - startY;

                if (Math.abs(deltaY) > 6 && e.cancelable) {
                    e.preventDefault();
                }

                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const height = Math.max(frame.clientHeight, 1);
                    const percent = (deltaY / height) * 100;
                    const limited = Math.max(-25, Math.min(25, percent));
                    applyTransform(limited);
                });

            }, { passive: false });

            frame.addEventListener("touchend", () => {

                if (rafId) cancelAnimationFrame(rafId);

                const height = Math.max(frame.clientHeight, 1);
                const ratio = Math.abs(deltaY) / height;
                const thresholdRatio = 0.18;

                if (deltaY < 0 && ratio > thresholdRatio && index < images.length - 1) index++;
                if (deltaY > 0 && ratio > thresholdRatio && index > 0) index--;

                update();
            });

            update();
            return;
        }

        updateMobileProjectCaption(section, media);
    });
}

/* =========================
   9. YOUTUBE UTIL
========================= */

function getYoutubeIdFromSrc(src = "") {
    const match = src.match(/embed\/([^?&"/]+)/);
    return match ? match[1] : "";
}

window.getYoutubeIdFromSrc = getYoutubeIdFromSrc;

/* =========================
   10. YOUTUBE OVERLAY (PC)
========================= */

function buildPcYoutubeThumbOverlays() {
    if (isMobile()) return;

    const youtubeIframes = document.querySelectorAll(
        ".project-image-area .youtube-grid iframe"
    );

    youtubeIframes.forEach((iframe) => {

        if (iframe.closest(".yt-thumb-wrap")) return;

        const videoId = getYoutubeIdFromSrc(iframe.src);
        if (!videoId) return;

        const wrap = document.createElement("div");
        wrap.className = "yt-thumb-wrap";

        const overlay = document.createElement("button");
        overlay.type = "button";
        overlay.className = "youtube-thumb-overlay";
        overlay.dataset.videoId = videoId;
        overlay.dataset.caption = iframe.dataset.caption || "";
        overlay.setAttribute("aria-label", iframe.title || "유튜브 영상 보기");
        overlay.style.backgroundImage = `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)`;

        iframe.parentNode.insertBefore(wrap, iframe);
        wrap.appendChild(iframe);
        wrap.appendChild(overlay);
    });
}

if (!isMobile()) {
    buildPcYoutubeThumbOverlays();
}

/* =========================
   11. INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
    setupMobileVerticalSliders();
    setupMobileProjectCaptions();
});