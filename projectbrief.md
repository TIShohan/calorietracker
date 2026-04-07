# Project Brief — NutriMind AI Coach

## Overview

**NutriMind** is a premium, mobile-first **AI Health & Fitness Coach** built with Next.js 16. It goes beyond simple calorie tracking by providing a unified, conversational interface for logging both food and exercise. Powered by **Groq AI (Llama 3.3)**, it understands natural language, provides personalized coaching with multi-turn memory, and offers a professional "Native App" experience as a PWA.

## Tech Stack

- **Framework:** Next.js 16 (App Router) & React 19
- **AI:** Groq SDK (`llama-3.3-70b-versatile` model) with multi-turn conversation support
- **Data Visualization:** Recharts (Daily trends & Macro breakdown)
- **Navigation:** Custom Mobile-first Bottom Tab Bar (Glassmorphism design)
- **Storage:** Browser `localStorage` (via `src/lib/storage.js`)
- **Styling:** CSS Modules with sophisticated Mobile-to-Desktop responsive overrides

## Key Evolution: Phase 2 Features

1.  **AI Coach Persona** — Transformed from a "parser" into a **Unified Health Coach**. Expert in Bangladeshi nutrition (BDT prices, local meals) and at-home fitness routines.
2.  **Unified Input Hub** — A single natural language box handles "I ate a burger" and "I walked for 30 mins" simultaneously, automatically calculating net calories (Consumed - Burned).
3.  **Advanced PWA Experience** — Features a fixed **Bottom Navigation Bar** (DASHBOARD | COACH | PROFILE), iOS-specific "Add to Home Screen" smart tips, and zero-latency page transitions.
4.  **Professional Dashboard Grid** — A symmetrical 2-row layout:
    *   **Row 1**: High-impact "Consumed" and "Burned" boxes.
    *   **Row 2**: Detailed "Protein", "Carbs", and "Fat" breakdown.
5.  **Messenger-Style Coaching** — A dedicated Chat interface with a professional, icon-based "Send" system, full conversation history (memory), and personalized goal context.
6.  **Grams-Level Precision** — AI is instructed to provide all food quantities in grams (g) for maximum tracking accuracy.
7.  **Native Look & Feel** — Disabled "web-like" behaviors (text selection, tap highlights) to ensure a high-end, native app sensation on touch devices.
8.  **Professional Input System** — Upgraded from single-line fields to auto-expanding textareas with `useLayoutEffect` for seamless multi-line support without horizontal scrolling.
9.  **Action-Oriented Dashboard** — Redesigned input area with a prominent "Track" button positioned below the input for a cleaner, vertical mobile-first hierarchy.

## File Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── parse-food/route.js   # Unified Food/Exercise parser
│   │   │   └── suggest-meal/route.js # Multi-turn AI Coach logic
│   │   ├── suggestions/              # AI Coach Chat interface
│   │   ├── settings/                 # Profile & Goal configurations
│   │   ├── components/
│   │   │   └── BottomNav.js          # Global Tab Navigation (Client-side)
│   │   ├── globals.css               # App-wide UI tokens & mobile resets
│   │   └── page.js                   # Advanced Pro Dashboard
│   └── lib/
│       └── storage.js                # local persistence logic
```

## Running the App

```bash
# Development Mode (LAN accessible for mobile testing)
npm run dev
```

## Maintenance & Current State
The application is **Production-Ready** for local/PWA deployment. It follows a clean "Client-Side Only" architecture for maximum privacy and no database latency.
