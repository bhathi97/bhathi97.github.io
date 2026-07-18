const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const sections = [...document.querySelectorAll("main section[id]")];
const progressBar = document.querySelector(".scroll-progress-bar");
const themeToggle = document.querySelector(".theme-toggle");
const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");

const getSavedTheme = () => {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
};

const saveTheme = (theme) => {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Keep session theme only if storage is unavailable.
  }
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);

  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
  }
};

applyTheme(getSavedTheme() || (prefersDarkTheme.matches ? "dark" : "light"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
);

revealItems.forEach((item) => observer.observe(item));

const updateProgress = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  document.body.classList.toggle("is-scrolled", scrollTop > 24);
};

const updateActiveNav = () => {
  const marker = window.scrollY + (window.matchMedia("(max-width: 920px)").matches ? 80 : 120);
  let currentId = "";

  sections.forEach((section) => {
    if (section.offsetTop <= marker) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const isActive = href === `#${currentId}`;
    link.classList.toggle("is-active", isActive);
  });
};

const onScroll = () => {
  updateProgress();
  updateActiveNav();
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("load", onScroll);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    saveTheme(next);
  });
}

prefersDarkTheme.addEventListener("change", (event) => {
  if (!getSavedTheme()) {
    applyTheme(event.matches ? "dark" : "light");
  }
});
