# ScanFlow — QR & Barcode Scanner

## Overview
A full-stack QR/barcode scanner web app with no sign-in required. All scans are stored anonymously via PostgreSQL.

## Features
- **Scan** — Camera-based QR/barcode scanning (html5-qrcode), flashlight toggle, gallery upload, zoom controls
- **Result actions** — Copy, Share, Open (detects URLs, phone numbers, emails, SMS, any `scheme://`)
- **Generate** — Custom QR codes with Templates (WiFi, WhatsApp, Instagram), color themes, logo overlay, download as PNG
- **History** — Persistent scan history stored in PostgreSQL

## Stack
- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui, wouter routing, TanStack Query
- **Backend**: Express.js, Drizzle ORM, PostgreSQL
- **QR Scanning**: html5-qrcode
- **QR Generation**: qrcode.react

## Architecture
- `client/src/pages/` — home.tsx (scanner), generate.tsx (QR generator), history.tsx
- `client/src/components/` — scanner.tsx, scan-result-card.tsx, layout.tsx
- `server/` — routes.ts, storage.ts, index.ts
- `shared/schema.ts` — Drizzle schema (scans table, userId nullable for anonymous)

## Key Notes
- No authentication required — scans stored with `userId: "anonymous"`
- Open Link uses `window.open()` in button onClick (bypasses wouter link interception)
- QR logo overlay uses qrcode.react `imageSettings` with `excavate: true` and `level: "H"`
- WiFi QR format: `WIFI:T:WPA;S:ssid;P:pass;;`
- WhatsApp QR: `https://wa.me/{phone}?text={message}`
- Instagram QR: `https://instagram.com/{username}`
