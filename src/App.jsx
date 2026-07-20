import React, { useState, useMemo } from 'react';
import { Plus, Wallet, Calendar, TrendingUp, DollarSign, ArrowRight, Loader2, Info, X, Plane, BedDouble, Search, ChevronRight, Sparkles, Trophy, ShieldCheck, Check, Minus, Gift } from 'lucide-react';

// --- DATABASE OF CARDS (Simulating Gemini Knowledge Graph) ---
// pointValue is in cents. e.g. 1.0 = 1 cent.
//
// Each card also carries:
//   protections: shared, comparable coverage (drives the "Protections & Perks" lookup).
//                A missing key OR { covered: false } means the card does NOT offer it.
//   perks:       free-form, card-specific benefits that don't generalize (credits, lounge passes...).
//
// Benefit terms are best-effort estimates gathered from public issuer guides — always
// verify exact caps/exclusions with your card's Guide to Benefits before relying on them.
const CARD_DATABASE = {
  "Chase Freedom Unlimited": {
    provider: "Chase",
    color: "bg-blue-600",
    pointValue: 1.5, // Assumes transfer to CSP/CSR
    rewards: { dining: 3, travel: 1.5, grocery: 1.5, gas: 1.5, streaming: 1.5, drugstores: 3, everything: 1.5, marriott: 1.5, united: 1.5 },
    notes: "1.5x Floor. 3x Dining/Drugstores. 5x travel via Chase Travel portal only.",
    protections: {
      extendedWarranty: { covered: true, tier: 2, detail: "+1 yr on warranties ≤3 yrs, up to $10k/item" },
      purchaseProtection: { covered: true, tier: 2, detail: "120 days, $500/item, $50k/yr (damage & theft)" },
      tripCancellation: { covered: true, tier: 2, detail: "Up to $1,500/person, $6,000/trip" },
      rentalCar: { covered: true, tier: 2, tierLabel: "Secondary", detail: "Secondary (US), up to $60k collision/theft" },
      travelAccident: { covered: true, tier: 2, detail: "Accidental death/dismemberment coverage" }
    },
    perks: ["5x travel booked via Chase Travel portal", "3% dining & drugstores", "DoorDash DashPass benefits", "No annual fee"]
  },
  "The Ritz Carlton™ Credit Card": {
    provider: "JPMorgan",
    color: "bg-slate-900",
    pointValue: 0.7, // Marriott points valued lower approx 0.7-0.8cpp
    rewards: { dining: 3, travel: 3, grocery: 2, gas: 2, streaming: 2, drugstores: 2, everything: 2, marriott: 6, united: 3 },
    notes: "6x Marriott. 3x Dining/Air. $300 airline credit.",
    protections: {
      extendedWarranty: { covered: true, tier: 2, detail: "+1 yr, up to $10k/item" },
      purchaseProtection: { covered: true, tier: 1, detail: "120 days, up to $10k/item, $50k/claim" },
      returnProtection: { covered: true, tier: 1, detail: "90 days, up to $500/item (Visa Infinite)" },
      tripDelay: { covered: true, tier: 1, tierLabel: "6-hr trigger", detail: "$500, delays of 6+ hours" },
      tripCancellation: { covered: true, tier: 1, detail: "Up to $10k/person, $20k/trip" },
      baggageDelay: { covered: true, tier: 1, detail: "$100/day (6+ hr delay); lost luggage up to $3k" },
      rentalCar: { covered: true, tier: 1, tierLabel: "Primary", detail: "Primary, up to $75k (US & abroad)" },
      travelAccident: { covered: true, tier: 1, detail: "Up to $1M travel accident insurance" },
      foreignFee: { covered: true, tier: 1, detail: "No foreign transaction fee" }
    },
    perks: ["$300 annual airline incidental credit", "Priority Pass Select (+2 guests)", "Marriott Bonvoy Gold status", "3 club-level upgrade certs/yr", "$100 property credit (Ritz/St. Regis)"]
  },
  "Chase Sapphire Preferred® Card": {
    provider: "Chase",
    color: "bg-blue-800",
    pointValue: 1.5, // High value due to transfer partners
    rewards: { dining: 3, travel: 2, grocery: 1, gas: 1, streaming: 3, drugstores: 1, everything: 1, marriott: 2, united: 2 },
    notes: "2x Travel (5x via Chase Travel portal). 3x Dining/Streaming. 3x online grocery only (not in-store). 10% Anniversary bonus.",
    protections: {
      extendedWarranty: { covered: true, tier: 2, detail: "+1 yr on warranties ≤3 yrs, up to $10k/item" },
      purchaseProtection: { covered: true, tier: 2, detail: "120 days, $500/item, $50k/yr" },
      tripDelay: { covered: true, tier: 2, tierLabel: "12-hr trigger", detail: "$500, delays of 12+ hours" },
      tripCancellation: { covered: true, tier: 1, detail: "Up to $10k/person, $20k/trip" },
      baggageDelay: { covered: true, tier: 1, detail: "$100/day up to 5 days (6+ hr delay)" },
      rentalCar: { covered: true, tier: 1, tierLabel: "Primary", detail: "Primary, up to $60k collision/theft" },
      travelAccident: { covered: true, tier: 2, detail: "Travel accident insurance" },
      foreignFee: { covered: true, tier: 1, detail: "No foreign transaction fee" }
    },
    perks: ["5x on travel booked via Chase Travel portal", "$100 annual Chase Travel hotel credit", "Global Entry/TSA/NEXUS credit ($120/4yr)", "10% anniversary points boost", "3x on online grocery orders (excludes in-store/wholesale)", "DoorDash DashPass benefits", "1:1 transfer partners"]
  },
  "Wells Fargo Bilt Card": {
    provider: "Wells Fargo",
    color: "bg-stone-800",
    pointValue: 1.5, // Highly valuable transfer partners
    rewards: { dining: 3, travel: 2, grocery: 1, gas: 1, streaming: 1, drugstores: 1, everything: 1, rent: 1, marriott: 2, united: 2 },
    notes: "1x Rent. Double points on Rent Day (1st).",
    protections: {
      purchaseProtection: { covered: true, tier: 2, detail: "90 days, damage & theft (Purchase Security)" },
      cellPhone: { covered: true, tier: 1, detail: "$800/claim ($25 deductible); pay phone bill w/ card" },
      tripDelay: { covered: true, tier: 1, tierLabel: "6-hr trigger", detail: "$200/day up to $1,800; delays of 6+ hours" },
      tripCancellation: { covered: true, tier: 2, detail: "Trip cancellation/interruption coverage" },
      rentalCar: { covered: true, tier: 1, tierLabel: "Primary", detail: "Primary CDW, up to $50k" },
      foreignFee: { covered: true, tier: 1, detail: "No foreign transaction fee" }
    },
    perks: ["Earn on rent with no fee (up to $100k/yr)", "Double points on Rent Day (1st of month)", "Airline & hotel transfer partners", "No annual fee"]
  },
  "United Quest Card": {
    provider: "Chase",
    color: "bg-blue-500",
    pointValue: 1.2, // United miles approx 1.2cpp
    rewards: { dining: 2, travel: 2, grocery: 1, gas: 1, streaming: 2, drugstores: 1, everything: 1, marriott: 1, united: 3 },
    notes: "3x United purchases. 2x Dining/Travel.",
    protections: {
      extendedWarranty: { covered: true, tier: 2, detail: "+1 yr, up to $10k/item" },
      purchaseProtection: { covered: true, tier: 2, detail: "120 days, $500/item" },
      tripDelay: { covered: true, tier: 2, tierLabel: "12-hr trigger", detail: "$500, delays of 12+ hours or overnight" },
      tripCancellation: { covered: true, tier: 2, detail: "Up to $1,500/person, $6,000/trip" },
      baggageDelay: { covered: true, tier: 2, detail: "$100/day up to 3 days (6+ hr delay)" },
      rentalCar: { covered: true, tier: 1, tierLabel: "Primary", detail: "Primary auto rental CDW" },
      travelAccident: { covered: true, tier: 2, detail: "Travel accident insurance" },
      foreignFee: { covered: true, tier: 1, detail: "No foreign transaction fee" }
    },
    perks: ["$200 United TravelBank cash/yr", "2 United Club one-time passes/yr", "Free 1st & 2nd checked bags (+companion)", "Group 2 priority boarding", "5,000-mile anniversary rebate"]
  },
  "Amex Gold": {
    provider: "American Express",
    color: "bg-yellow-500",
    pointValue: 1.4, // MR Points
    rewards: { dining: 4, travel: 3, grocery: 4, gas: 1, streaming: 1, drugstores: 1, everything: 1, marriott: 1, united: 3 },
    notes: "4x Dining & Groceries (US). $120 dining credit.",
    protections: {
      extendedWarranty: { covered: true, tier: 1, tierLabel: "≤5-yr warranties", detail: "+1 yr on warranties ≤5 yrs, up to $10k/item" },
      purchaseProtection: { covered: true, tier: 1, detail: "90 days, $10k/item, $50k/yr (damage & theft)" },
      returnProtection: { covered: true, tier: 2, detail: "90 days, up to $300/item" },
      tripDelay: { covered: true, tier: 3, tierLabel: "12-hr, $300", detail: "$300, delays of 12+ hours (2x/yr)" },
      baggageDelay: { covered: true, tier: 2, detail: "$1,250 carry-on / $500 checked baggage" },
      rentalCar: { covered: true, tier: 2, tierLabel: "Secondary", detail: "Secondary car rental loss & damage" },
      foreignFee: { covered: true, tier: 1, detail: "No foreign transaction fee" }
    },
    perks: ["$120 dining credit ($10/mo)", "$120 Uber Cash ($10/mo)", "$100 Resy credit", "$84 Dunkin' credit", "4x dining & U.S. groceries"]
  },
  "Capital One SavorOne": {
    provider: "Capital One",
    color: "bg-orange-600",
    pointValue: 1.0, // Cash back unless moved to Venture
    rewards: { dining: 3, travel: 1, grocery: 3, gas: 1, streaming: 3, drugstores: 1, everything: 1, marriott: 1, united: 1 },
    notes: "3% Dining, Entertainment, Streaming, Grocery.",
    protections: {
      extendedWarranty: { covered: true, tier: 3, tierLabel: "≤2-yr warranties", detail: "Doubles warranty on ≤2 yrs, up to $10k/item" },
      purchaseProtection: { covered: true, tier: 2, detail: "90 days, $1,000/claim, $25k/yr (Purchase Security)" },
      travelAccident: { covered: true, tier: 1, detail: "Up to $1M travel accident insurance" },
      foreignFee: { covered: true, tier: 1, detail: "No foreign transaction fee" }
    },
    perks: ["No annual fee", "8% back on Capital One Entertainment", "5% hotels & cars via Capital One Travel", "Price protection up to $250/item"]
  },
  "Citi Double Cash": {
    provider: "Citi",
    color: "bg-teal-600",
    pointValue: 1.0,
    rewards: { dining: 2, travel: 2, grocery: 2, gas: 2, streaming: 2, drugstores: 2, everything: 2, marriott: 2, united: 2 },
    notes: "2% flat rate on everything.",
    protections: {
      // Citi has stripped most purchase/travel protections from this card.
    },
    perks: ["2% flat (1% at purchase + 1% at payment)", "Citi Entertainment access", "Mastercard ID Theft Protection", "$0 fraud liability", "No annual fee", "Note: 3% foreign transaction fee"]
  },
  "Alaska Atmos Rewards Summit Visa Infinite": {
    provider: "Bank of America",
    color: "bg-cyan-800",
    pointValue: 1.4, // Alaska/Atmos points ~1.4cpp
    rewards: { dining: 3, travel: 1, grocery: 1, gas: 1, streaming: 1, drugstores: 1, everything: 1, marriott: 1, united: 1, alaska: 3, foreign: 3 },
    notes: "3x Alaska, Dining & ALL Foreign spend. $395 fee. Free checked bag + lounge passes.",
    protections: {
      extendedWarranty: { covered: true, tier: 2, detail: "Visa Infinite extended warranty" },
      purchaseProtection: { covered: true, tier: 2, detail: "Purchase security (damage & theft)" },
      returnProtection: { covered: true, tier: 2, detail: "Up to $250/item (Visa Infinite)" },
      tripDelay: { covered: true, tier: 1, tierLabel: "6-hr trigger", detail: "Trip delay reimbursement (6+ hr delay)" },
      tripCancellation: { covered: true, tier: 2, detail: "Trip cancellation & interruption" },
      baggageDelay: { covered: true, tier: 2, detail: "Lost & delayed baggage coverage" },
      rentalCar: { covered: true, tier: 2, tierLabel: "Secondary", detail: "Auto rental CDW (secondary)" },
      travelAccident: { covered: true, tier: 2, detail: "Travel accident insurance" },
      foreignFee: { covered: true, tier: 1, detail: "No foreign transaction fee (plus 3x points abroad)" }
    },
    perks: ["Free checked bag (you + up to 6 companions)", "8 Alaska Lounge passes/yr", "8 Wi-Fi passes/yr", "50% off Lounge day passes", "20% back on inflight purchases", "25,000-pt Global Companion Award", "10,000 status points each anniversary", "Point sharing with up to 10 members"]
  }
};

const CATEGORIES = [
  { id: 'dining', label: 'Dining', icon: '🍔' },
  { id: 'grocery', label: 'Groceries', icon: '🛒' },
  { id: 'marriott', label: 'Marriott Hotels', icon: <BedDouble size={20} /> },
  { id: 'united', label: 'United Flights', icon: <Plane size={20} /> },
  { id: 'alaska', label: 'Alaska Flights', icon: '🏔️' },
  { id: 'travel', label: 'General Travel', icon: '✈️' },
  { id: 'foreign', label: 'Foreign Spend', icon: '🌐' },
  { id: 'gas', label: 'Gas', icon: '⛽' },
  { id: 'drugstores', label: 'Drugstores', icon: '💊' },
  { id: 'everything', label: 'Everything Else', icon: '🧾' }
];

// --- BENEFIT REGISTRY (shared vocabulary for the Protections & Perks lookup) ---
const BENEFITS = [
  { id: 'extendedWarranty', label: 'Extended Warranty', icon: '🛡️', group: 'Purchase', hint: 'Electronics & appliances' },
  { id: 'purchaseProtection', label: 'Purchase Protection', icon: '📦', group: 'Purchase', hint: 'Damage & theft on new buys' },
  { id: 'returnProtection', label: 'Return Protection', icon: '↩️', group: 'Purchase', hint: 'Store won\'t take it back' },
  { id: 'cellPhone', label: 'Cell Phone Protection', icon: '📱', group: 'Purchase', hint: 'Pay your phone bill with it' },
  { id: 'tripDelay', label: 'Trip Delay', icon: '⏱️', group: 'Travel', hint: 'Delayed flights & hotels' },
  { id: 'tripCancellation', label: 'Trip Cancellation', icon: '🚫', group: 'Travel', hint: 'Non-refundable trips' },
  { id: 'baggageDelay', label: 'Baggage Protection', icon: '🧳', group: 'Travel', hint: 'Lost or delayed luggage' },
  { id: 'rentalCar', label: 'Rental Car (CDW)', icon: '🚗', group: 'Travel', hint: 'Decline the counter insurance' },
  { id: 'travelAccident', label: 'Travel Accident', icon: '🛟', group: 'Travel', hint: 'Common-carrier accidents' },
  { id: 'foreignFee', label: 'No Foreign Fee', icon: '🌐', group: 'Travel', hint: 'Spending abroad' }
];

// Coverage tier: 1 = strongest, 3 = weakest. Drives ranking + the badge shown next
// to each card. A protection may override the label (e.g. "Primary" / "Secondary").
const TIER_META = {
  1: { label: 'Top tier', badge: 'bg-emerald-100 text-emerald-700', row: 'bg-emerald-50 hover:bg-emerald-100', check: 'text-emerald-600' },
  2: { label: 'Standard', badge: 'bg-amber-100 text-amber-700', row: 'bg-amber-50 hover:bg-amber-100', check: 'text-amber-600' },
  3: { label: 'Basic', badge: 'bg-slate-200 text-slate-600', row: 'bg-slate-100 hover:bg-slate-200', check: 'text-slate-500' }
};
const getTier = (cov) => cov?.tier ?? 2;

// --- HELPER FUNCTIONS ---

// Calculate how many days until payment is due based on STATEMENT CLOSING DATE
const calculateDaysUntilDue = (statementDay) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  let currentStatementClose = new Date(currentYear, currentMonth, statementDay);

  let targetCloseDate;
  if (today.getDate() > statementDay) {
     targetCloseDate = new Date(currentYear, currentMonth + 1, statementDay);
  } else {
     targetCloseDate = new Date(currentYear, currentMonth, statementDay);
  }

  let cycleStartDate = new Date(targetCloseDate);
  cycleStartDate.setMonth(cycleStartDate.getMonth() - 1);
  cycleStartDate.setDate(cycleStartDate.getDate() + 1);

  const dueDate = new Date(targetCloseDate);
  dueDate.setDate(dueDate.getDate() + 25);

  const diffTime = Math.abs(dueDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    diffDays,
    cycleStartDate,
    targetCloseDate,
    dueDate
  };
};

// Calculate effective return for a single card/category pair
const getCardMetrics = (card, catId) => {
  const multiplier = card.rewards[catId] || 1;
  const pointVal = card.pointValue || 1.0;
  const effectiveReturn = (multiplier * pointVal);
  return {
    multiplier,
    pointVal,
    effectiveReturn, // Number for sorting
    effectiveReturnFormatted: effectiveReturn.toFixed(2), // String for display
    cashValueFormatted: effectiveReturn.toFixed(2) // $/100 spent
  };
};

// Decorative mini "card face". The issuer name is always shown right next to it,
// so the icon just needs to read as a credit card (chip + plastic sheen), not text.
const CardIcon = ({ color, size = "w-10 h-6" }) => (
  <div className={`${size} ${color} rounded-md shadow-sm relative overflow-hidden`}>
    {/* top-light / bottom-shade sheen */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/25"></div>
    {/* EMV chip */}
    <div className="absolute left-[16%] top-1/2 -translate-y-1/2 h-[34%] aspect-[4/3] rounded-[2px] bg-gradient-to-b from-amber-200 to-amber-400 ring-[0.5px] ring-amber-700/30 flex flex-col justify-evenly px-[1px]">
      <div className="h-px bg-amber-800/30"></div>
      <div className="h-px bg-amber-800/30"></div>
    </div>
    {/* corner shine */}
    <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-full -mr-4 -mt-4"></div>
  </div>
);

export default function App() {
  const [cards, setCards] = useState([
    { id: 1, name: "Chase Freedom Unlimited", statementDay: 13, ...CARD_DATABASE["Chase Freedom Unlimited"] },
    { id: 2, name: "The Ritz Carlton™ Credit Card", statementDay: 4, ...CARD_DATABASE["The Ritz Carlton™ Credit Card"] },
    { id: 3, name: "Chase Sapphire Preferred® Card", statementDay: 27, ...CARD_DATABASE["Chase Sapphire Preferred® Card"] },
    { id: 5, name: "United Quest Card", statementDay: 21, ...CARD_DATABASE["United Quest Card"] },
    { id: 6, name: "Alaska Atmos Rewards Summit Visa Infinite", statementDay: 27, ...CARD_DATABASE["Alaska Atmos Rewards Summit Visa Infinite"] }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null); // For viewing details of a single card
  const [selectedCategory, setSelectedCategory] = useState(null); // For comparing cards in a category
  const [selectedBenefit, setSelectedBenefit] = useState(null); // For comparing cards on a protection/perk
  const [isResearching, setIsResearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCardStatement, setNewCardStatement] = useState("1");

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // --- STRATEGY 1: BILLING (Payment Delay) ---
  const billingStrategyCards = useMemo(() => {
    return cards.map(card => {
      const { diffDays, cycleStartDate, dueDate } = calculateDaysUntilDue(card.statementDay);
      return {
        ...card,
        diffDays,
        cycleStarted: cycleStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        due: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    }).sort((a, b) => b.diffDays - a.diffDays);
  }, [cards]);

  // --- STRATEGY 2: REWARDS (Effective Return - Handling Ties) ---
  const getBestCardsForCategory = (catId) => {
    if (cards.length === 0) return { cards: [], effectiveReturn: "0.00" };

    let maxEffectiveReturn = -1;

    // First pass: find max return
    cards.forEach(card => {
      const { effectiveReturn } = getCardMetrics(card, catId);
      if (effectiveReturn > maxEffectiveReturn) {
        maxEffectiveReturn = effectiveReturn;
      }
    });

    // Second pass: get all cards matching max return (with small tolerance for float logic)
    const winners = cards.filter(card => {
        const { effectiveReturn } = getCardMetrics(card, catId);
        return Math.abs(effectiveReturn - maxEffectiveReturn) < 0.001;
    });

    // Get metrics from the first winner (all are same)
    const metrics = getCardMetrics(winners[0], catId);

    return {
      cards: winners,
      multiplier: metrics.multiplier,
      effectiveReturn: metrics.effectiveReturnFormatted
    };
  };

  // --- COMPARISON DATA ---
  const getComparisonData = (catId) => {
    return cards.map(card => {
      const metrics = getCardMetrics(card, catId);
      return { ...card, ...metrics };
    }).sort((a, b) => b.effectiveReturn - a.effectiveReturn);
  };

  // --- STRATEGY 3: PROTECTIONS & PERKS ---
  // Split the wallet into cards that DO / DON'T offer a given benefit.
  const getCardsForBenefit = (benefitId) => {
    const covered = cards
      .filter(c => c.protections?.[benefitId]?.covered)
      .sort((a, b) => getTier(a.protections[benefitId]) - getTier(b.protections[benefitId]));
    const notCovered = cards.filter(c => !c.protections?.[benefitId]?.covered);
    return { covered, notCovered };
  };

  // --- AI SUMMARY GENERATION ---
  const walletSummary = useMemo(() => {
    if (cards.length === 0) return "Add cards to your wallet to generate a personalized strategy.";

    const categoryWinners = {};

    // Group categories by their best card(s)
    CATEGORIES.forEach(cat => {
      const best = getBestCardsForCategory(cat.id).cards;
      // Create a key based on the sorted names of the winning cards
      const namesKey = best.map(c => c.name).sort().join(' or ');

      if (!categoryWinners[namesKey]) {
        categoryWinners[namesKey] = [];
      }
      categoryWinners[namesKey].push(cat.label);
    });

    // Generate sentences
    const sentences = Object.entries(categoryWinners).map(([cardNames, cats]) => {
      const catList = cats.length > 2
        ? `${cats.slice(0, -1).join(', ')}, and ${cats[cats.length - 1]}`
        : cats.join(' and ');

      // If the key contains " or ", it implies a tie
      const formattedNames = cardNames.includes(' or ')
        ? cardNames.split(' or ').map(n => `**${n}**`).join(' or ')
        : `**${cardNames}**`;

      return `Use ${formattedNames} for ${catList}.`;
    });

    return sentences.join(" ");
  }, [cards]);

  const parseSummaryText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="font-bold text-slate-800">{part.slice(2, -2)}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleAddCard = async () => {
    if (!searchQuery) return;
    setIsResearching(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const foundKey = Object.keys(CARD_DATABASE).find(key =>
      key.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const dbCard = foundKey ? CARD_DATABASE[foundKey] : null;

    const newCard = {
      id: Date.now(),
      name: foundKey || searchQuery,
      statementDay: parseInt(newCardStatement),
      provider: dbCard?.provider || "Custom",
      color: dbCard?.color || "bg-slate-500",
      pointValue: dbCard?.pointValue || 1.0,
      rewards: dbCard?.rewards || { dining: 1, grocery: 1, travel: 1, gas: 1, streaming: 1, drugstores: 1, everything: 1, marriott: 1, united: 1 },
      notes: dbCard?.notes || "Custom added card",
      protections: dbCard?.protections || {},
      perks: dbCard?.perks || []
    };

    setCards([...cards, newCard]);
    setIsResearching(false);
    setShowAddModal(false);
    setSearchQuery("");
    setNewCardStatement("1");
  };

  const removeCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
    if (selectedCard?.id === id) setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Card Optimizer</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{formattedDate}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Card</span>
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">

        {/* AI STRATEGY SUMMARY BLOCK */}
        <section className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl shadow-sm relative overflow-hidden isolate">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
          <div className="flex gap-4 items-start relative z-10">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shrink-0 mt-1">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Wallet Strategy</h2>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                {parseSummaryText(walletSummary)}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* STRATEGY 1: BILLING */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-green-100 p-2 rounded-full text-green-700">
                <Calendar size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Billing Priority</h2>
                <p className="text-sm text-slate-500">Max delay (Interest-Free Float)</p>
              </div>
            </div>

            <div className="space-y-3">
              {billingStrategyCards.map((card, index) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`relative group bg-white p-4 rounded-xl border-2 transition-all duration-300 shadow-sm cursor-pointer
                    ${index === 0 ? 'border-green-500 shadow-md transform scale-[1.02]' : 'border-transparent hover:border-slate-200'}
                  `}
                >
                  {index === 0 && (
                    <div className="absolute -top-3 left-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                      <TrendingUp size={12} /> Recommended for Big Purchases
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <CardIcon color={card.color} />
                      <div>
                        <h3 className="font-semibold text-slate-900 flex items-center gap-1">
                          {card.name}
                          <Info size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"/>
                        </h3>
                        <p className="text-xs text-slate-400">Statement closes on {card.statementDay}{['st','nd','rd','th'][Math.min(card.statementDay-1,3)] || 'th'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900 leading-none">
                        {card.diffDays}<span className="text-xs font-normal text-slate-400 ml-1">days</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-1">Float</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${index === 0 ? 'bg-green-500' : 'bg-slate-300'}`}
                      style={{ width: `${(card.diffDays / 60) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
                    <span>Due: {card.due}</span>
                    {index === 0 && <span className="text-green-600 font-bold">Use this card today</span>}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); removeCard(card.id); }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-opacity z-10"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>


          {/* RIGHT COLUMN: REWARDS + PROTECTIONS */}
          <div className="space-y-6">
            {/* STRATEGY 2: REWARDS */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-purple-100 p-2 rounded-full text-purple-700">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Rewards Priority</h2>
                  <p className="text-sm text-slate-500">Effective Return ($ per $100)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => {
                  const { cards: bestCards, effectiveReturn } = getBestCardsForCategory(cat.id);
                  // Use the first card for display color/provider if single, or handle ties
                  const mainCard = bestCards[0];

                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)} // Opens Comparison Modal
                      className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow cursor-pointer relative"
                    >
                       <div className="absolute top-2 right-2 text-slate-300">
                          <ChevronRight size={16} />
                       </div>

                      <div className="flex justify-between items-start mb-3 pr-4">
                        <span className="text-xl sm:text-2xl text-slate-600" role="img" aria-label={cat.label}>
                          {cat.icon}
                        </span>
                      </div>

                      <div className="mt-auto">
                        <div className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-bold inline-block mb-2">
                            {effectiveReturn}% Return
                        </div>

                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{cat.label}</h4>

                        {bestCards.length === 1 ? (
                          <>
                            <div className="font-bold text-sm sm:text-base text-slate-900 leading-tight line-clamp-2" title={mainCard.name}>{mainCard.name}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <div className={`w-2 h-2 rounded-full ${mainCard.color} shrink-0`}></div>
                              <span className="text-[10px] text-slate-400 truncate">{mainCard.provider}</span>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-1 mt-1">
                            {bestCards.map((c) => (
                              <div key={c.id} className="flex items-center gap-1.5 overflow-hidden">
                                 <div className={`w-1.5 h-1.5 rounded-full ${c.color} shrink-0`}></div>
                                 <div className="text-xs font-semibold text-slate-900 truncate">{c.name}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* STRATEGY 3: PROTECTIONS & PERKS */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-amber-100 p-2 rounded-full text-amber-700">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Protections & Perks</h2>
                  <p className="text-sm text-slate-500">Which card covers this purchase?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {BENEFITS.map(benefit => {
                  const { covered } = getCardsForBenefit(benefit.id);
                  const count = covered.length;
                  const hasCoverage = count > 0;

                  return (
                    <div
                      key={benefit.id}
                      onClick={() => setSelectedBenefit(benefit)}
                      className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow cursor-pointer relative"
                    >
                      <div className="absolute top-2 right-2 text-slate-300">
                        <ChevronRight size={16} />
                      </div>

                      <div className="flex justify-between items-start mb-3 pr-4">
                        <span className="text-xl sm:text-2xl" role="img" aria-label={benefit.label}>
                          {benefit.icon}
                        </span>
                      </div>

                      <div className="mt-auto">
                        <div className={`px-2 py-0.5 rounded text-xs font-bold inline-block mb-2 ${hasCoverage ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                          {hasCoverage ? `${count} ${count === 1 ? 'card' : 'cards'}` : 'None'}
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight mb-0.5">{benefit.label}</h4>
                        <p className="text-[10px] text-slate-400 leading-tight">{benefit.hint}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

      </main>

      {/* --- MODALS --- */}

      {/* 1. Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Add a Card</h2>
              <p className="text-sm text-slate-500 mb-6">Enter card name, Gemini will research the details.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Card Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Amex Platinum, Capital One Savor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statement Closing Date</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="w-20 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                      value={newCardStatement}
                      onChange={(e) => setNewCardStatement(e.target.value)}
                    />
                    <span className="text-sm text-slate-400">Day of month</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddCard}
                disabled={isResearching || !searchQuery}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {isResearching ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Gemini Researching...</span>
                  </>
                ) : (
                  <>
                    <span>Add to Wallet</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Category Comparison Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-2xl">{selectedCategory.icon}</span>
                Compare: {selectedCategory.label}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Comparing returns for your wallet.</p>

              <button
                onClick={() => setSelectedCategory(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-0">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold tracking-wide sticky top-0">
                   <tr>
                     <th className="px-4 py-3">Card</th>
                     <th className="px-4 py-3 text-right">Points</th>
                     <th className="px-4 py-3 text-right">Value</th>
                     <th className="px-4 py-3 text-right text-indigo-600">Return</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {getComparisonData(selectedCategory.id).map((card, idx, arr) => {
                       // Check if this row is a "winner" (ties with top score)
                       const isWinner = Math.abs(parseFloat(card.effectiveReturn) - parseFloat(arr[0].effectiveReturn)) < 0.001;

                       return (
                      <tr
                        key={card.id}
                        onClick={() => {
                          setSelectedCategory(null); // Close comparison
                          setSelectedCard(card); // Open detail
                        }}
                        className={`cursor-pointer transition-colors group ${isWinner ? 'bg-purple-50 hover:bg-purple-100' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-4 py-4">
                           <div className="flex items-center gap-3">
                              {isWinner && <Trophy size={16} className="text-yellow-500 shrink-0" />}
                              {!isWinner && <div className="w-4"></div>}
                              <div className={`w-2 h-8 rounded-full ${card.color} shrink-0`}></div>
                              <div>
                                <div className="font-semibold text-slate-900 text-sm">{card.name}</div>
                                <div className="text-[10px] text-slate-400">{card.provider}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-slate-600">
                          {card.multiplier}x
                        </td>
                         <td className="px-4 py-4 text-right text-sm text-slate-600">
                          {card.pointValue}¢
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="font-bold text-slate-900 text-sm">${card.cashValueFormatted}</div>
                          <div className="text-[10px] text-green-600 font-medium">{card.effectiveReturnFormatted}%</div>
                        </td>
                      </tr>
                    )})}
                 </tbody>
               </table>
            </div>

             <div className="p-4 bg-slate-50 text-center text-xs text-slate-400 border-t border-slate-100">
                Click any row to view full card details.
            </div>
          </div>
        </div>
      )}

      {/* 3. Benefit (Protection/Perk) Comparison Modal */}
      {selectedBenefit && (() => {
        const { covered, notCovered } = getCardsForBenefit(selectedBenefit.id);
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-2xl">{selectedBenefit.icon}</span>
                  {selectedBenefit.label}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {covered.length > 0
                    ? `${covered.length} of your ${cards.length} cards cover this — ranked best coverage first.`
                    : 'None of your cards offer this benefit.'}
                </p>

                <button
                  onClick={() => setSelectedBenefit(null)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-4 space-y-2">
                {covered.length > 0 && (
                  <>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">Covered by · best first</h3>
                    {covered.map((card, i) => {
                      const cov = card.protections[selectedBenefit.id];
                      const tier = getTier(cov);
                      const meta = TIER_META[tier] || TIER_META[2];
                      const isTopPick = i === 0 && tier === 1;
                      return (
                      <div
                        key={card.id}
                        onClick={() => { setSelectedBenefit(null); setSelectedCard(card); }}
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${meta.row}`}
                      >
                        <div className={`w-2 self-stretch min-h-[2.5rem] rounded-full ${card.color} shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Check size={14} className={`${meta.check} shrink-0`} />
                            <span className="font-semibold text-slate-900 text-sm">{card.name}</span>
                            {isTopPick && <Trophy size={13} className="text-yellow-500 shrink-0" />}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${meta.badge}`}>{cov.tierLabel || meta.label}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 ml-5">{cov.detail || 'Included'}</p>
                        </div>
                      </div>
                    )})}
                  </>
                )}

                {notCovered.length > 0 && (
                  <>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1 pt-2">Not covered</h3>
                    {notCovered.map(card => (
                      <div
                        key={card.id}
                        onClick={() => { setSelectedBenefit(null); setSelectedCard(card); }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors opacity-70"
                      >
                        <Minus size={14} className="text-slate-300 shrink-0" />
                        <div className={`w-2 h-6 rounded-full ${card.color} shrink-0 opacity-50`}></div>
                        <span className="font-medium text-slate-500 text-sm">{card.name}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="p-4 bg-slate-50 text-center text-xs text-slate-400 border-t border-slate-100">
                Terms are estimates — verify with your card's Guide to Benefits.
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4. Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]">

            <div className={`p-6 ${selectedCard.color} text-white relative`}>
              <h2 className="text-2xl font-bold mb-1">{selectedCard.name}</h2>
              <p className="text-white/80 font-medium">{selectedCard.provider}</p>
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Valuation Strategy</h3>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Point Value</span>
                  <span className="font-bold text-indigo-600">{selectedCard.pointValue} cents / pt</span>
                </div>
                {selectedCard.notes && (
                  <p className="text-xs text-slate-500 mt-2 italic">
                    <Info size={12} className="inline mr-1" />
                    {selectedCard.notes}
                  </p>
                )}
              </div>

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Rewards Breakdown</h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => {
                  const multiplier = selectedCard.rewards[cat.id] || 1;
                  const effectiveReturn = (multiplier * selectedCard.pointValue).toFixed(2);
                  const cashValue = (multiplier * selectedCard.pointValue).toFixed(2);

                  return (
                    <div key={cat.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-lg w-6 text-center text-slate-500">{cat.icon}</span>
                        <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">${cashValue} <span className="text-xs font-normal text-slate-500">/ $100</span></div>
                        <div className="text-[10px] text-slate-400">{effectiveReturn}% Return</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Protections */}
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-6 mb-3 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-amber-500" /> Protections
              </h3>
              <div className="space-y-2">
                {BENEFITS.map(benefit => {
                  const cov = selectedCard.protections?.[benefit.id];
                  const isCovered = !!cov?.covered;
                  return (
                    <div key={benefit.id} className={`flex items-start justify-between py-2 border-b border-slate-100 last:border-0 ${isCovered ? '' : 'opacity-45'}`}>
                      <div className="flex items-start gap-3 pr-2">
                        <span className="text-base w-5 text-center">{benefit.icon}</span>
                        <div>
                          <span className="text-sm font-medium text-slate-700">{benefit.label}</span>
                          {isCovered && (() => {
                            const meta = TIER_META[getTier(cov)] || TIER_META[2];
                            return <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded align-middle ${meta.badge}`}>{cov.tierLabel || meta.label}</span>;
                          })()}
                          {isCovered && cov.detail && (
                            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{cov.detail}</p>
                          )}
                        </div>
                      </div>
                      {isCovered ? (
                        <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <Minus size={16} className="text-slate-300 shrink-0 mt-0.5" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Perks */}
              {selectedCard.perks && selectedCard.perks.length > 0 && (
                <>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-6 mb-3 flex items-center gap-1.5">
                    <Gift size={13} className="text-indigo-500" /> Perks & Credits
                  </h3>
                  <div className="space-y-1.5">
                    {selectedCard.perks.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Sparkles size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 leading-snug">{perk}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <button
                onClick={() => removeCard(selectedCard.id)}
                className="text-red-500 text-sm font-medium hover:text-red-700 transition-colors"
              >
                Remove from Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
