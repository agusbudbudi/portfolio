// Theme Toggle Function

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  // set theme ke body
  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

// jalankan sekali waktu load, biar sesuai theme yang disimpan
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.setAttribute("data-theme", savedTheme);
});

// Load saved theme
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.setAttribute("data-theme", savedTheme);
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  });
});

// Scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

document.querySelectorAll(".fade-in").forEach((el) => {
  observer.observe(el);
});

// Active navigation on scroll
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".nav-center a");

  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Read More/Less functionality for endorsements
document.addEventListener("DOMContentLoaded", () => {
  const readMoreBtns = document.querySelectorAll(".read-more-btn");

  readMoreBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const description = btn.previousElementSibling;
      const isCollapsed = description.classList.contains("collapsed");

      if (isCollapsed) {
        description.classList.remove("collapsed");
        description.classList.add("expanded");
        btn.textContent = "See less";
      } else {
        description.classList.remove("expanded");
        description.classList.add("collapsed");
        btn.textContent = "See more";
      }
    });
  });
});

// Fungsi reusable
function makeOpenInNewTab(elementId, url) {
  const el = document.getElementById(elementId);
  if (el) {
    el.style.cursor = "pointer"; // kasih efek hover tangan
    el.addEventListener("click", () => {
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }
}

// Contoh penggunaan
makeOpenInNewTab("toTestGen", "https://agusbudbudi.github.io/TestGen/");
makeOpenInNewTab("toSplitBill", "https://splitbill-alpha.vercel.app/");
makeOpenInNewTab("toPortfolioQa", "https://agusbudbudi.github.io/portfolio/");
