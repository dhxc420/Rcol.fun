(function () {
  var KEY = "rcol-legal-lang";
  var root = document.getElementById("legal-root");
  if (!root) return;

  function getLang() {
    try {
      var s = localStorage.getItem(KEY);
      if (s === "en" || s === "es") return s;
    } catch (e) {}
    return (navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en";
  }

  function setLang(lang) {
    document.documentElement.lang = lang;
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.hidden = el.getAttribute("data-i18n") !== lang;
    });
    document.querySelectorAll(".legal-lang button").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });
    root.querySelectorAll(".legal-footer a[data-link-es]").forEach(function (a) {
      var label = lang === "en" ? a.getAttribute("data-link-en") : a.getAttribute("data-link-es");
      if (label) a.textContent = label;
    });
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {}
  }

  document.querySelectorAll(".legal-lang button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLang(btn.getAttribute("data-lang") || "es");
    });
  });

  setLang(getLang());
})();
