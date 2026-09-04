# Autonomous Financial Control Tower

An AI-powered, real-time financial control center built with **NestJS**, **Prisma**, **SQLite**, and **React Native (Expo)**. This application continuously monitors financial activity, detects risks (Fraud, Cash Flow, Compliance), generates recommendations, and maintains a complete immutable audit trail.

---

## 🛠 Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)
- [Expo Go App](https://expo.dev/go) (if you want to test on a physical iOS or Android device)

---

## 🚀 Step-by-Step Setup Guide

This project is a monorepo containing both a `frontend` and a `backend`. You will need to open two separate terminal windows to boot up both sides.

### Step 1: Boot up the Backend (NestJS + SQLite)

Open your first terminal and run the following commands:

\`\`\`bash
# Navigate to the backend folder
cd financial-tower/backend

# Install dependencies
npm install

# Initialize the SQLite Database and Prisma Client
npx prisma db push --accept-data-loss
npx prisma generate

# Start the NestJS server
npm run start:dev
\`\`\`
*The backend should now be running on `http://localhost:3000`.*

---

### Step 2: Boot up the Frontend (Expo)

Before starting the frontend, if you plan to run this on a **physical mobile device**, you need to point the app to your computer's local Wi-Fi IP address (since `localhost` on a phone points to the phone itself, not your computer). 

1. Open `financial-tower/frontend/lib/api.ts`
2. Change the `API_URL` to match your computer's local IPv4 address (e.g., `http://192.168.1.100:3000`). If you are only testing on the web browser, `localhost` works perfectly fine!

Open a **second** terminal and run the following:

\`\`\`bash
# Navigate to the frontend folder
cd financial-tower/frontend

# Install dependencies
npm install

# Start the Expo Metro Bundler
npm run start
\`\`\`

### Step 3: View the App

Once the Expo bundler starts, it will display a QR code in your terminal.
- **For Web:** Press `w` in the terminal to automatically open the app in your browser.
- **For Mobile:** Open the **Expo Go** app on your phone and scan the QR code.

---

## 💡 How to Test the Demo Flow

1. On the login screen, click **"Create an account"** and register a test user.
2. Once logged into the dashboard, open the sidebar and navigate to the **"Data In"** tab.
3. Click the **"Simulate Upload"** button. This mimics a batch CSV upload of transactions.
4. The transaction payload will hit the NestJS backend and route through the AI agents (Fraud, Cash Flow, Compliance).
5. Navigate to the **"Alerts"**, **"Risk"**, and **"AI"** tabs to see the dynamically generated flags, counterparty risk scores, and blocked recommendations!
