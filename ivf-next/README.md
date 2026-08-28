# smART IVF — Next.js Frontend

React + **Next.js 15** (App Router) frontend for the smART IVF system. Uses the **Node.js/Express** API in `../ivf-api`.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| API | Express 5 (`ivf-api`) |
| Auth | JWT from `/api/auth/login`, in-memory session (no localStorage) |

## Quick start

### 1. API (port 3000)

```bash
cd ivf-api
npm install
npm run dev
```

Ensure `CORS_ORIGIN` includes the Next.js dev URL:

```env
CORS_ORIGIN=http://localhost:3001
```

### 2. Next.js app (port 3001)

```bash
cd ivf-next
npm install
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3001**

## Module coverage

| Area | Status |
|------|--------|
| Login, layout, nav, patient context | Done |
| Cycle entry + retrieval (S2S, D2R) + tabs | Done |
| IUI / IVF / ICSI / ET / BT | Done (core forms) |
| Patient, doctor, satellite, common masters | Done |
| User master | List only (permissions TBD) |
| Donor lab, outcome drug, role master | SP CRUD via `module-registry.ts` |
| Reports (18 routes) | SP runner → data table |
| Cryo (4 modules) | Patient list via SP (entry forms TBD) |
| Media, stats, appointments | Hub / list shells |
| SMS, report email | Partial / info only |

Remaining work is **legacy ASP.NET parity** (cryo entry, report layouts, IUI detail sections, user permissions) — not blocked by any Angular code.

## Project layout

```
ivf-next/src/
├── app/
│   ├── login/              # Public login
│   └── (app)/              # Authenticated routes
├── components/             # UI + ModuleRunner
├── contexts/               # Auth + patient
└── lib/
    ├── module-registry.ts  # Unified config for reports/cryo/ops
    └── services/           # API + SP clients
```

## Notes

- Run Next on **3001** so the API stays on **3000**.
- Generic SP access: `POST /api/sp/drl` and `/api/sp/dml` (see `lib/services/sp.ts`).
- Branding images from the old Angular app are kept under `public/images/` for optional use on the login page.
