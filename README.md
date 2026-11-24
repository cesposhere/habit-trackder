# Habit Tracker

A high-performance, offline-first, cross-platform habit tracking application with seamless synchronization across **Web (PWA)**, **Android phones**, and **Android tablets**. It features tactile micro-interactions, a customizable logical day boundary, an interactive calendar with radially spaced completion dots, and a native Android **Jetpack Glance** home screen widget.

---

## Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Data Architecture & Firestore Schema](#-data-architecture--firestore-schema)
- [Getting Started (Local Development)](#-getting-started-local-development)
- [Building for Android & Testing the Widget](#-building-for-android--testing-the-widget)
- [GitHub Actions Automated Deployment](#-github-actions-automated-deployment)
- [License](#-license)

---

## 🌟 Key Features

### ⚡ Offline-First Architecture & Multi-Device Sync

- **Firestore Local Persistence:** Operates fully offline on desktop and mobile. All state changes read from and write to the local cache instantly, then sync back to Firebase Firestore when connectivity is restored.
- **Idempotent Document Log Model:** Uses composite keys (`{habitId}_{YYYY-MM-DD}`) for completion logs to guarantee conflict-free UPSERT operations across multiple simultaneous devices.

### 📱 Native Android Home Screen Widget (Jetpack Glance)

- **Interactive Square Grid:** A custom Kotlin and Jetpack Glance widget that displays active habits as square tiles directly on your Android home screen.
- **Zero-Latency State Updates:** Tapping a habit tile immediately flips state in local `SharedPreferences` and triggers a `DataStore` recomposition key update for sub-second UI feedback.
- **Background Async Network Patch:** Non-blocking, fire-and-forget REST updates to Firestore with automatic Firebase ID token refresh handling.

### 📅 Advanced Calendar & Streak Visualization

- **Radially Spaced Multi-Habit Dots:** Calculates exact angular coordinates on a circular perimeter around each date number to render distinct, non-overlapping color dots for every habit completed that day:

  ```
  angle = -π/2 + (2π * i) / N
  ```

- **Single-Habit Streak View:** Merges consecutive completed days into continuous visual streak pills.
- **Retroactive Logging:** Tap past calendar dates to inspect, tick, or untick historical completion records.

### 🕒 Customizable Logical Day Reset

- **Custom Midnight Offset (Default: 4:00 AM):** Prevents broken streaks for night owls by attributing completions between midnight and 4:00 AM to the previous calendar day.

### 🎨 Micro-Interactions & UX Polish

- **Tactile Feedback Loop:** Combines Framer Motion spring physics, SVG checkmark drawing animations, Web Audio API sound synthesis on desktop, and native `@capacitor/haptics` vibrations on Android.
- **Full-Row Touch Targets:** The entire habit card is clickable, with dedicated, isolated delete buttons (`e.stopPropagation()`).
- **Show/Hide Password Input:** Integrated `lucide-react` toggle within authentication forms.

---

## 🛠️ Tech Stack

### Frontend & Web Application

| Tool / Library | Role |
| --- | --- |
| React 19 | UI component framework |
| TypeScript 5 | Strict static typing |
| Vite | Frontend build tool & dev server |
| Tailwind CSS v4 | Utility-first styling system |
| Framer Motion | Physics-based component animations |
| Lucide React | Modern icon system |

### Mobile & Native Android Integration

| Tool / Library | Role |
| --- | --- |
| Capacitor 6 | Native Android container & plugins |
| Jetpack Glance 1.1 | Kotlin declarative home screen widget framework |
| Android DataStore & SharedPrefs | High-speed native local storage |
| Kotlin Coroutines | Asynchronous background Firestore network patching |

### Backend, Database & CI/CD

| Tool / Library | Role |
| --- | --- |
| Firebase Auth | User authentication (email/password) |
| Cloud Firestore | NoSQL realtime database with offline persistence |
| Firebase Hosting | Global PWA web distribution |
| GitHub Actions | Automated CI/CD deployment pipeline |

---

## 📐 Data Architecture & Firestore Schema

To compute accurate streaks without race conditions or write conflicts, streaks are calculated on the fly from granular completion logs:

```text
users/{userId}/
├── settings/
│   └── preferences
│       └── { dayResetHour: 4 }
├── habits/
│   └── {habitId}
│       ├── name: string
│       ├── color: string          // e.g. "#10B981"
│       ├── archived: boolean
│       ├── order: number
│       └── createdAt: timestamp
└── logs/
    └── {habitId}_{YYYY-MM-DD}     // Composite Document ID
        ├── habitId: string
        ├── date: string           // "YYYY-MM-DD"
        ├── completed: boolean
        └── updatedAt: timestamp
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Android Studio:** Ladybug (2024.2.1) or newer, with JDK 17/21 installed

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/cesposhere/habit-tracker.git
cd habit-tracker
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 3. Set Up Firestore Security Rules

In the Firebase Console, go to **Firestore Database → Rules** and paste:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Run the Web Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 Building for Android & Testing the Widget

### 1. Sync the React Web Build to the Android Project

```bash
npm run build
npx cap sync android
```

### 2. Build & Launch via Android Studio

1. Open Android Studio.
2. Choose **Open Project** and navigate to the `habit-tracker/android` directory.
3. Select your target physical device (via USB debugging) or a virtual emulator.
4. Click **Run (▶)**, or select **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

### 3. Add the Widget to Your Home Screen

1. Open the app on your phone and log in to load your habits.
2. Return to your phone's home screen and long-press any blank space.
3. Select **Widgets** and scroll to **Habit Tracker**.
4. Drag the widget onto your home screen and resize it to your preference.

---

## 🤖 GitHub Actions Automated Deployment

This repository includes continuous deployment for Firebase Hosting via GitHub Actions.

### Setting Up Secret Keys on GitHub

1. Go to your repository on GitHub: **Settings → Secrets and variables → Actions**.
2. Click **New repository secret** and add the following 6 secrets from your `.env.local`:

   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

Whenever changes are merged into the `main` branch, GitHub Actions automatically builds the project and deploys it live to Firebase Hosting.

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.