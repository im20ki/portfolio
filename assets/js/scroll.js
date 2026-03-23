/* =========================
   1. DOM CACHE
========================= */

const logo = document.querySelector(".logo");

const contactTakeover = document.getElementById("contactTakeover");
const contactTrigger = document.getElementById("contactTrigger");

/* =========================
   2. WHEEL CONTROL (PC ONLY)
========================= */

if (!isMobile()) {

    window.addEventListener(
        "wheel",
        (e) => {

            /* 최초 위치 보정 */
            if (!firstWheelFixDone) {
                const idx = getCurrentSceneIndex();
                const scene = scenes[idx];
                if (scene) window.scrollTo(0, scene.offsetTop);
                firstWheelFixDone = true;
            }

            /* 모달 열림 상태 차단 */
            if (modal && modal.classList.contains("active")) return;

            const activeVideoModal = document.querySelector(".video-modal.active");
            if (activeVideoModal) return;

            /* 애니메이션 중 차단 */
            if (currentAnimation) {
                e.preventDefault();
                return;
            }

            /* 미세 스크롤 무시 */
            if (Math.abs(e.deltaY) < 30) return;

            const currentSceneIndex = getCurrentSceneIndex();
            const currentScene = scenes[currentSceneIndex];

            const currentProject = projects.find(
                (p) => p.section === currentScene
            );

            /* ======================
               PROJECT INTERACTION
            ====================== */

            if (currentProject && currentProject.steps.length > 0) {

                e.preventDefault();

                if (currentProject.isTransitioning) return;

                /* ---------- DOWN ---------- */
                if (e.deltaY > 0) {

                    const maxImages =
                        currentProject.stepImageCounts[currentProject.stepIndex];

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

                /* ---------- UP ---------- */
                if (e.deltaY < 0) {

                    if (currentProject.imageIndex > 0) {

                        currentProject.imageIndex--;
                        updateProjectView(currentProject);
                        return;
                    }

                    if (currentProject.stepIndex > 0) {

                        currentProject.stepIndex--;

                        const prevCount =
                            currentProject.stepImageCounts[currentProject.stepIndex];

                        currentProject.imageIndex = prevCount - 1;

                        updateProjectView(currentProject);
                        return;
                    }

                    scrollToScene(currentSceneIndex - 1);
                    return;
                }
            }

            /* ======================
               SCENE NAVIGATION
            ====================== */

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
   3. LOGO → TOP
========================= */

if (logo) {
    logo.addEventListener("click", () => {
        if (currentAnimation) return;
        scrollToScene(0);
    });
}

/* =========================
   4. CONTACT TAKEOVER
========================= */

function handleContactTakeover() {

    if (!contactTakeover || !contactTrigger) return;

    const triggerTop = contactTrigger.getBoundingClientRect().top;

    /* MOBILE */
    if (window.innerWidth <= 768) {

        if (triggerTop <= window.innerHeight * 0.8) {
            contactTakeover.classList.add("active");
            document.body.classList.add("contact-open");
        } else {
            contactTakeover.classList.remove("active");
            document.body.classList.remove("contact-open");
        }

        return;
    }

    /* PC */
    if (triggerTop <= window.innerHeight * 0.3) {
        contactTakeover.classList.add("active");
        document.body.classList.add("contact-open");
    } else {
        contactTakeover.classList.remove("active");
        document.body.classList.remove("contact-open");
    }
}

window.addEventListener("scroll", handleContactTakeover);

/* =========================
   5. MOBILE HEADER STATE
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

/* =========================
   6. INIT
========================= */

handleMobileHeader();