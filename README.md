# RCOL — Colombia DAO

> The People's Coin 🇨🇴 · El primer memecoin de Colombia en World Chain

Sitio web oficial de **RCOL**, construido como sitio estático (HTML/CSS/JS puros) listo para GitHub Pages.

## 🔗 Enlaces

- **Contract Address:** `0x82bF7aA0680D9C2D6fFa77b995e2092fE68d308a`
- **Red:** World Chain
- **Chart (DexScreener):** https://dexscreener.com/worldchain/0x82bF7aA0680D9C2D6fFa77b995e2092fE68d308a
- **Comprar en PUF (World App):** https://world.org/mini-app?app_id=app_e5ba7c3061400e361f98ce44d8b1b9c4&path=/token/0x82bf7aa0680d9c2d6ffa77b995e2092fe68d308a
- **Comprar en Uniswap:** https://app.uniswap.org/swap?outputCurrency=0x82bF7aA0680D9C2D6fFa77b995e2092fE68d308a&chain=worldchain

## 📁 Estructura

```
.
├── index.html       # Página principal
├── styles.css       # Estilos
├── script.js        # Copy CA + menú móvil + ticker live
├── assets/          # Logo (también usado como favicon)
│   └── rcol-logo.png
├── .nojekyll        # Evita el procesado Jekyll de GitHub Pages
└── README.md
```

## 🚀 Desplegar en GitHub Pages

1. Ve a **Settings → Pages** del repo en GitHub.
2. En *Source*, selecciona **Deploy from a branch**.
3. Elige la rama `main` y la carpeta `/ (root)`. Guarda.
4. En 1-2 minutos el sitio quedará en:
   `https://rcol-fun.vercel.app/`

## 🛠️ Desarrollo local

Cualquier servidor estático funciona. Algunos ejemplos:

```bash
# Python
python -m http.server 8000

# Node (npx)
npx serve .

# PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000`.

## ⚠️ Disclaimer

RCOL es un memecoin y no representa consejo financiero. Las criptomonedas son altamente volátiles. Invierte solo lo que puedas permitirte perder. Haz tu propia investigación (DYOR).
