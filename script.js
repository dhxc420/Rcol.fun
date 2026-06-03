(() => {
  const CONTRACT_ADDRESS = "0x82bF7aA0680D9C2D6fFa77b995e2092fE68d308a";

  // Copy contract address — works for both header and footer buttons
  const copyButtons = document.querySelectorAll(".ca-button");
  copyButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      } catch {
        // Fallback for older browsers / file:// origins
        const ta = document.createElement("textarea");
        ta.value = CONTRACT_ADDRESS;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (_) {}
        document.body.removeChild(ta);
      }
      btn.classList.add("copied");
      setTimeout(() => btn.classList.remove("copied"), 2000);
    });
  });

  // Mobile nav toggle
  const navToggle = document.getElementById("nav-toggle");
  const navMobile = document.getElementById("nav-mobile");
  if (navToggle && navMobile) {
    navToggle.addEventListener("click", () => {
      const open = navMobile.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navMobile.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navMobile.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }
})();
