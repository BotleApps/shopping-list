# Shopping List App Walkthrough

## Prerequisites
- Node.js installed
- MongoDB running locally (default port 27017)

## Setup & Run

### 1. Start Backend
```bash
cd server
npm install
node src/index.js
```
Server runs on `http://localhost:5000`.

### 2. Start Frontend
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`.

## Features
- **Master List**: Manage your grocery items (add, delete).
- **Shopping List**: Add items from Master List, mark as purchased, remove items.
- **Amazon Integration**: Click the shopping cart icon on any item to search for it on Amazon.in.
- **PWA**: Installable on mobile devices.
- **Dark Mode**: Automatically adapts to system theme.

## Verification
- Open the app in your browser.
- Go to "Master List" and add a product (e.g., "Milk", "Dairy", 1, "Liter").
- Go to "Shopping List", click "+", and add "Milk".
- Verify "Milk" appears in the list.
- Click the cart icon to verify it opens Amazon search for "Milk".
