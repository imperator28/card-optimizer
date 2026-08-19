# Card Optimizer

A personal credit-card decision tool: plug in your own wallet and it tells you, right now, which card to use — for cash flow, for a specific spending category, and for purchase/travel protections.

There's no backend, no API keys, and no card-linking. Every card's rewards, point valuation, and protection terms are plain JavaScript data that you (or an AI agent on your behalf) hand-curate from public issuer sources. That makes this repo less a finished product and more a **template**: fork it, replace the data with your own cards, and you have a personalized version in minutes.

## What it does

The dashboard is built around three decision pillars — the three questions you actually ask before pulling out a card:

1. **Billing Priority (Cash Flow).** Ranks your cards by days of interest-free float remaining before the next payment is due, computed from each card's statement closing day. For a big purchase, the top card gives you the longest runway to pay it off.
2. **Rewards Priority (Category Return).** For every spending category (dining, groceries, travel, gas, plus any brand-specific ones you add — airline, hotel, etc.), it computes `multiplier × point value` as an effective cash-back percentage per card, and surfaces the winner. Ties are shown explicitly rather than picking one arbitrarily.
3. **Protections & Perks.** A shared vocabulary of purchase and travel protections (extended warranty, purchase protection, trip delay, rental car collision damage waiver, cell phone protection, etc.) compared across your whole wallet — and *ranked*, not just listed: primary rental-car coverage outranks secondary, a 6-hour trip-delay trigger outranks a 12-hour one, and so on. Card-specific extras that don't generalize (lounge passes, statement credits, companion awards) show up as an unranked perks list on each card's detail view.

A short natural-language "Wallet Strategy" summary at the top stitches the Rewards Priority winners into a sentence — a template built from the underlying data, not an actual LLM call (the in-app "Add Card" search is a simulated lookup for the same reason: it fuzzy-matches your input against the card database and pretends to "research" it).

## Why this exists / who it's for

This is a personal reference tool, not a financial product. All reward multipliers, point valuations, and protection terms are **manually curated estimates** — always verify against your issuer's current Terms and Guide to Benefits before relying on them for a real purchase or claim.

## Fork it for your own wallet

The entire personalization surface lives in one file, [`src/App.jsx`](src/App.jsx), as four plain JS structures near the top:

| Structure | What it controls |
|---|---|
| `CARD_DATABASE` | One entry per card you own — rewards, point value, protections, perks. |
| `CATEGORIES` | The spending categories you want ranked (add a brand-specific one, e.g. a hotel or airline you're loyal to). |
| `BENEFITS` | The protection/perk *types* compared across cards (extended warranty, trip delay, rental car CDW, ...). |
| the default `cards` array (inside `App()`) | Your actual wallet — which cards from `CARD_DATABASE` you hold, and each one's real statement closing day. |

No other file needs to change. Rewards math, category winners, tie handling, protection ranking, and the wallet-strategy summary are all *derived* from this data — nothing is hardcoded per-card in the UI.

### Card entry shape

```js
"Your Card Name": {
  provider: "Issuer Name",             // shown on the card detail header
  color: "bg-blue-600",                // any Tailwind bg-* class — colors the mini card icon
  pointValue: 1.5,                     // cents per point/mile, used to compute $ return
  rewards: { dining: 3, travel: 1, grocery: 1.5 /* , ...one multiplier per category id */ },
  notes: "Short summary shown in the card detail modal.",
  protections: {
    rentalCar: { covered: true, tier: 1, tierLabel: "Primary", detail: "Primary CDW, up to $75k" }
    // tier: 1 = best-in-wallet (e.g. "Primary", a 6-hr delay trigger) ... 3 = weakest.
    // Omit a benefit id entirely if the card doesn't offer it.
  },
  perks: ["Free checked bag", "$100 annual travel credit" /* , ...unranked, card-specific extras */]
}
```

Any category you don't set on a card's `rewards` falls back to a neutral `1` (1x / 1¢), so you only need to list where a card actually beats that baseline.

## Using an AI coding agent to personalize this

If you're using Claude Code, Cursor, GitHub Copilot, or a similar agent to fork and personalize this repo, point it at **[AGENTS.md](AGENTS.md)** — it has the exact data contract above plus copy-paste recipes for adding a card, adding a category, verifying the change, and deploying. Claude Code users also get a packaged skill (`.claude/skills/personalize-wallet`) that runs the same workflow interactively — see below.

### Should you add a "skills" folder to your own fork?

If you plan to keep asking an AI agent to maintain this wallet over time (new card, annual-fee-changes update, a benefit that got nerfed), yes — a short `AGENTS.md` plus a thin agent skill is worth it. It costs one file and pays for itself the first time you ask an agent to "add my new card" and it does the research + edit + verify + deploy loop unsupervised instead of guessing at the data shape from scratch. If you're only forking this once for a single personal build, `AGENTS.md` alone is enough.

## Tech Stack

* **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Deployment:** GitHub Pages (via the [`gh-pages`](https://www.npmjs.com/package/gh-pages) package)
* **Backend:** none — everything is static, client-side, and derived from the data file above

## Run locally

Requires Node **20.19+ or 22.12+** (Vite 7).

```bash
git clone https://github.com/imperator28/card-optimizer.git
cd card-optimizer
npm install
npm run dev
```

Open `http://localhost:5173`.

## Deploy to your own GitHub Pages

Two places need to agree on your repo name:

1. [`vite.config.js`](vite.config.js) → `base: "/your-repo-name/"`
2. [`package.json`](package.json) → `"homepage": "https://<you>.github.io/<your-repo-name>"`

Then:

```bash
npm run deploy
```

This builds the app (`predeploy` → `vite build`) and pushes `dist/` to a `gh-pages` branch via the `gh-pages` package. The first time, enable GitHub Pages for that branch in your repo's **Settings → Pages**.

## Mobile Support

Fully responsive and installable as a home-screen app.

* **iOS:** Safari → Share → "Add to Home Screen"
* **Android:** Chrome → Menu → "Add to Home screen"

## Data accuracy disclaimer

Reward multipliers, point valuations, and protection terms are best-effort estimates gathered from public issuer materials at a point in time. Card terms change — verify current terms with your issuer before making a purchase decision or filing a claim based on what this app shows.

---

*Built with React & Tailwind CSS.*
