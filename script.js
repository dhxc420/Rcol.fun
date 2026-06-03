(() => {
  const WORLD_CHAIN_ADDRESS = "0x82bF7aA0680D9C2D6fFa77b995e2092fE68d308a";

  // Copy contract address — each button reads data-address (or falls back to World Chain)
  const copyButtons = document.querySelectorAll(".ca-button");
  copyButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const addr = btn.dataset.address || WORLD_CHAIN_ADDRESS;
      try {
        await navigator.clipboard.writeText(addr);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = addr;
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

  // ---------- Live ticker (DexScreener) ----------
  const DEX_API =
    "https://api.dexscreener.com/latest/dex/tokens/" + WORLD_CHAIN_ADDRESS;

  const fmtUsd = (n) => {
    if (!isFinite(n)) return "—";
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    return "$" + Math.round(n);
  };

  const fmtPrice = (n) => {
    const f = Number(n);
    if (!isFinite(f) || f <= 0) return "—";
    if (f >= 1) return "$" + f.toFixed(4);
    // keep up to 4 significant digits for tiny prices, trim trailing zeros
    let s = f.toFixed(12).replace(/0+$/, "");
    return "$" + s;
  };

  const setAll = (cls, text, extraClass) => {
    document.querySelectorAll(cls).forEach((el) => {
      el.textContent = text;
      if (extraClass !== undefined) {
        el.classList.remove("tk-up", "tk-down");
        if (extraClass) el.classList.add(extraClass);
      }
    });
  };

  async function refreshTicker() {
    try {
      const res = await fetch(DEX_API, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const pairs = data && data.pairs ? data.pairs : [];
      if (!pairs.length) return;

      // Prefer the most liquid pair
      const pair = pairs.reduce((best, p) =>
        (p.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? p : best
      );

      setAll(".tk-price", fmtPrice(pair.priceUsd));

      const ch = Number(pair.priceChange?.h24 ?? 0);
      const sign = ch > 0 ? "+" : "";
      setAll(
        ".tk-change",
        sign + ch.toFixed(2) + "%",
        ch >= 0 ? "tk-up" : "tk-down"
      );

      if (pair.liquidity?.usd != null) setAll(".tk-liq", fmtUsd(pair.liquidity.usd));
      const mc = pair.marketCap ?? pair.fdv;
      if (mc != null) setAll(".tk-mcap", fmtUsd(mc));
      if (pair.volume?.h24 != null) setAll(".tk-vol", fmtUsd(pair.volume.h24));
    } catch (_) {
      /* keep snapshot values on failure */
    }
  }

  refreshTicker();
  setInterval(refreshTicker, 60000); // refresh every 60s

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
