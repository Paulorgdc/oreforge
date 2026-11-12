# ⛏️ OREFORGE: Gamified Financial Management Platform

OREFORGE is an academic all-in-one gamified financial management platform designed to track investments, automate yield calculations, and encourage wealth accumulation through RPG mechanics.

[![Category](https://img.shields.io/badge/CATEGORY-ACADEMIC%20PROJECT-e0004d?style=for-the-badge)](#) [![UNIVAG](https://img.shields.io/badge/UNIVAG-PROJETO%20INTEGRADOR%20EXTENSIONISTA-00c8ff?style=for-the-badge)](#) [![License](https://img.shields.io/badge/LICENSE-MIT-76b900?style=for-the-badge)](#)

---

## 📌 Project Overview

OREFORGE was developed as an academic project during the *Projeto Integrador Extensionista* for the Bachelor's degree in Software Engineering at UNIVAG.

The platform provides a digital gamified solution for personal finance management. By pairing asset tracking (fixed income, equities, real estate funds, and crypto) with level progression, 3D animated medals, and interactive market analytics, the system transforms routine portfolio monitoring into an engaging, achievement-driven experience.

---

## ⚡ Tech Stack

- **Mobile App:** React Native, Expo (SDK 51+), Expo Router, React Native Animated
- **Frontend Web:** Next.js (App Router), React, Tailwind CSS
- **Build & Distribution:** Expo Application Services (EAS Build), Android Standalone APK
- **Icons & Styling:** Feather Icons, Custom SVG & Canvas 3D badge engine

---

## 🚀 Key Features

- **Gamified XP & Mineral Ranks:** Tiered leveling system (Coal to Diamond) that rewards user discipline, portfolio diversification, and active investment tracking.
- **Continuous 3D Medal Vault:** Interactive 3D medal gallery featuring uninterrupted axis rotation and forge-themed ambient lighting.
- **Multi-Asset Portfolio Tracker:** Support for CDB, CDI, Selic, Poupança, Tesouro Direto, Stocks, FIIs, and Crypto with asset-specific parameters.
- **Simplified Rate Engine:** Direct "% of CDI" inputs that compute underlying daily and annual yields without technical overhead.
- **Daily Market Intelligence:** Real-time benchmark indicators (Selic Meta, CDI, IPCA 12m) paired with curated macroeconomic news.
- **Portfolio Analytics & Allocation:** Detailed breakdown by asset category and daily market movers (top gainers and losers).
- **Direct Mobile Distribution:** Web landing page offering immediate Android standalone `.apk` download access.

---

## 📦 Deliverables

| What | Where to see it |
|---|---|
| Web app and landing with Android `.apk` download | [oreforge.vercel.app](https://oreforge.vercel.app) (`frontend/`) |
| Mobile app (Expo) | `mobile/`, run with `npm start` |
| REST API (Express, JWT) | `backend/` |

---

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Paulorgdc/oreforge.git
   cd oreforge
   ```

2. **Install each application independently:** run `npm ci` in `backend`,
   `frontend` and `mobile`. Each application has its own lockfile.
3. Copy each module's `.env.example` to `.env.local` in the same module (the backend loads `backend/.env.local` explicitly, Vite and Expo read `.env.local` natively).
   Configure backend database/JWT/SMTP settings and the API URL used by clients.
   Keep real credentials out of Git.
4. Run `npm run dev` in `backend` and `frontend`; run `npm start` in `mobile`.
   Follow Expo's device/emulator instructions. Database migration is an explicit
   operational action (`npm run migrate` in backend), not part of documentation checks.

SDK versions are defined by
the module manifests and lockfiles, not by descriptive minimum versions here.
