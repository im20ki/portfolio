/* =========================
   WHEEL CONTROL (PC ONLY)
========================= */

if (!isMobile()) {
    window.addEventListener(
        "wheel",
        (e) => {
            if (!firstWheelFixDone) {
                const idx = getCurrentSceneIndex();
                const scene = scenes[idx];
                if (scene) window.scrollTo(0, scene.offsetTop);
                firstWheelFixDone = true;
            }

            // 이미지 모달 열려 있으면 wheel 차단
            if (modal && modal.classList.contains("active")) {
                return;
            }

            // 비디오 모달 열려 있으면 wheel 차단
            const activeVideoModal = document.querySelector(".video-modal.active");
            if (activeVideoModal) {
                return;
            }

            if (currentAnimation) {
                e.preventDefault();
                return;
            }

            if (Math.abs(e.deltaY) < 30) return;

            const currentSceneIndex = getCurrentSceneIndex();
            const currentScene = scenes[currentSceneIndex];
            const currentProject = projects.find((p) => p.section === currentScene);

            if (currentProject && currentProject.steps.length > 0) {
                e.preventDefault();

                if (currentProject.isTransitioning) return;

                if (e.deltaY > 0) {

                    const maxImages = currentProject.stepImageCounts[currentProject.stepIndex];

                    if (currentProject.imageIndex < maxImages - 1) {

                        currentProject.imageIndex++;
                        updateProjectView(currentProject);
                        return;

                    }

                    currentProject.imageIndex = 0;

                    if (currentProject.stepIndex < currentProject.steps.length - 1) {

                        currentProject.stepIndex++;
                        updateProjectView(currentProject);
                        return;

                    }

                    scrollToScene(currentSceneIndex + 1);
                    return;

                }

                if (e.deltaY < 0) {

                    if (currentProject.imageIndex > 0) {

                        currentProject.imageIndex--;
                        updateProjectView(currentProject);
                        return;

                    }

                    if (currentProject.stepIndex > 0) {

                        currentProject.stepIndex--;
                        const prevCount = currentProject.stepImageCounts[currentProject.stepIndex];
                        currentProject.imageIndex = prevCount - 1;

                        updateProjectView(currentProject);
                        return;

                    }

                    scrollToScene(currentSceneIndex - 1);
                    return;

                }
            }

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
   LOGO → TOP
========================= */

const logo = document.querySelector(".logo");

if (logo) {
    logo.addEventListener("click", () => {
        if (currentAnimation) return;
        scrollToScene(0);
    });
}

/* =========================
   CONTACT TAKEOVER
========================= */

const contactTakeover = document.getElementById("contactTakeover");
const contactTrigger = document.getElementById("contactTrigger");

window.addEventListener("scroll", () => {
    if (!contactTakeover || !contactTrigger) return;

    if (window.innerWidth <= 768) {
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
   MOBILE HEADER STATE
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

window.addEventListener("scroll", handleMobileHeader);
window.addEventListener("resize", handleMobileHeader);
handleMobileHeader();