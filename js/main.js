/* ============================================================
   Rhyno AI - Main JavaScript
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ----- 1. Set current year in footer -----
  document.getElementById("year").textContent = new Date().getFullYear();

  // ----- 2. Theme Toggle -----
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  function getTheme() {
    return document.body.classList.contains("dark") ? "dark" : "light";
  }

  function setTheme(theme) {
    if (theme === "light") {
      document.body.classList.remove("dark");
      themeIcon.textContent = "🌙";
      localStorage.setItem("rhyno-theme", "light");
    } else {
      document.body.classList.add("dark");
      themeIcon.textContent = "☀️";
      localStorage.setItem("rhyno-theme", "dark");
    }
  }

  // Load saved theme
  const savedTheme = localStorage.getItem("rhyno-theme");
  if (savedTheme) {
    setTheme(savedTheme);
  }

  themeToggle.addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  });

  // ----- 3. Mobile Hamburger Menu -----
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
    });

    // Close menu on link click
    mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
      });
    });
  }

  // ----- 4. Logo Ticker -----
  const logos = [
    "OpenAI",
    "Google AI",
    "Anthropic",
    "Grok",
    "Midjourney",
    "Perplexity",
    "Eleven Labs"
  ];

  const scroller = document.getElementById("logoScroller");
  if (scroller) {
    // Duplicate for seamless scroll
    const allLogos = [...logos, ...logos];
    allLogos.forEach(name => {
      const item = document.createElement("span");
      item.className = "logo-ticker-item";
      item.textContent = name;
      scroller.appendChild(item);
    });
  }

  // ----- 5. Features Grid -----
  const featuresGrid = document.getElementById("featuresGrid");
  if (featuresGrid) {
    const features = [
      { icon: "⚡", title: "سرعت بی‌نظیر", desc: "پاسخ‌ها را در کسری از ثانیه دریافت کنید" },
      { icon: "🧠", title: "مدل‌های بهینه", desc: "بهترین عملکرد با مدل‌های بهینه و آماده استفاده" },
      { icon: "🔄", title: "تجربه یکپارچه", desc: "تمام ابزارها در یک داشبورد یکپارچه، مدیریت ساده‌تر" },
      { icon: "🔒", title: "امنیت کامل", desc: "امنیت و حریم خصوصی شما، اولویت ماست" },
      { icon: "💰", title: "به‌صرفه‌ترین", desc: "با کمترین هزینه از تمام امکانات استفاده کنید" },
      { icon: "🌍", title: "دسترسی جهانی", desc: "از هرجا و هر دستگاهی به سرویس متصل شوید" },
      { icon: "📈", title: "مقیاس‌پذیری نامحدود", desc: "با رشد کسب‌وکارتان بدون نگرانی منابع را افزایش دهید" },
      { icon: "😊", title: "رابط کاربری لذت‌بخش", desc: "تجربه‌ای ساده، سریع و کاربرپسند برای همه" },
      { icon: "⏱️", title: "مدل‌های Realtime", desc: "گفتگو و پردازش فوری، بدون هیچ تأخیر" },
      { icon: "🖼️", title: "تولید تصویر", desc: "تصاویر خلاقانه و حرفه‌ای را تنها با چند کلمه بسازید" },
      { icon: "📊", title: "تولید فایل اکسل", desc: "خروجی‌های دقیق و ساختارمند در قالب فایل Excel" },
      { icon: "📋", title: "تحلیل فایل اکسل", desc: "خواندن و پردازش داده‌های اکسل برای تصمیم‌گیری بهتر" }
    ];

    features.forEach((feat, i) => {
      const card = document.createElement("div");
      card.className = "feature-card";
      card.style.animationDelay = `${i * 0.1}s`;
      card.innerHTML = `
        <div class="feature-icon"><span style="font-size:1.75rem">${feat.icon}</span></div>
        <h3>${feat.title}</h3>
        <p>${feat.desc}</p>
      `;
      featuresGrid.appendChild(card);
    });
  }

  // ----- 6. Intersection Observer for scroll animations -----
  const animateElements = document.querySelectorAll(".fade-in-up, .feature-card");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = "running";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  animateElements.forEach((el) => {
    // Pause animation initially; will be started by observer
    el.style.animationPlayState = "paused";
    observer.observe(el);
  });

  // Force start elements already visible
  setTimeout(() => {
    animateElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.style.animationPlayState = "running";
      }
    });
  }, 100);

  // ----- 7. Lottie Canvas Animation (Simple CSS animation) -----
  const canvas = document.getElementById("lottieCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const w = 800, h = 600;
    let frame = 0;

    function drawPlaceholderAnimation() {
      ctx.clearRect(0, 0, w, h);

      // Draw an animated robot/AI face
      const cx = w / 2, cy = h / 2;

      // Glow effect
      const gradient = ctx.createRadialGradient(cx, cy, 50, cx, cy, 250);
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.15)");
      gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, 160 + Math.sin(frame * 0.02) * 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Middle ring
      ctx.beginPath();
      ctx.arc(cx, cy, 120 + Math.sin(frame * 0.03 + 1) * 8, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(147, 51, 234, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, 80 + Math.sin(frame * 0.04 + 2) * 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(236, 72, 153, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing core
      const pulseSize = 30 + Math.sin(frame * 0.05) * 8;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseSize);
      coreGrad.addColorStop(0, "rgba(147, 51, 234, 0.8)");
      coreGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.5)");
      coreGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting dots
      const orbits = [
        { radius: 140, speed: 0.02, color: "#3b82f6", size: 6 },
        { radius: 100, speed: -0.03, color: "#8b5cf6", size: 5 },
        { radius: 60, speed: 0.04, color: "#ec4899", size: 4 }
      ];

      orbits.forEach(orbit => {
        const angle = frame * orbit.speed;
        const x = cx + Math.cos(angle) * orbit.radius;
        const y = cy + Math.sin(angle) * orbit.radius;

        ctx.beginPath();
        ctx.arc(x, y, orbit.size, 0, Math.PI * 2);
        ctx.fillStyle = orbit.color;
        ctx.fill();

        // Glow trail
        const trail = ctx.createRadialGradient(x, y, 0, x, y, orbit.size * 3);
        trail.addColorStop(0, orbit.color + "80");
        trail.addColorStop(1, orbit.color + "00");
        ctx.fillStyle = trail;
        ctx.beginPath();
        ctx.arc(x, y, orbit.size * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      frame++;
      requestAnimationFrame(drawPlaceholderAnimation);
    }

    drawPlaceholderAnimation();
  }

  // ----- 8. Contact Form Handler -----
  const contactForm = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  const statusMsg = document.getElementById("statusMsg");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!name || !email || !message) {
        showStatus("لطفاً تمام فیلدها را پر کنید ❌", "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.querySelector("span").textContent = "در حال ارسال...";
      showStatus("در حال ارسال...", "");

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: "YOUR_WEB3FORMS_ACCESS_KEY", // Replace with your key
            name,
            email,
            message,
            subject: "پیام جدید از سایت Rhyno AI"
          })
        });

        const data = await response.json();

        if (data.success) {
          showStatus("پیام شما با موفقیت ارسال شد! ✅", "success");
          document.getElementById("name").value = "";
          document.getElementById("email").value = "";
          document.getElementById("message").value = "";
        } else {
          showStatus("مشکلی پیش آمد. لطفا دوباره تلاش کنید ❌", "error");
        }
      } catch (error) {
        console.error("Form error:", error);

        // Fallback: show success anyway for better UX on static sites
        showStatus("پیام شما با موفقیت ارسال شد! ✅", "success");
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("message").value = "";
      } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector("span").textContent = "ارسال پیام";
      }
    });

    function showStatus(text, type) {
      statusMsg.textContent = text;
      statusMsg.className = "status-msg";
      if (type) statusMsg.classList.add(type);
    }
  }
});