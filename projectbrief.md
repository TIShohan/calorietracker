# Project Brief — Calorie Tracking App

## Overview

A **Next.js-based Calorie Tracker** web app that uses **Groq AI (Llama 3)** to parse natural language food descriptions and return structured nutritional data (calories, protein, carbs, fat). It features a clean, responsive "Shadcn" Light Mode aesthetic.

## Tech Stack

- **Framework:** Next.js 16 (App Router) & React 19
- **AI:** Groq SDK (`llama-3.3-70b-versatile` model)
- **Data Visualization:** Recharts
- **Storage:** Browser `localStorage` (via custom helper functions in `src/lib/storage.js`)
- **Styling:** CSS Modules (`.module.css`) & global CSS (`globals.css`) tuned to a unified Light Theme
- **Config:** `.env.local` file for `GROQ_API_KEY`

## File Structure

```
├── public/                 
│   ├── manifest.json               # PWA configuration
│   └── icon.svg                    # PWA launcher icon
├── src/
│   ├── app/
│   │   ├── api/parse-food/route.js # Groq AI API endpoint
│   │   ├── settings/               # Settings routes folder
│   │   │   ├── page.js             # Personal details & TDEE calculation
│   │   │   └── page.module.css     # Settings styles
│   │   ├── globals.css             # Global UI variables (Light Mode Setup)
│   │   ├── layout.js               # Root layout
│   │   ├── page.js                 # Main dashboard application
│   │   └── page.module.css         # Main application styles
│   └── lib/
│       ├── storage.js              # localStorage utility functions
│       └── utils.js                # Helper functions
├── package.json                    # Project dependencies and modified dev script
├── next.config.mjs                 # Includes local network DevOrigin permissions
├── .env.local                      # API key (GROQ_API_KEY) - Git ignored
└── projectbrief.md                 # This file
```

## Key Features

1. **Natural Language Input** — User types what they ate in plain text (e.g. "2 boiled eggs and a toast").
2. **AI-Powered Parsing** — Groq AI (Llama 3.3) accurately extracts portions, returning JSON structure of macronutrients.
3. **Advanced Settings & TDEE Calculator** — Calculates Maintenance, Bulk, or Deficit goals organically via Height, Weight, Age, Gender, and Activity forms. Supports custom override logging.
4. **Onboarding Flow** — First-time users are cleanly intercepted and directed to set up their biometric profile before accessing the Dashboard.
5. **Interactive Dashboard Logs** — Granular daily lists showing foods logged. Supports grouping foods by meal phase (e.g. Breakfast, Lunch), inline editing, and deletion via pure CSS toast notifications.
6. **Quick-Add Favorites** — Users can tap a star (☆) on any log to permanently save a frequent meal. It populates a "Quick Add" row, bypassing the AI parser for instant 1-tap logging.
7. **Date Navigation** — Easily scroll linearly back and forth to view caloric intakes for previous days.
8. **Water Tracker & Visuals** — Click-to-add water tracker (against a custom settings-driven daily target) and dynamically responsive Recharts components indicating past 7 day caloric intakes + a Macro breakdown Pie Chart.
9. **Mobile First Responsive & PWA Native App** — Grid completely condenses conditionally for mobile. Full `manifest.json` and standalone capability enables users to "Add to Home Screen" as a native PWA on iOS/Android.
10. **Local Storage Persistence** — Data is automatically tied to the device's storage seamlessly without a dedicated traditional database overhead.
11. **Network Mobile Testing** — Out of the box network visibility bounds to `0.0.0.0` securely for seamless `localhost` and `<LAN_IP>` debugging.

## How It Runs

```bash
# Install dependencies 
npm install

# Run the development server (Defaults to hosting on your LAN IP natively)
npm run dev
```

## Current State

- App is **fully complete and robust** for personal local/network usage.
- Clean Next.js architecture using modern App Router (`src/app`) packed in a React Suspense Boundary.
- Backend proxy API (`/api/parse-food`) handles interaction safely.
- No database overhead — purely browser `localStorage`.

## Dependencies

- `next="^16.2.2"`
- `react="^19.2.4"`
- `groq-sdk="^1.1.2"`
- `recharts="^3.8.1"`
