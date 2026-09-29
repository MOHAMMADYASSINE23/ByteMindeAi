# ByteMindeAi

Invoice Auditor is a finance workflow prototype for reviewing invoices and identifying potential risk before approval.

## Project structure

- `frontend/` — Next.js App Router interface
- `server/` — Express API for custom authentication and PostgreSQL sessions

The previous Vite AI-tools client and its unrelated generation APIs have been removed.

## Run locally

Install dependencies once:

```bash
cd server && npm install
cd ../frontend && npm install
```

Set `server/.env` with `DATABASE_URL` for a Neon/PostgreSQL database. Optional values are `PORT` (defaults to `5000`) and `FRONTEND_URL` (defaults to `http://localhost:3000,http://localhost:5173`). The server creates the `users` and `user_sessions` tables on startup.

Start the API in one terminal:

```bash
cd server
npm run server
```

Start the web app in another terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`. Signup and login use bcrypt password hashes and an HTTP-only session cookie. Set `NEXT_PUBLIC_API_URL` in the frontend deployment to the deployed API origin when not using localhost.

## Current scope

Authentication and protected frontend routes use the API. Invoice metadata and audit findings are persisted per user. The current deterministic checks flag repeated invoice numbers and totals at or above $5,000/$10,000; these are starter rules, not historical price analysis or document extraction. File bytes are not uploaded or stored yet, and approval/rejection actions are not implemented.

Run backend unit tests with `cd server && npm test`. With the API and database running, run `cd server && npm run smoke:api` for a temporary end-to-end signup, invoice, duplicate-check, and logout test; it deletes its temporary account afterward.

## Credential safety

Keep real credentials in ignored local env files and use `server/.env.example` as the template. Credentials previously committed or shared must be revoked and rotated in their provider dashboards; deleting a key from the current file does not remove it from Git history.
