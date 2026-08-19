---
name: personalize-wallet
description: Add, remove, or correct a card in this Card Optimizer app's wallet, and optionally deploy the result to GitHub Pages. Use when the user wants to personalize this repo for their own cards, update reward/protection data after a card's terms changed, or ship their edits live.
---

# Personalize this wallet

This project is a single-file card decision tool (`src/App.jsx`). The full data contract — exact object shapes for `CARD_DATABASE`, `CATEGORIES`, `BENEFITS`, and the default wallet — plus step-by-step recipes and verification commands live in **[AGENTS.md](../../../AGENTS.md)** at the repo root. Read it before editing anything; this skill is a workflow wrapper around it, not a replacement for it.

## Workflow

1. **Gather requirements.** Ask which card(s) to add, remove, or correct, and — for anything being added — the real statement closing day (1–31). If the user says "update my Chase Sapphire," find the entry, don't add a duplicate.
2. **Research.** For each card, look up its current rewards structure, point valuation, and protection terms. Prefer the issuer's own Guide to Benefits/cardmember agreement; cross-check tier-relevant language ("primary vs. secondary CDW," delay-trigger hours, warranty length caps) against a couple of points/miles sites (NerdWallet, The Points Guy, Doctor of Credit). Never fabricate a specific number or trigger condition — omit it or flag it as unverified instead.
3. **Edit `src/App.jsx`** following AGENTS.md's "Recipe: add a new card" (or "add a new protection/perk type" if the card needs a `CATEGORIES`/`BENEFITS` entry that doesn't exist yet). Assign protection `tier` values *relative to the other cards already in the wallet*, consistent with how existing entries are tiered for the same benefit.
4. **Verify** using AGENTS.md's Verification section, in order: the esbuild syntax check, `npm run lint`, a visual check via `npm run dev` (confirm the card appears, wins the categories it should, and its protections/perks render correctly), then `npm run build`.
5. **Deploy only if asked.** `npm run deploy` publishes a live site — this is a visible, external action, so confirm with the user first, same as any other publish. Before running it, make sure `vite.config.js`'s `base` and `package.json`'s `homepage` match the user's actual GitHub username/repo (not the upstream template's).
6. **Report what you changed** — which cards/categories/protections were added or corrected, and anything you couldn't verify and left as an estimate or omitted.
