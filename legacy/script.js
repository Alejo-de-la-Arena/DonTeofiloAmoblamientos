(() => {
  "use strict";

  const slides = [
    "Cocinas que inspiran",
    "Placards a tu medida",
    "Cada detalle importa",
    "Carpintería de autor",
  ];

  const testimonials = [
    { quote: "Transformaron nuestra cocina por completo. El nivel de detalle y la calidad de la madera superaron lo que imaginábamos.", name: "María Fernanda G.", project: "Cocina completa — Palermo, CABA" },
    { quote: "Un placard hecho a medida que aprovecha cada centímetro. Puntuales, prolijos y con un acabado impecable.", name: "Julián Ortega", project: "Placard y vestidor — Tandil" },
    { quote: "Nos acompañaron desde la primera charla hasta la instalación. Se nota que aman lo que hacen.", name: "Carla y Diego M.", project: "Diseño integral — Nordelta" },
  ];

  // ---------- nav solid state + top scroll progress ----------
  const nav = document.getElementById("nav");
  const progressBar = document.getElementById("progressBar");
  let scrollRaf = null;
  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;
      const y = window.scrollY || 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      nav.classList.toggle("solid", y > 80);
      progressBar.style.width = (h > 0 ? Math.min(1, y / h) : 0) * 100 + "%";
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- mobile nav ----------
  const navBurger = document.getElementById("navBurger");
  const navMobile = document.getElementById("navMobile");
  navBurger.addEventListener("click", () => {
    const open = navMobile.classList.toggle("open");
    navBurger.setAttribute("aria-expanded", String(open));
  });
  navMobile.querySelectorAll(".nav-mobile-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMobile.classList.remove("open");
      navBurger.setAttribute("aria-expanded", "false");
    });
  });

  // ---------- hero slideshow ----------
  const heroSlideEls = document.querySelectorAll(".hero-slide");
  const heroTitleEl = document.getElementById("heroTitle");
  const fills = document.querySelectorAll(".hero-progress-fill");
  const DUR = 6500;
  let active = 0;
  let start = performance.now();
  let heroRaf;

  function setActive(i) {
    active = i;
    start = performance.now();
    heroSlideEls.forEach((el, idx) => el.classList.toggle("active", idx === i));
    heroTitleEl.textContent = slides[i];
  }

  function tick(now) {
    const elapsed = now - start;
    const p = Math.min(1, elapsed / DUR);
    fills.forEach((fill, idx) => {
      const pct = idx < active ? 100 : idx === active ? p * 100 : 0;
      fill.style.setProperty("--fill", pct + "%");
    });
    if (p >= 1) setActive((active + 1) % slides.length);
    heroRaf = requestAnimationFrame(tick);
  }
  setActive(0);
  heroRaf = requestAnimationFrame(tick);

  document.querySelectorAll(".hero-progress-seg").forEach((btn) => {
    btn.addEventListener("click", () => setActive(parseInt(btn.dataset.slide, 10)));
  });

  // ---------- reveal on scroll ----------
  const revObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.getAttribute("data-reveal-delay") || "0", 10);
          setTimeout(() => entry.target.classList.add("is-visible"), delay);
          revObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => revObserver.observe(el));

  // ---------- count-up ----------
  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const prefix = el.getAttribute("data-prefix") || "";
    const dur = 1400;
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

  // ---------- before/after slider ----------
  const baSlider = document.getElementById("baSlider");
  const baBeforeWrap = document.getElementById("baBeforeWrap");
  const baHandle = document.getElementById("baHandle");
  let dragging = false;

  function setBaPos(pos) {
    const clamped = Math.max(2, Math.min(98, pos));
    baBeforeWrap.style.clipPath = `inset(0 0 0 ${clamped}%)`;
    baHandle.style.left = clamped + "%";
  }
  function onBaMove(ev) {
    if (!dragging) return;
    const r = baSlider.getBoundingClientRect();
    const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
    setBaPos(((cx - r.left) / r.width) * 100);
  }
  baSlider.addEventListener("mousedown", () => (dragging = true));
  baSlider.addEventListener("touchstart", () => (dragging = true));
  window.addEventListener("mousemove", onBaMove);
  window.addEventListener("touchmove", onBaMove, { passive: true });
  window.addEventListener("mouseup", () => (dragging = false));
  window.addEventListener("touchend", () => (dragging = false));

  // ---------- testimonials carousel ----------
  const tQuote = document.getElementById("tQuote");
  const tName = document.getElementById("tName");
  const tProject = document.getElementById("tProject");
  const tDots = document.querySelectorAll(".t-dot");
  let tIndex = 0;

  function renderTestimonial() {
    const t = testimonials[tIndex];
    [tQuote, tName, tProject].forEach((el) => (el.style.opacity = "0"));
    setTimeout(() => {
      tQuote.textContent = `"${t.quote}"`;
      tName.textContent = t.name;
      tProject.textContent = t.project;
      [tQuote, tName, tProject].forEach((el) => (el.style.opacity = "1"));
    }, 200);
    tDots.forEach((dot, idx) => dot.classList.toggle("active", idx === tIndex));
  }
  document.getElementById("tPrev").addEventListener("click", () => {
    tIndex = (tIndex + testimonials.length - 1) % testimonials.length;
    renderTestimonial();
  });
  document.getElementById("tNext").addEventListener("click", () => {
    tIndex = (tIndex + 1) % testimonials.length;
    renderTestimonial();
  });
  tDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      tIndex = parseInt(dot.dataset.t, 10);
      renderTestimonial();
    });
  });
})();
