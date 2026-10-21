# ByteMindAI Invoice Auditor

A full-stack invoice review application that helps users organize invoices, surface potential risk signals, and track human review decisions.

> **Current scope:** This project uses deterministic rules and traditional document text extraction. It does not currently use an LLM or RAG, and its risk findings are not accounting or legal advice.

## What it does

- **Accounts and sessions:** Sign up and log in with bcrypt password hashing and HTTP-only session cookies.
- **Invoice intake:** Enter invoice details manually or upload a PDF/image (up to 10 MB) for metadata extraction.
- **Document extraction:** Read embedded text from PDFs with PDF.js and use Tesseract OCR for supported images. Extraction attempts to preserve PDF line structure and recognizes common US dollar amount formats. Explicitly non-USD totals are not treated as USD. The current data model and risk thresholds are USD-only, so foreign-currency invoices must not be scored until currency-aware storage and rules are implemented. Extracted vendor, invoice number, and amount are best-effort suggestions, so users should verify them before saving.
- **Rule-based risk checks:** Flag repeated invoice numbers, higher-value invoices, and invoices that are unusually large compared with recent invoices from the same vendor.
- **Review workflow:** Browse invoices, inspect findings, add review notes, and update a decision status.
- **Per-user data isolation:** Invoice queries are scoped to the authenticated user.
- **Persistent review context:** Store findings, status history, vendor-history snapshots, and review notes in PostgreSQL.

Risk findings help prioritize human review. They do not automatically prove fraud or make an approval decision.

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS |
| API | Node.js, Express |
| Database | PostgreSQL on Neon |
| Authentication | bcryptjs, random session tokens, HTTP-only cookies |
| PDF text extraction | PDF.js |
| Image OCR | Tesseract.js |
| Tests | Node.js built-in test runner and API smoke tests |

## Project structure

- `frontend/` — Next.js web application
- `server/` — Express API, authentication, invoice routes, extraction and risk logic, tests

## Run locally

### 1. Configure the API

Create `server/.env` using `server/.env.example` as a template:

```env
DATABASE_URL=your_neon_postgres_connection_string
PORT=5000
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

Keep the real database URL private. The API initializes the user, session, and invoice tables when it starts.

### 2. Install and start the API

```bash
cd server
npm install
npm run server
```

### 3. Install and start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account, submit an invoice, and review its findings. When deploying the frontend separately, configure `NEXT_PUBLIC_API_URL` to point to the API origin.

## Tests

Run backend unit tests:

```bash
cd server
npm test
```

For API smoke tests, keep the API and database running and use a second terminal:

```bash
cd server
npm run smoke:api
npm run smoke:detail
```

Build the frontend:

```bash
cd frontend
npm run build
```

## Current limitations

- Extraction is best-effort and currently supports English OCR; extracted values should be checked before saving.
- Amount storage and high-value thresholds are USD-only. Full multi-currency support is not implemented.
- Uploaded document bytes are processed in memory and are not retained as a stored invoice file. The app stores the document name and extracted invoice metadata.
- Risk rules are starter heuristics. Thresholds and vendor-history comparisons are not a substitute for an organization's payment policy.
- No LLM-powered extraction or explanation, RAG retrieval, or automated accounting decision is currently implemented.

## Security notes

- Keep secrets in local environment files and never commit them.
- Rotate any real credentials that were ever exposed; deleting a key from the latest version does not remove it from Git history.
- Treat invoice documents and financial metadata as sensitive data when testing or deploying.
