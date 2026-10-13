# ByteMindAI Invoice Auditor

Invoice Auditor is a finance workflow MVP for recording invoice metadata, flagging basic risk signals, and tracking review decisions.

## Project structure

- `frontend/` — Next.js App Router application
- `server/` — Express API, custom session authentication, and PostgreSQL persistence

The old Vite AI-tools client is not part of the active application.

## Run locally

Install dependencies:

```bash
cd server
npm install
cd ../frontend
npm install
```

Configure `server/.env` with `DATABASE_URL` for PostgreSQL/Neon. Use `server/.env.example` as the template. Optional settings are `PORT` (default `5000`) and `FRONTEND_URL` (default `http://localhost:3000,http://localhost:5173`). The API initializes the user, session, and invoice tables at startup.

Run the API in one terminal:

```bash
cd server
npm run server
```

Run the web app in another terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`, create an account, submit an invoice, then open it from the dashboard to inspect findings and try approve, reject, or escalate. Authentication uses bcrypt password hashes and an HTTP-only session cookie. Set `NEXT_PUBLIC_API_URL` to the API origin when deploying the frontend separately.

## Current scope

Invoice metadata and risk findings are persisted per user. Starter rules flag repeated invoice numbers and invoice totals at or above `$5,000` and `$10,000`. The dashboard filters reviews by risk/status, and each invoice has a detail page with a persisted decision status.

This MVP does not upload or store document bytes, extract fields with OCR, compare historical vendor prices, or record a reviewer audit trail. The selected filename alone is stored. Risk checks are deterministic starter rules, not AI advice or an accounting decision.

## Tests

Run backend unit tests without a running API:

```bash
cd server
npm test
```

For live integration checks, keep the API and database running in one terminal and run these from another:

```bash
cd server
npm run smoke:api
npm run smoke:detail
```

Each smoke test creates a temporary user and removes it afterward.

Build the frontend:

```bash
cd frontend
npm run build
```

## Credential safety

Keep credentials in ignored local environment files and never commit them. Revoke and rotate any real credentials that were previously committed or shared; removing a key from the current checkout does not remove it from Git history.
