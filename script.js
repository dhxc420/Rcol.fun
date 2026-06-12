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

  const fmtNum = (n) => {
    if (!isFinite(n)) return "—";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(Math.round(n));
  };

  const setStat = (id, text) => {
    const el = document.getElementById(id);
    if (el && text != null) el.textContent = text;
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
      setStat("stat-price", fmtPrice(pair.priceUsd));

      const ch = Number(pair.priceChange?.h24 ?? 0);
      const sign = ch > 0 ? "+" : "";
      setAll(
        ".tk-change",
        sign + ch.toFixed(2) + "%",
        ch >= 0 ? "tk-up" : "tk-down"
      );

      if (pair.liquidity?.usd != null) setAll(".tk-liq", fmtUsd(pair.liquidity.usd));
      const mc = pair.marketCap ?? pair.fdv;
      if (mc != null) { setAll(".tk-mcap", fmtUsd(mc)); setStat("stat-mcap", fmtUsd(mc)); }
      if (pair.volume?.h24 != null) setAll(".tk-vol", fmtUsd(pair.volume.h24));
    } catch (_) {
      /* keep snapshot values on failure */
    }
  }

  // Holders — vía explorer Blockscout de World Chain
  async function refreshHolders() {
    try {
      const r = await fetch(
        "https://worldchain-mainnet.explorer.alchemy.com/api/v2/tokens/" + WORLD_CHAIN_ADDRESS,
        { cache: "no-store" }
      );
      if (!r.ok) return;
      const d = await r.json();
      const h = Number(d.holders ?? d.holders_count ?? 0);
      if (h > 0) {
        const t = h.toLocaleString("en-US");
        setStat("stat-holders", t);
        setAll(".tk-holders", t);
      }
    } catch (_) {}
  }

  // Tokens quemados — balanceOf(dead) vía RPC (con failover)
  const RPCS = ["https://480.rpc.thirdweb.com", "https://worldchain.drpc.org"];
  async function refreshBurned() {
    const DEAD = "000000000000000000000000000000000000dead";
    const data = "0x70a08231" + "000000000000000000000000" + DEAD;
    for (const url of RPCS) {
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call",
            params: [{ to: WORLD_CHAIN_ADDRESS, data }, "latest"] }),
        });
        const d = await r.json();
        if (d && d.result && d.result !== "0x") {
          const burned = Number(BigInt(d.result) / 1000000000000000000n); // /1e18
          setStat("stat-burned", fmtNum(burned));
          setAll(".tk-burned", fmtNum(burned));
          return;
        }
      } catch (_) {}
    }
  }

  refreshTicker();
  refreshHolders();
  refreshBurned();
  setInterval(refreshTicker, 60000);   // precio/mcap cada 60s
  setInterval(refreshHolders, 300000); // holders cada 5 min
  setInterval(refreshBurned, 300000);  // quemados cada 5 min

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

  // ---------- Subtle parallax + scroll reveal ----------
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!reduceMotion) {
    // Light parallax on the Andes silhouette layers
    const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));
    if (parallaxEls.length) {
      let ticking = false;
      const applyParallax = () => {
        const y = window.scrollY || window.pageYOffset || 0;
        for (const el of parallaxEls) {
          const speed = parseFloat(el.getAttribute("data-parallax")) || 0;
          el.style.transform = "translate3d(0," + (y * speed).toFixed(1) + "px,0)";
        }
        ticking = false;
      };
      window.addEventListener(
        "scroll",
        () => {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(applyParallax);
          }
        },
        { passive: true }
      );
      applyParallax();
    }

    // Scroll reveal (fade-up) via IntersectionObserver
    if ("IntersectionObserver" in window) {
      document.documentElement.classList.add("reveal-ready");
      const revealEls = document.querySelectorAll(
        ".section-head, .feature, .token-card, .htb-step, .social-card, " +
          ".stat-card, .polygon-card, .chart-wrap, .distribution, " +
          ".htb-cta, .flag-banner"
      );
      revealEls.forEach((el, i) => {
        el.classList.add("is-reveal");
        el.style.transitionDelay = (i % 4) * 60 + "ms"; // subtle row stagger
      });
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }
})();
