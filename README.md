# 🚀 DMTrack - Digital Marketing Business Platform

DMTrack is a comprehensive, all-in-one platform designed for digital marketing agencies to manage clients, automate ad campaign monitoring, generate AI-driven insights, and handle professional billing—all in one high-premium dashboard.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Lucide Icons, Zustand (State Management)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (with daily automated health checks)
- **Engine:** Custom Node-Cron background workers for AI Analysis & Automated Reporting
- **Styling:** Premium Vanilla CSS & Modern Glassmorphism UI

## ✨ Completed Features (Sprints 1-13)

### 🧠 AI Intelligence Suite
- **Nightly Engine:** Automated background scanning of client campaign performance.
- **Actionable Insights:** AI-generated alerts for ROAS drops, scaling opportunities, and performance forecasts.
- **Reporting Engine:** Weekly automated PDF-ready performance summaries generated every Monday at 3:00 AM.

### 💳 Financial & Operations
- **Invoicing Hub:** Automated GST (18%) calculations, pending/paid tracking, and manual invoice generation.
- **Team Management:** Role-based access control (Owner, Manager, Finance, Viewer) and invitation system.
- **Client Workspace:** Deep-dive client profiles with campaign history and integration heatmaps.

### 🔍 Search & Social
- **SEO Tracker:** Daily keyword ranking monitor with historical change tracking, search volume, and difficulty metrics.
- **Ad Campaigns:** Centralized view of Meta & Google Ads performance (Dev-mode sync active).

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Cloud)

### 2. Backend Setup
```bash
cd dmtrack-backend
npm install
# Configure your .env (DATABASE_URL, JWT_SECRET, etc.)
npm start
```

### 3. Frontend Setup
```bash
cd dmtrack-frontend
npm install
npm run dev
```

## ✅ Project Completion Status (100%)
All **16 Sprints** are successfully implemented, tested, and secured.

## 📈 Completed Roadmap
- [x] **Sprint 1-5:** Project Setup & Core Modules (Clients, Campaigns, Auth)
- [x] **Sprint 6-9:** AI Insight Engine & Performance Forecasting
- [x] **Sprint 10:** Multi-Role Access Control (Agency Permissions)
- [x] **Sprint 11:** Invoicing & GST Billing System
- [x] **Sprint 12:** Automated Monday Morning Reports (Cron)
- [x] **Sprint 13:** SEO Keyword Performance Tracker
- [x] **Sprint 14:** Multichannel Social Content Hub
- [x] **Sprint 15:** Mobile-First Client Portal
- [x] **Sprint 16:** Security Hardening & Rate Limiting

---
*DMTrack is now Production-Ready.*
