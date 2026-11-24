<div align="center">

# Habit Tracker

**An offline-first, cross-platform habit tracker with real-time sync, tactile micro-interactions, connected-streak calendars, and a native Android home screen widget.**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore_&_Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?style=flat-square&logo=capacitor&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-Jetpack_Glance-7F52FF?style=flat-square&logo=kotlin&logoColor=white)

[Features](#features) • [Architecture](#architecture) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Android Build](#android-build) • [Roadmap](#roadmap)

</div>

---

## Overview

Habit Tracker is a minimalist, zero-cost personal productivity application designed to stay in sync across **PC (Web/PWA)**, **Android phones**, and **Android tablets**. It solves two common friction points in existing habit trackers:
1. **Noisy interfaces & rigid day resets:** Uses a dark, distraction-free UI with a configurable logical day-reset cutoff (default `4:00 AM`) so late-night completions count toward the current day.
2. **High logging friction:** Combines satisfying tactile feedback (spring physics, particle bursts, haptics, and Web Audio synthesis) with an interactive **Jetpack Glance** home screen widget for one-tap logging without opening the app.

---

## Features

* **Real-Time Multi-Device Sync (Offline-First):** Powered by Firebase Firestore with `persistentLocalCache`. Log habits offline on mobile and reconcile automatically across all devices when back online.
* **Tactile Micro-Interactions:**
  * Spring-physics checkbox animations and SVG checkmark stroke draw-in via Framer Motion.
  * Localized 6-particle burst in each habit's accent color.
  * Native Android haptic pulses (`@capacitor/haptics`) paired with a synthesized 45ms Web Audio API percussive pop on desktop (zero external audio assets).
* **Connected-Streak Monthly Calendar:**
  * **Single-Habit Mode:** Consecutive completed days visually merge into continuous rounded streak pills.
  * **All-Habits Mode:** Renders dynamic SVG circular completion rings for every date.
  * **Retroactive Logging:** Click or tap any past date to inspect or update historical logs.
* **Zero-Code Habit Management:** Create, color-code, and archive habits directly in the UI. Archiving hides dropped habits from the daily checklist and widget while preserving historical calendar accuracy.
* **Responsive Cross-Platform Layout:** Automatically adapts from a bottom-tabbed single-column view on phones to a split-screen dashboard on tablets and desktops.
* **Native Android Home Screen Widget:** Interactive checklist widget built with **Jetpack Glance** that stays synchronized with Firestore.

---

## Screenshots

> *Replace these placeholders with screenshots from your PC PWA, Android app, and home screen widget.*

| Desktop / Tablet Dashboard | Mobile Checklist & Calendar | Android Home Screen Widget |
| :---: | :---: | :---: |
| ![Desktop View](docs/screenshots/desktop.png) | ![Mobile View](docs/screenshots/mobile.png) | ![Widget View](docs/screenshots/widget.png) |

---

## Architecture

To guarantee conflict-free synchronization across concurrent devices, streaks are **computed dynamically from completion logs** rather than stored as mutable counters.

```text
┌───────────────────┐       ┌───────────────────────────────┐
│  PC Web App / PWA │       │     Android Phone & Tablet    │
│  (React + Vite)   │       │  Capacitor WebView  │  Glance │
└─────────┬─────────┘       │   (React + Vite)    │  Widget │
          │                 └──────────┬──────────┴────┬────┘
          │                            │               │
          ▼                            ▼               ▼
┌───────────────────────────────────────────────────────────┐
│              Firebase Firestore (Spark Free)              │
│   • Offline Persistence (IndexedDB / Local Cache)         │
│   • Real-Time Listeners (onSnapshot)                      │
│   • Idempotent Composite Keys: {habitId}_{YYYY-MM-DD}     │
└───────────────────────────────────────────────────────────┘
```

### Firestore Data Model

```text
users/{uid}/
├── settings/
│   └── preferences                # { dayResetHour: 4 }
├── habits/
│   └── {habitId}                  # { name, color, archived, order, createdAt }
└── logs/
    └── {habitId}_{YYYY-MM-DD}     # { habitId, date, completed, updatedAt }
```

Using `{habitId}_{YYYY-MM-DD}` as the document ID ensures every toggle is an idempotent `UPSERT`, preventing duplicate entries even if two devices toggle the same habit while offline.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS v4 |
| **Animation & Audio** | Framer Motion, Lucide React, Web Audio API |
| **Mobile & Haptics** | Capacitor, `@capacitor/haptics` |
| **Android Widget** | Kotlin, Jetpack Glance, Android `SharedPreferences` |
| **Backend & Auth** | Firebase Firestore, Firebase Authentication (Email/Password) |
| **Hosting & CI/CD** | Firebase Hosting, GitHub Actions *(optional)* |

---

## Project Structure

```text
habit-tracker/
├── android/                     # Native Android project (Capacitor + Jetpack Glance)
├── public/                      # Static assets & PWA manifest
├── src/
│   ├── components/
│   │   ├── AddHabitModal.tsx    # Create new habit with custom accent color
│   │   ├── CalendarView.tsx     # Monthly calendar (connected pills & completion rings)
│   │   └── HabitCheckbox.tsx    # Spring animation, SVG draw-in & particle burst
│   ├── hooks/
│   │   └── useHabitData.ts      # Real-time Firestore listeners & CRUD mutations
│   ├── lib/
│   │   ├── dateUtils.ts         # Custom day-reset logical date helper
│   │   ├── feedback.ts          # Capacitor haptics + Web Audio pop synthesizer
│   │   └── firebase.ts          # Firebase app, Auth & offline-persistent Firestore
│   ├── App.tsx                  # Auth gate & responsive layout shell
│   ├── index.css                # Tailwind CSS v4 entry & dark theme tokens
│   └── types.ts                 # TypeScript interfaces for Habit & HabitLog
├── .env.local                   # Local Firebase credentials (gitignored)
├── capacitor.config.ts          # Capacitor app ID & webDir configuration
└── vite.config.ts               # Vite + React + Tailwind plugin config
```

---

## Getting Started

### Prerequisites
* Node.js (v22+ recommended)
* A free [Firebase](https://console.firebase.google.com/) project (Spark Plan)
* [Android Studio](https://developer.android.com/studio) *(only required for building the Android APK and widget)*

### 1. Clone & Install Dependencies
```bash
git clone [https://github.com/](https://github.com/)<your-username>/habit-tracker.git
cd habit-tracker
npm install
```

### 2. Configure Firebase
1. In the Firebase Console, enable **Authentication → Email/Password** and create your user account.
2. Create a **Firestore Database** in production mode and apply the security rules below:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Register a Web App in Firebase Project Settings and create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Locally
```bash
npm run dev
```

---

## Android Build

Build the web bundle and sync it into the native Android project:

```bash
npm run build
npx cap sync android
```

Open the `android/` directory in **Android Studio** to:
* Run directly on a USB-connected phone or tablet (`Run ▶`).
* Generate a sideloadable `.apk` via **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

---

## Deployment (Firebase Hosting)

Deploy the web client / PWA for free:

```bash
npm run build
firebase deploy --only hosting
```

---

## Roadmap

- [x] Core React + TypeScript + Tailwind v4 UI
- [x] Real-time offline-first Firestore sync & single-user security rules
- [x] Tactile tick feedback (spring physics, particles, haptics, Web Audio)
- [x] Connected-streak monthly calendar & retroactive logging
- [x] Capacitor Android wrapper
- [ ] Interactive Jetpack Glance Android home screen widget
- [ ] In-app settings modal for custom day-reset hour & sound toggle
- [ ] Automated CI/CD deployment via GitHub Actions

---

## License

This project is open source and available under the [MIT License](LICENSE).#   h a b i t - t r a c k d e r  
 