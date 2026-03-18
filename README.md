# Fuel Watch ⛽

Fuel Watch is a modern, crowdsourced fuel availability platform designed for Sri Lanka. It allows users to quickly locate nearby fuel stations via an interactive Google Map, check the real-time availability of fuel types, and contribute status updates to help the community.

## ✨ Features

- **Location-Based Discovery**: Automatically drops a pin on your location and displays all registered fuel stations within your vicinity using the Google Maps API.
- **Crowdsourced Live Updates**: Any user can submit availability updates (Available, Low Stock, Out of Stock) for specific fuel types (Petrol 92, Petrol 95, Diesel, Super Diesel).
- **Responsive Glassmorphic UI**: Beautifully designed tailored components with an "Apple + Uber" inspired aesthetic using Tailwind CSS & internal UI blocks.
- **Admin Dashboard**: A secure portal guarded by Firebase Google Authentication to manage stations.
- **Auto-Discovery Integration**: Clicking "Auto-Discover Nearby" in the Admin Panel sweeps the area via the Google Places API, instantly seeding the database with missing stations.

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database / Auth**: Firebase (Firestore & Firebase Auth)
- **Map Provider**: Google Maps API (`@react-google-maps/api`)
- **State Management**: SWR for rapid client-side data fetching and revalidation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google Cloud Console project with **Maps JavaScript API** and **Places API** enabled.
- A Firebase project with **Firestore Database** and **Authentication** (Google Sign-in) enabled.

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root of the project with your API keys:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"
```

### 3. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application!

## 🔐 Admin Setup & Data Seeding

To quickly populate stations to your map without typing them manually:
1. Navigate to [http://localhost:3000/login](http://localhost:3000/login) and log in via your Google Account.
2. In the Admin Dashboard (`/admin`), allow location permissions if prompted.
3. Click the **"Auto-Discover Nearby"** button. The app will utilize the Google Places API to search for `gas_station` locations within a 10km radius of your coordinates (or Colombo if location is denied).
4. Discovered stations will immediately sync with Firestore and appear on the main map.

## 🌐 Deployment

This application is fully optimized to be hosted on Vercel. 
1. Push your code to GitHub.
2. Import the project into Vercel.
3. Add the exact environment variables from your `.env.local` under the Vercel Project Settings.
4. Deploy! Next.js will handle the rest.
