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

Authentication and protected frontend routes are connected to the API. Invoice audit results are still demonstration data; document extraction, persistent invoice records, risk scoring, and approval actions are not yet implemented.

## Credential safety

Keep real credentials in ignored local env files and use `server/.env.example` as the template. Credentials previously committed or shared must be revoked and rotated in their provider dashboards; deleting a key from the current file does not remove it from Git history.
