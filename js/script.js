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

// Article Slider Navigation
document.addEventListener("DOMContentLoaded", () => {
  const articleSlider = document.getElementById("articleSlider");
  const prevBtn = document.getElementById("articlePrevBtn");
  const nextBtn = document.getElementById("articleNextBtn");

  if (articleSlider && prevBtn && nextBtn) {
    const posts = articleSlider.querySelectorAll(".linkedin-post");
    let currentIndex = 0;

    // Calculate scroll amount (width of one post + gap)
    function getScrollAmount() {
      if (posts.length > 0) {
        const postWidth = posts[0].offsetWidth;
        const gap = 16; // 1.5rem = 24px
        return postWidth + gap;
      }
      return 0;
    }

    // Update button states
    function updateButtonStates() {
      const maxScroll = articleSlider.scrollWidth - articleSlider.clientWidth;
      const currentScroll = articleSlider.scrollLeft;

      prevBtn.style.opacity = currentScroll <= 0 ? "0.5" : "1";
      nextBtn.style.opacity = currentScroll >= maxScroll - 1 ? "0.5" : "1";

      prevBtn.style.pointerEvents = currentScroll <= 0 ? "none" : "auto";
      nextBtn.style.pointerEvents =
        currentScroll >= maxScroll - 1 ? "none" : "auto";
    }

    // Scroll to previous post
    prevBtn.addEventListener("click", () => {
      const scrollAmount = getScrollAmount();
      articleSlider.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    });

    // Scroll to next post
    nextBtn.addEventListener("click", () => {
      const scrollAmount = getScrollAmount();
      articleSlider.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    });

    // Update button states on scroll
    articleSlider.addEventListener("scroll", updateButtonStates);

    // Update button states on window resize
    window.addEventListener("resize", updateButtonStates);

    // Initial button state update
    updateButtonStates();
  }
});
