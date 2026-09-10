# Grand Horizon Hotel Management System

Full hotel reservation + online booking + admin dashboard with **PWA support**.

## Stack
- Next.js 15 + TypeScript + Tailwind
- Prisma + SQLite
- NextAuth
- Progressive Web App (manifest + service worker)

## Quick Start (local)
```bash
npm install
npm run db:setup
npm run dev
```

Open http://localhost:3000

**Demo logins**
- Admin: `admin@hotel.com` / `admin123`
- Guest: `guest@example.com` / `guest123`

## Deploy to Vercel
1. Import this repository on vercel.com
2. Add environment variables:
   - `DATABASE_URL` (use a Postgres URL for production, or keep SQLite for demo)
   - `NEXTAUTH_SECRET` (any long random string)
   - `NEXTAUTH_URL` (your Vercel URL)
3. Deploy

## PWA
- `/manifest.json` and `/sw.js` are included
- Icons should be added to `/public` (icon-192.png, icon-512.png, apple-touch-icon.png)
- After deploy, test on PWABuilder or install from browser

## Features
- Real-time room availability
- Double-booking protection with transactions
- Admin check-in / check-out / room status
- Installable as PWA
