# Fuel Watch Sri Lanka ⛽ | Real-time Fuel Availability Platform

Fuel Watch is a modern, crowdsourced fuel availability platform designed for Sri Lanka. It allows users to quickly locate nearby fuel stations via an interactive Google Map, check real-time availability of fuel types, and contribute status updates to help the community navigate fuel shortages.

Developed for transparency and efficiency, Fuel Watch combines cutting-edge web technology with a "community-first" approach.

---

## ✨ Key Features

### 🗺️ Real-time Discovery
- **Location-Based Pins**: Interactive Google Map that automatically drops a pin on your coordinates to show registered stations nearby.
- **Dynamic Theming**: The map and UI automatically adapt between **Light** and **Dark** modes (including a custom "Aubergine" dark map style) for optimal viewing.
- **Nearby Search**: Proximity-based station filtering ensuring you find the closest available fuel.

### 👥 Crowdsourced Intelligence
- **Community Updates**: Users can submit live status updates for **Petrol 92**, **Petrol 95**, **Auto Diesel**, and **Super Diesel**.
- **Queue Status**: Real-time reporting of queue lengths (None, Medium, Long) with time-stamped updates.
- **Update Verification**: Displays the total count of community updates for each station to build trust and reliability.

### 🛠️ Administrative Power
- **Analytics Dashboard**: Integrated **Google Analytics 4 (GA4)** dashboard showing real-time traffic, user distribution, and device stats.
- **Auto-Discovery**: Admin tool to "Sweep" an area using Google Places API, instantly seeding the Firestore database with local stations.
- **Cache Control**: Manual on-demand cache revalidation for project-wide data consistency.
- **History Log**: Full transparency with an update history log including station names and timestamps.

### 🛡️ Smart Tooling
- **Fuel Wallet Pass**: Easily convert your Sri Lanka Fuel QR code into a sleek **Apple Wallet** or **Google Wallet** pass via Hayaku integration.
- **Quota Schedule**: Built-in calculator to check allowed fuel pumping dates based on your vehicle registration number.
- **SEO Optimized**: Fully optimized with **Open Graph (OG)** branding, custom Poppins-style sharing images, and dynamic meta-tags for search visibility.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router & Server Actions)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Adaptive Glassmorphism
- **Database**: [Firebase Firestore](https://firebase.google.com/products/firestore) (Real-time NoSQL)
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth) (Google & Email/Password)
- **Analytics**: [Google Analytics Data API (GA4)](https://developers.google.com/analytics/devguides/reporting/data/v1)
- **Mapping**: [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview)
- **State Management**: [SWR](https://swr.vercel.app/) for rapid data revalidation

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- **Google Cloud Project**: With Maps JavaScript API, Places API, and Analytics Data API enabled.
- **Firebase Project**: With Firestore and Authentication (Google) enabled.

### 1. Installation
```bash
git clone https://github.com/UvinduBro/Fuel-Watch.git
cd Fuel-Watch
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-api-key"

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="..."

# Admin Analytics (GA4)
GA_PROPERTY_ID="12345678"
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type": "service_account", ...}'
```

### 3. Start Development
```bash
npm run dev
```

---

## 🔐 Admin & Deployment

### Data Seeding
1. Log in via `/login` to access the Admin Panel.
2. Click **"Auto-Discover Nearby"** to instantly populate stations from Google Places.
3. Use the **Cache Control** tool in the dashboard to force-refresh project data across all clients.

### Deployment on Vercel
Fuel Watch is optimized for [Vercel](https://vercel.com/):
1. Connect your repository.
2. Add all environment variables.
3. Deploy! Next.js will automatically handle the build-time optimizations.

---

## 📝 License
This project is for community welfare. Use it responsibly to help fellow citizens.