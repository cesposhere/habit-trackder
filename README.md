Habit TrackerA high-performance, offline-first cross-platform habit tracking application designed for seamless synchronization across Web (PWA), Android Phones, and Android Tablets. Built with tactile micro-interactions, custom logical day boundaries, an interactive calendar with radially-spaced completion dots, and a native Android Jetpack Glance home screen widget.🌟 Key Features⚡ Offline-First Architecture & Multi-Device SyncFirestore Local Persistence: Operates fully offline on desktop and mobile. All state changes read from and write to local cache instantly, syncing back to Firebase Firestore when connectivity is restored.Idempotent Document Log Model: Uses composite keys ({habitId}_{YYYY-MM-DD}) for completion logs to guarantee conflict-free UPSERT operations across multiple simultaneous devices.📱 Native Android Home Screen Widget (Jetpack Glance)Interactive Square Grid: Custom Kotlin & Jetpack Glance widget displaying active habits as square tiles directly on your Android home screen.Zero-Latency State Updates: Tapping a habit tile immediately flips state in local SharedPreferences and triggers a DataStore recomposition key update for sub-second UI feedback.Background Async Network Patch: Non-blocking fire-and-forget REST updates to Firestore with automatic Firebase ID token refresh handling.📅 Advanced Calendar & Streak VisualizationRadially Spaced Multi-Habit Dots: Calculates exact angular coordinates on a circular perimeter (angle = -π/2 + (2π * i) / N) around date numbers to render distinct, non-overlapping color dots for every habit completed on that day.Single-Habit Streak View: Merges consecutive completed days into continuous visual streak pills.Retroactive Logging: Tap past calendar dates to inspect, tick, or untick historical completion records.🕒 Customizable Logical Day ResetCustom Midnight Offset (Default: 4:00 AM): Prevents broken streaks for night owls by attributing completions between midnight and 4:00 AM to the previous calendar day.🎨 Micro-Interactions & UX PolishTactile Feedback Loop: Combines Framer Motion spring physics, SVG checkmark drawing animations, Web Audio API sound synthesis on desktop, and native @capacitor/haptics vibrations on Android.Full-Row Touch Targets: Entire habit card is clickable with dedicated, isolated delete buttons (e.stopPropagation()).Show/Hide Password Input: Integrated lucide-react toggle within authentication forms.🛠️ Tech StackFrontend & Web ApplicationTool / LibraryRoleReact 19UI Component FrameworkTypeScript 5Strict Static TypingViteFrontend Build Tool & Dev ServerTailwind CSS v4Utility-First Styling SystemFramer MotionPhysics-Based Component AnimationsLucide ReactModern Icon SystemMobile & Native Android IntegrationTool / LibraryRoleCapacitor 6Native Android Container & PluginsJetpack Glance 1.1Kotlin Declarative Home Screen Widget FrameworkAndroid DataStore & SharedPrefsHigh-Speed Native Local StorageKotlin CoroutinesAsynchronous Background Firestore Network PatchingBackend, Database & CI/CDTool / LibraryRoleFirebase AuthUser Authentication (Email/Password)Cloud FirestoreNoSQL Realtime Database with Offline PersistenceFirebase HostingGlobal PWA Web DistributionGitHub ActionsAutomated CI/CD Deployment Pipeline📐 Data Architecture & Firestore SchemaTo compute accurate streaks without race conditions or write conflicts, streaks are calculated on-the-fly from granular completion logs:users/{userId}/
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
🚀 Getting Started (Local Development)PrerequisitesNode.js: v18.0.0 or highernpm: v9.0.0 or higherAndroid Studio: Ladybug (2024.2.1) or newer with JDK 17/21 installed1. Clone & Install Dependenciesgit clone https://github.com/cesposhere/habit-tracker.git
cd habit-tracker
npm install
2. Configure Environment VariablesCreate a .env.local file in the root directory:VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id_here
3. Setup Firestore Security RulesIn your Firebase Console under Firestore Database → Rules, paste:rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
4. Run Web Applicationnpm run dev
Open http://localhost:5173 in your browser.📱 Building for Android & Testing the Widget1. Sync React Web Build to Android Projectnpm run build
npx cap sync android
2. Build & Launch via Android StudioOpen Android Studio.Choose Open Project and navigate to the habit-tracker/android directory.Select your target physical device (via USB Debugging) or Virtual Emulator.Click Run (▶) or select Build → Build Bundle(s) / APK(s) → Build APK(s).3. Adding the Widget to Your Home ScreenOpen the app on your phone and log in to load your habits.Return to your phone's home screen and long-press any blank space.Select Widgets → Scroll to Habit Tracker.Drag the widget onto your home screen and resize to your preference.🤖 GitHub Actions Automated DeploymentThis repository includes continuous deployment for Firebase Hosting via GitHub Actions.Setting Up Secret Keys on GitHubGo to your repository on GitHub: Settings → Secrets and variables → Actions.Click New repository secret and add the following 6 secrets from your .env.local:VITE_FIREBASE_API_KEYVITE_FIREBASE_AUTH_DOMAINVITE_FIREBASE_PROJECT_IDVITE_FIREBASE_STORAGE_BUCKETVITE_FIREBASE_MESSAGING_SENDER_IDVITE_FIREBASE_APP_IDWhenever changes are merged into the main branch, GitHub Actions automatically builds the project and deploys it live to Firebase Hosting.📜 LicenseDistributed under the MIT License. See LICENSE for more information.