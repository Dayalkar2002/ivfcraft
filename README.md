# smART IVF - Angular + Node.js

Modern rewrite of the smART IVF & Fertility Management System using **Angular 20** (frontend) and **Node.js/Express** (API).

## Project Structure

```
ivf_ng/
├── ivf-web/     → Angular 20 frontend (NgRx state, no localStorage)
└── ivf-api/     → Node.js REST API (JWT authentication)
```

## Prerequisites

- **Node.js v20.19+** (or v22.12+) — required for Angular CLI 20 `ng serve` / `ng build`
- npm

> Your current Node v20.14 can run the **API** fine. For the Angular app, upgrade Node from [nodejs.org](https://nodejs.org/) or use nvm.

## Quick Start

### 1. Start the API (Terminal 1)

```bash
cd ivf-api
npm install
npm run dev
```

API runs at **http://localhost:3000**

### 2. Start the Angular App (Terminal 2)

```bash
cd ivf-web
npm install
npm start
```

App runs at **http://localhost:4200**

## Demo Login Credentials

| Username | Password   |
|----------|------------|
| admin    | admin123   |
| doctor   | doctor123  |

## Features Implemented

- **Login page** – Matches existing smART minimal login design
- **Top menu + left sidebar** layout with patient context bar
- **Cycle Entry Module** – Oocyte/Semen source selection with conditional detail panels and dynamic cycle type summary
- **Retrieval page** – Self→Self, Self→Recipient, Donor→Recipient, Embryo Recipient sections based on cycle type (from your Word documents)
- **NgRx store** – Auth, Patient, Cycle, UI (loader) – no localStorage
- **JWT middleware** – Token auth on all protected API routes
- **Global loader** – Shown during API operations

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/patients | Yes | Search/list patients |
| GET | /api/cycles/types | Yes | Oocyte & semen source options |
| POST | /api/cycles/entry | Yes | Save cycle entry |
| GET | /api/cycles/:id/retrieval-config | Yes | Retrieval page config |
| POST | /api/cycles/:id/retrieval | Yes | Save retrieval data |

## Notes

- State is kept in NgRx memory only – refreshing the browser will require re-login.
- API uses in-memory demo data; connect to SQL Server when ready for production.

Developed by Jainamm Software
