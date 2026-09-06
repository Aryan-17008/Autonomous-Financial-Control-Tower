# Autonomous Financial Control Tower

This is a comprehensive hackathon MVP for an autonomous financial control tower. It features a React Native (Expo) frontend and a NestJS backend powered by Prisma and SQLite.

## Prerequisites

- Node.js (v18+)
- npm

## Setup & Running

This project is divided into `backend` and `frontend`.

### 1. Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Set up the database:
   ```bash
   npx prisma db push
   ```
4. Start the backend development server:
   ```bash
   npm run start:dev
   ```
   The backend will run on `http://localhost:3000`.

### 2. Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start -c
   ```
4. Press `w` to open in a web browser.

## Features Implemented

- **JWT Authentication**
- **Data Ingestion** (CSV upload parsing)
- **Risk & Alerting**
- **Cash Flow Forecasting**
- **What-If Simulations**
