# Credit Card Optimizer

A smart, responsive web application designed to help you decide exactly which credit card to use for any purchase. The app optimizes for two distinct strategies: **Maximizing Payment Delay** (Float) and **Maximizing Rewards** (Return on Spend).

## 🚀 Features

### 1. Billing Strategy (Cash Flow Optimization)

* **Goal:** Maximize the "interest-free float" by delaying payment as long as possible.
* **Logic:** Calculates the days remaining until the due date based on your statement closing date.
* **Recommendation:** Prioritizes cards that have *just* started a new billing cycle, giving you up to ~55 days to pay.

### 2. Rewards Strategy (Return Optimization)

* **Goal:** Maximize the dollar value returned per $100 spent.
* **Logic:** Compares reward multipliers (e.g., 4x points) against point valuations (e.g., 1.5 cents/point) to determine the "Effective Return."
* **Category Support:** Dining, Groceries, Travel, Gas, Drugstores, and specialized categories like Marriott Hotels and United Flights.
* **Tie-Breaking:** If multiple cards offer the same return, the app highlights all viable options.

### 3. "Gemini" Research Simulation

* **Smart Input:** Simply type a card name (e.g., "Sapphire" or "Amex Gold"), and the app simulates an AI lookup to auto-fill the card's provider, color, and complex reward structure.
* **Valuation:** Automatically assigns estimated cash values to points (e.g., Chase UR = 1.5¢, Amex MR = 1.4¢).

### 4. Comparison Tools

* **Category Deep-Dive:** Click on any category (e.g., Dining) to see a ranked table of *all* your cards for that specific spend.
* **Card Details:** Click on any card to see a full breakdown of its benefits and notes.

## 🛠️ Tech Stack

* **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Deployment:** GitHub Pages

## 📦 How to Run Locally

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/card-optimizer.git
   cd card-optimizer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to view the app.

## 🚀 How to Deploy

This project is configured for deployment via **GitHub Pages**.

1. Make sure your `package.json` has the `homepage` field set:

   ```json
   "homepage": "https://yourusername.github.io/card-optimizer"
   ```

2. Run the deploy script:

   ```bash
   npm run deploy
   ```

3. Your app will be live at the URL specified in `homepage` within a few minutes.

## 📱 Mobile Support

This app is fully responsive and installable.

* **iOS:** Open in Safari -> Share -> "Add to Home Screen"
* **Android:** Open in Chrome -> Menu -> "Add to Home screen"

*Built with React & Tailwind CSS.*
