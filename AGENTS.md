# AGENTS.md

Instructions for AI coding agents (Claude Code, Cursor, GitHub Copilot, or similar) working in this repository. Read this before editing `src/App.jsx`.

## What this project is

A single-page React + Vite + Tailwind app. Almost everything lives in one file, [`src/App.jsx`](src/App.jsx) (~1000 lines). There is no backend, no database, no API keys, and no card-linking — "card intelligence" is a set of hardcoded JS objects near the top of the file that a human (or an agent, on their behalf) has manually curated from public issuer sources. Keep it that way — see Constraints below.

The UI has three decision pillars, each *derived* from the data structures described below — none of it is hardcoded per-card:

1. **Billing Priority** — float/cash-flow ranking from each card's `statementDay`.
2. **Rewards Priority** — category return ranking from `rewards` × `pointValue`.
3. **Protections & Perks** — tiered comparison across `protections`, plus an unranked `perks` list per card.

## The data contract

All four structures are declared near the top of `src/App.jsx`, in this order: `CARD_DATABASE`, `CATEGORIES`, `BENEFITS`, then the default `cards` array inside `App()`.

### `CARD_DATABASE[cardName]`

```js
{
  provider: "Issuer Name",             // shown on the card detail header
  color: "bg-blue-600",                // any Tailwind bg-* class — colors the mini card icon
  pointValue: 1.5,                     // cents per point/mile; used to compute $ effective return
  rewards: { dining: 3, travel: 1, grocery: 1.5 /* , ...category id: multiplier */ },
  notes: "Short summary shown in the card detail modal.",
  protections: {
    <benefitId>: { covered: true, tier: 1, tierLabel: "Primary", detail: "Primary CDW, up to $75k" }
    // tier: 1 = strongest coverage in the wallet, 2 = standard, 3 = basic/weakest.
    // tierLabel is optional — a short override shown instead of the generic tier name
    // ("Top tier"/"Standard"/"Basic") when the raw term is more informative
    // ("Primary", "6-hr trigger", "≤5-yr warranties").
    // Omitting a benefit id (or setting covered: false) means the card does NOT offer it —
    // getCardsForBenefit() in App.jsx filters on `.covered` and defaults an absent tier to 2.
  },
  perks: ["Free checked bag", "$100 annual travel credit" /* , ...unranked, card-specific extras */]
}
```

A missing `rewards[categoryId]` falls back to `1` (neutral 1x/1¢) via `getCardMetrics()` — only set a category where the card actually beats that baseline.

### `CATEGORIES`

```js
{ id: 'dining', label: 'Dining', icon: '🍔' }
```

`icon` can be an emoji string or a `lucide-react` element (see the `marriott`/`united` entries for the element form). `id` is the key used in every card's `rewards` object.

### `BENEFITS`

```js
{ id: 'rentalCar', label: 'Rental Car (CDW)', icon: '🚗', group: 'Purchase' | 'Travel', hint: 'Decline the counter insurance' }
```

`id` is the key used in every card's `protections` object. `group` is informational only (not currently used to partition the UI).

### Default wallet (inside `App()`)

```js
const [cards, setCards] = useState([
  { id: 1, name: "Your Card Name", statementDay: 27, ...CARD_DATABASE["Your Card Name"] },
  // ...
]);
```

`statementDay` is the day-of-month (1–31) your statement closes — it drives the Billing Priority float calculation. `id` just needs to be unique within the array.

## Recipe: add a new card

1. Research the card's *current* rewards structure, point valuation, annual fee, and protections. Prefer the issuer's own Guide to Benefits / cardmember agreement as the primary source; cross-check tier language ("primary vs. secondary CDW", delay-trigger hours, warranty-length caps) against a couple of points/miles sites (NerdWallet, The Points Guy, Doctor of Credit).
2. Add an entry to `CARD_DATABASE` following the shape above.
3. If the card earns a bonus in a category that doesn't exist yet (e.g. a specific airline or hotel brand), add it to `CATEGORIES` first.
4. Populate `protections` for any `BENEFITS` id the card offers. Assign `tier` *relative to the other cards already in the wallet* — e.g. if one card has primary rental CDW and another has secondary, primary is `tier: 1` and secondary is `tier: 2` or `3` depending on its cap. Don't invent a tier scale from scratch each time; look at how existing cards in `CARD_DATABASE` are tiered for the same benefit and stay consistent.
5. Add the card to the default `cards` array with its real `statementDay`.
6. **Don't fabricate benefit terms.** If a specific number or trigger condition can't be verified, either omit that protection or say so plainly in `detail` — never invent a plausible-sounding cap.

## Recipe: add a new protection/perk type

1. Add an entry to `BENEFITS`.
2. Go through `CARD_DATABASE` and add the matching key to `protections` for every card that actually offers it. Cards that don't need no change — a missing key already reads as "not covered."

## Verification

Run these before calling any change done. In this repo's dev environment, `vite`'s dev server and `vite build` can be very slow if the working directory is on a network/cloud-synced filesystem (e.g. a Google Drive mount) — don't assume a stall means something is broken; a background run with a long timeout and a fast `esbuild` syntax check in the meantime is more reliable than waiting on the dev server.

1. **Fast syntax check** (no dev server needed):
   ```bash
   node -e "require('esbuild').build({entryPoints:['src/App.jsx'],bundle:false,loader:{'.jsx':'jsx'},jsx:'automatic',write:false}).then(()=>console.log('OK'))"
   ```
2. `npm run lint`
3. **Visual check:** `npm run dev`, open the app, confirm: the new card appears in Billing Priority; its rewards show correctly in the relevant category tiles (and it wins where expected); its protections/perks render in the card detail modal with the right tier badges.
4. `npm run build` — confirms the production bundle compiles before deploying.

## Deploy

```bash
npm run deploy
```

Runs `predeploy` (`vite build`) then pushes `dist/` to the `gh-pages` branch via the `gh-pages` package. Requires `vite.config.js`'s `base` and `package.json`'s `homepage` to both match the target GitHub username/repo (see README's Deploy section). This is a **visible, external action** (publishes a live site) — confirm with the user before running it, the same as any other publish/push action.

## Constraints / house style

- Keep the "one data file, no backend" architecture. Don't introduce a database, API route, or real card-linking integration — that changes the trust model of a tool meant to run entirely client-side with no financial credentials ever touching a server.
- Tailwind utility classes only — no new CSS files or CSS-in-JS.
- Don't add a dependency for something a short helper function can do (see `calculateDaysUntilDue`, `getCardMetrics` for the existing style).
- The shipped default wallet is illustrative seed data, not any real person's actual cards — don't treat it as ground truth to preserve when a user asks to personalize their fork; replace it with theirs.
