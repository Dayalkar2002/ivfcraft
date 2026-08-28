# smART IVF - Next.js + Node.js

Modern rewrite of the smART IVF & Fertility Management System.

## Project Structure

```
ivf_ng/
├── ivf-next/    → Next.js 15 + React frontend
└── ivf-api/     → Node.js/Express REST API (SQL Server stored procedures)
```

## Prerequisites

- **Node.js v20.19+** (or v22.12+)
- npm

## Quick Start

### 1. Start the API (Terminal 1)

```bash
cd ivf-api
npm install
npm run dev
```

API runs at **http://localhost:3000**

### 2. Start the Next.js App (Terminal 2)

```bash
cd ivf-next
npm install
cp .env.example .env.local
npm run dev
```

App runs at **http://localhost:3001**

See `ivf-next/README.md` for module coverage and remaining legacy parity work.

## Demo Login Credentials

| Username | Password   |
|----------|------------|
| admin    | admin123   |
| doctor   | doctor123  |

## Stack Overview

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| API | Express 5, JWT auth, SQL Server via stored procedures |
| Auth | JWT from `/api/auth/login`, in-memory session |

## Legacy smART parity (_updatesdb.txt)

Compared with `Desktop/ivf/smart` (ASP.NET):

| Change | Status in ivf_ng |
|--------|------------------|
| BT/ET: remove **Donated**, keep **DonatedForResearch** | Done |
| IVF blocked when age > 50 | Done (UI + API) |
| Cycle retrieval: **Self→Self** + **Donor→Recipient** only (Version B) | Done |
| D2R Aadhaar validation + one donor → one recipient | Done (UI + API + `spCheckOocyteDonorAadhar`) |
| Patient **PatMaritalStatus** + category sync on donation | Done |
| Retrieval persisted via **`spCycRetrieval`** when SQL is configured | Done |
| Cycle thaw grids / full Cycle.aspx thaw UI | Not ported yet |
| Cryo entry forms, formatted report PDFs, SMS compose, report email | Partial (SP shells in ivf-next) |

Run DB scripts in `ivf/smart/_updatesdb.txt` on the client database before using Aadhaar check and marital status columns.
