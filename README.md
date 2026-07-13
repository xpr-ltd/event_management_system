# EventCenter Scheduler (Demo)

A premium, mobile-responsive event venue booking scheduler. It provides a frictionless interface for customers to request event bookings on a shared calendar and offers venue administrators a private dashboard to review, approve, or reject requests while guaranteeing zero double-bookings.

---

## 🌟 Key Features

### 📅 Customer Calendar & Booking
- **Interactive Calendar:** Visual month-view powered by FullCalendar.js showing currently booked/approved slots.
- **Colorblind-Friendly Indicators:** Calendar entries use explicit labels and icons (`☀️ Morn`, `🌙 Eve`, `⭐ Full`) rather than color alone to communicate information.
- **Frictionless Booking Form:** Side-by-side layout on desktop and stacked layout on mobile.
- **Dynamic Slot Availability:** Clicking a date instantly checks current approved bookings. Occupied slots are automatically disabled on the request form with a `Booked` indicator, preventing duplicate request submissions.

### 🛡️ Admin Dashboard (Unlisted `/admin` URL)
- **Key Statistics Cards:** Displays overview of Total Requests, Pending Review, Approved Bookings, and Declined/Conflict requests.
- **Tab Filtering & Searching:** Search entries by customer name, email, event details, or date.
- **Smart Conflict Warning Badges:** 
  - If a pending request overlaps with an already-approved booking, a warning badge is displayed and the **Approve** button is disabled to prevent overbooking.
  - If a pending request overlaps with other pending requests, it displays a warning indicating how many other requests will be automatically declined.
- **Auto-Rejection Logic:** Approving a booking request instantly changes the status of any conflicting pending requests to `Overlap Rejected`.

### 📰 Live Ticker Banner
- **Rolling News Ticker:** Displays real-time updates for recently accepted or declined bookings at the very top of the page.
- **Seeded Welcome Mode:** Tickers showcase a welcome tutorial if no bookings have been modified yet.
- **Micro-Animations:** Ticker pauses smoothly when hovered by the cursor.

---

## 🎨 Design & Aesthetics

The application features a modern, high-fidelity **glassmorphic dark theme**:
- **Palette:** Curated gold accent (`#D4AF37`), neon pink (`#EC4899`), and deep indigo-violet gradients.
- **Contrast & Typo:** Set using clean, modern typography (Outfit & Plus Jakarta Sans) with high-contrast text layers to guarantee readability.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, ReactDOM
- **Build Tool:** Vite
- **Icons:** Lucide React
- **Calendar Library:** FullCalendar.js (with daygrid & interaction plugins)
- **Styling:** Custom Vanilla CSS with structured layout, color, and spacing utilities
- **Database/Storage:** Browser `LocalStorage` (packaged with seed data for demo purposes)

---

## 📁 Project Structure

```text
event_mngr/
├── index.html               # Main HTML file with custom font imports and metadata
├── package.json             # NPM package manifest
├── vite.config.js           # Vite dev/build configuration
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # App shell, URL routing switch, state storage & conflict logic
│   ├── index.css            # Custom CSS theme variables and utility classes
│   └── components/
│       ├── TickerBanner.jsx # Seamless marquee for rolling updates
│       ├── CustomerView.jsx # Calendar layout and request form
│       └── AdminView.jsx    # Dashboard stats cards and request grid
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Install Dependencies
Clone the repository, navigate to the folder, and install the package dependencies:
```bash
npm install
```

### 2. Run the Development Server
Launch the local dev server:
```bash
npm run dev
```
Open the local URL displayed in the console (usually [http://localhost:5173/](http://localhost:5173/) or [http://localhost:5174/](http://localhost:5174/)).

- Go to `/` for the public booking request form.
- Go to `/admin` to access the administrator dashboard.

### 3. Build for Production
To build the application for static web hosting:
```bash
npm run build
```
This generates the optimized static build in the `dist/` directory.
