window.addEventListener("load", () => {
    const heroContent = document.querySelector(".hero-content");
    heroContent.classList.add("is-active");
});

const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
            }
        });
    },
    { threshold: 0.2 }
);

reveals.forEach(el => observer.observe(el));