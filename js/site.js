/* ============================================================
   Rhyno ERP — progressive enhancement
   Nav toggle · feature-matrix filter · demo form validation
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     1. Mobile navigation
     ---------------------------------------------------------- */
  function initNav() {
    var toggle = document.getElementById("navToggle");
    var panel = document.getElementById("mobileNav");
    if (!toggle || !panel) return;

    var iconOpen = toggle.querySelector('[data-nav-icon="open"]');
    var iconClose = toggle.querySelector('[data-nav-icon="close"]');

    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "بستن منو" : "باز کردن منو");
      if (iconOpen) iconOpen.hidden = open;
      if (iconClose) iconClose.hidden = !open;
    }

    toggle.addEventListener("click", function () {
      setOpen(panel.hidden);
    });

    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reset when resizing to desktop so the hidden attribute never leaks
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024 && !panel.hidden) setOpen(false);
    });
  }

  /* ----------------------------------------------------------
     2. Feature matrix — filter pre-rendered rows
     ---------------------------------------------------------- */
  function initMatrix() {
    document.querySelectorAll("[data-matrix]").forEach(function (root) {
      var scope = root.parentElement;
      var search = scope.querySelector('[id$="-search"]');
      var role = scope.querySelector('[id$="-role"]');
      var kind = scope.querySelector('[id$="-kind"]');
      var count = scope.querySelector("[data-matrix-count]");
      var reset = scope.querySelector("[data-matrix-reset]");
      var empty = root.querySelector("[data-matrix-empty]");
      var rows = Array.prototype.slice.call(root.querySelectorAll(".matrix-row"));
      if (!rows.length) return;

      var total = rows.length;
      var faDigits = "۰۱۲۳۴۵۶۷۸۹";
      function fa(n) {
        return String(n).replace(/\d/g, function (d) {
          return faDigits[+d];
        });
      }

      function apply() {
        var q = (search && search.value ? search.value : "").trim().toLowerCase();
        var r = role ? role.value : "";
        var k = kind ? kind.value : "";
        var shown = 0;

        rows.forEach(function (row) {
          var hay = (
            row.getAttribute("data-feature") +
            " " +
            row.getAttribute("data-module") +
            " " +
            row.getAttribute("data-role") +
            " " +
            row.getAttribute("data-kind")
          ).toLowerCase();

          var ok =
            (!q || hay.indexOf(q) !== -1) &&
            (!r || row.getAttribute("data-role").indexOf(r) !== -1) &&
            (!k || row.getAttribute("data-kind") === k);

          row.hidden = !ok;
          if (ok) shown++;
        });

        if (count) count.textContent = "نمایش " + fa(shown) + " از " + fa(total) + " امکان";
        if (empty) empty.hidden = shown !== 0;
        if (reset) reset.hidden = !(q || r || k);
      }

      var timer;
      if (search) {
        search.addEventListener("input", function () {
          clearTimeout(timer);
          timer = setTimeout(apply, 120);
        });
      }
      if (role) role.addEventListener("change", apply);
      if (kind) kind.addEventListener("change", apply);
      if (reset) {
        reset.addEventListener("click", function () {
          if (search) search.value = "";
          if (role) role.value = "";
          if (kind) kind.value = "";
          apply();
          if (search) search.focus();
        });
      }

      apply();
    });
  }

  /* ----------------------------------------------------------
     3. Demo form — validation + states
     ---------------------------------------------------------- */
  var MOBILE_RE = /^09\d{9}$/;

  function initForms() {
    document.querySelectorAll("form[data-endpoint]").forEach(function (form) {
      var id = form.id;
      var nameEl = form.querySelector("#" + id + "-name");
      var orgEl = form.querySelector("#" + id + "-org");
      var phoneEl = form.querySelector("#" + id + "-phone");
      var moduleEl = form.querySelector("#" + id + "-module");
      var msgEl = form.querySelector("#" + id + "-message");
      var honeypot = form.querySelector('input[name="company_website"]');
      var submit = form.querySelector("[data-submit]");
      var status = form.querySelector("[data-form-status]");
      var label = form.querySelector("[data-submit-label]");
      var spinner = form.querySelector("[data-submit-spinner]");
      var arrow = form.querySelector("[data-submit-arrow]");
      if (!nameEl || !submit) return;

      var defaultLabel = label ? label.textContent : "ارسال";

      function errorFor(input) {
        return form.querySelector("#" + input.id + "-error");
      }

      function setError(input, message) {
        var el = errorFor(input);
        if (message) {
          input.setAttribute("aria-invalid", "true");
          if (el) {
            el.textContent = message;
            el.hidden = false;
          }
        } else {
          input.removeAttribute("aria-invalid");
          if (el) {
            el.textContent = "";
            el.hidden = true;
          }
        }
      }

      function validate() {
        var firstBad = null;

        if (!nameEl.value.trim()) {
          setError(nameEl, "نام و نام خانوادگی را وارد کنید.");
          firstBad = firstBad || nameEl;
        } else setError(nameEl, "");

        if (!orgEl.value.trim()) {
          setError(orgEl, "نام سازمان را وارد کنید.");
          firstBad = firstBad || orgEl;
        } else setError(orgEl, "");

        var phone = phoneEl.value.replace(/[\s-]/g, "").replace(/[۰-۹]/g, function (d) {
          return String("۰۱۲۳۴۵۶۷۸۹".indexOf(d));
        });
        if (!phone) {
          setError(phoneEl, "شماره موبایل را وارد کنید.");
          firstBad = firstBad || phoneEl;
        } else if (!MOBILE_RE.test(phone)) {
          setError(phoneEl, "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.");
          firstBad = firstBad || phoneEl;
        } else setError(phoneEl, "");

        return { ok: !firstBad, firstBad: firstBad, phone: phone };
      }

      [nameEl, orgEl, phoneEl].forEach(function (input) {
        input.addEventListener("blur", function () {
          if (input.value.trim()) validate();
        });
        input.addEventListener("input", function () {
          if (input.getAttribute("aria-invalid") === "true") {
            var el = errorFor(input);
            if (el) {
              el.hidden = true;
              el.textContent = "";
            }
            input.removeAttribute("aria-invalid");
          }
        });
      });

      function showStatus(type, message) {
        if (!status) return;
        status.hidden = false;
        status.className =
          "rounded-lg border p-3.5 text-sm font-semibold " +
          (type === "success"
            ? "border-teal-200 bg-teal-50 text-teal-700"
            : "border-red-200 bg-red-50 text-red-700");
        status.textContent = message;
      }

      function setLoading(on) {
        submit.disabled = on;
        if (label) label.textContent = on ? "در حال ارسال…" : defaultLabel;
        if (spinner) spinner.hidden = !on;
        if (arrow) arrow.hidden = on;
        submit.setAttribute("aria-busy", String(on));
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Honeypot: silently accept and discard bot submissions
        if (honeypot && honeypot.value.trim() !== "") return;

        var result = validate();
        if (!result.ok) {
          if (status) status.hidden = true;
          if (result.firstBad) result.firstBad.focus();
          return;
        }

        setLoading(true);
        if (status) status.hidden = true;

        var payload = {
          access_key: form.getAttribute("data-access-key") || "",
          subject: "درخواست دمو — " + orgEl.value.trim(),
          name: nameEl.value.trim(),
          organization: orgEl.value.trim(),
          phone: result.phone,
          module:
            moduleEl && moduleEl.selectedIndex >= 0
              ? moduleEl.options[moduleEl.selectedIndex].textContent.trim()
              : "",
          message: msgEl ? msgEl.value.trim() : "",
          from_name: "وب‌سایت راینو",
        };

        fetch(form.getAttribute("data-endpoint"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            return res.json().catch(function () {
              return { success: res.ok };
            });
          })
          .then(function (data) {
            if (data && data.success) {
              showStatus(
                "success",
                "درخواست شما ثبت شد. کارشناس ما در ساعات کاری با شما تماس می‌گیرد."
              );
              form.reset();
              [nameEl, orgEl, phoneEl].forEach(function (i) {
                setError(i, "");
              });
              if (status) status.focus({ preventScroll: false });
            } else {
              showStatus(
                "error",
                "ارسال انجام نشد. لطفاً دوباره تلاش کنید یا با ۰۲۱-۷۷۴۳۹۱۴۱ تماس بگیرید."
              );
            }
          })
          .catch(function () {
            showStatus(
              "error",
              "ارتباط برقرار نشد. اتصال اینترنت را بررسی کنید یا با ۰۲۱-۷۷۴۳۹۱۴۱ تماس بگیرید."
            );
          })
          .then(function () {
            setLoading(false);
          });
      });
    });
  }

  /* ----------------------------------------------------------
     4. Accordion — one open at a time within a group
     ---------------------------------------------------------- */
  function initAccordions() {
    document.querySelectorAll(".accordion-item").forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open || reduceMotion) return;
        var group = item.parentElement;
        if (!group) return;
        group.querySelectorAll(".accordion-item[open]").forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  function boot() {
    initNav();
    initMatrix();
    initForms();
    initAccordions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
