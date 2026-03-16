const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const sections = [...document.querySelectorAll("main section[id]")];
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const progressBar = document.querySelector(".scroll-progress-bar");
const themeToggle = document.querySelector(".theme-toggle");
const hoverTargets = document.querySelectorAll(
  "a, button, .project-card, .stats-card, .chip-group span"
);
const tiltTargets = document.querySelectorAll(
  ".hero-card, .project-card, .stats-card, .gallery-card, .content-card, .value-panel, .quick-facts li"
);
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
    // Ignore storage errors and keep the session theme only.
  }
};

const savedTheme = getSavedTheme();

const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);

  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }
};

applyTheme(savedTheme || (prefersDarkTheme.matches ? "dark" : "light"));

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteNav?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => observer.observe(item));

const updateProgress = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  document.body.classList.toggle("is-scrolled", scrollTop > 18);
};

const updateActiveNav = () => {
  const marker = window.scrollY + 140;

  let currentId = "";
  sections.forEach((section) => {
    if (section.offsetTop <= marker) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentId}`;
    link.classList.toggle("is-active", isActive);
  });
};

window.addEventListener("scroll", () => {
  updateProgress();
  updateActiveNav();
});

window.addEventListener("load", () => {
  updateProgress();
  updateActiveNav();
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });
}

prefersDarkTheme.addEventListener("change", (event) => {
  if (!getSavedTheme()) {
    applyTheme(event.matches ? "dark" : "light");
  }
});

const prefersFinePointer = window.matchMedia("(pointer: fine)");

if (cursorDot && cursorRing && prefersFinePointer.matches) {
  document.body.classList.add("cursor-enabled");

  let ringX = 0;
  let ringY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let isCursorVisible = false;

  const showCursor = () => {
    if (!isCursorVisible) {
      cursorDot.classList.add("is-visible");
      cursorRing.classList.add("is-visible");
      isCursorVisible = true;
    }
  };

  const hideCursor = () => {
    cursorDot.classList.remove("is-visible");
    cursorRing.classList.remove("is-visible");
    cursorDot.classList.remove("is-hovering");
    cursorRing.classList.remove("is-hovering");
    isCursorVisible = false;
  };

  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  };

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    showCursor();
  });

  document.addEventListener("mouseleave", hideCursor);
  window.addEventListener("blur", hideCursor);

  hoverTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      cursorDot.classList.add("is-hovering");
      cursorRing.classList.add("is-hovering");
    });

    target.addEventListener("mouseleave", () => {
      cursorDot.classList.remove("is-hovering");
      cursorRing.classList.remove("is-hovering");
    });
  });

  animateRing();
}

if (prefersFinePointer.matches) {
  tiltTargets.forEach((target) => {
    target.setAttribute("data-tilt", "");

    target.addEventListener("mousemove", (event) => {
      const rect = target.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const rotateY = ((offsetX / rect.width) - 0.5) * 8;
      const rotateX = (0.5 - (offsetY / rect.height)) * 8;

      target.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    target.addEventListener("mouseleave", () => {
      target.style.transform = "";
    });
  });
}
