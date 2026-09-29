import { Router } from "express";
import sql from "../configs/db.js";
import { requireAuth } from "../middlewares/auth.js";
import { assessInvoiceRisk } from "../lib/invoiceRisk.js";

const router = Router();
router.use(requireAuth);

export async function ensureInvoiceTables() {
  await sql`CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number TEXT,
    vendor TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    document_name TEXT,
    risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    status TEXT NOT NULL CHECK (status IN ('ready_for_review', 'needs_review', 'approved', 'rejected')),
    findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS invoices_user_created_idx ON invoices(user_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS invoices_user_number_idx ON invoices(user_id, invoice_number)`;
}

router.post("/", async (req, res) => {
  const vendor = typeof req.body.vendor === "string" ? req.body.vendor.trim() : "";
  const invoiceNumber = typeof req.body.invoiceNumber === "string" ? req.body.invoiceNumber.trim() : "";
  const documentName = typeof req.body.documentName === "string" ? req.body.documentName.trim() : "";
  const amount = Number(req.body.amount);

  if (vendor.length < 2 || vendor.length > 160) {
    return res.status(400).json({ message: "Vendor must be between 2 and 160 characters." });
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000000) {
    return res.status(400).json({ message: "Enter an invoice total greater than zero." });
  }
  if (invoiceNumber.length > 100 || documentName.length > 255) {
    return res.status(400).json({ message: "Invoice number or document name is too long." });
  }

  try {
    const [duplicate] = invoiceNumber
      ? await sql`SELECT id FROM invoices
          WHERE user_id = ${req.user.id} AND LOWER(invoice_number) = LOWER(${invoiceNumber})
          LIMIT 1`
      : [];
    const audit = assessInvoiceRisk({ amount, duplicateInvoiceNumber: Boolean(duplicate) });
    const [invoice] = await sql`INSERT INTO invoices
      (user_id, invoice_number, vendor, amount, document_name, risk_score, risk_level, status, findings)
      VALUES (
        ${req.user.id}, ${invoiceNumber || null}, ${vendor}, ${amount.toFixed(2)},
        ${documentName || null}, ${audit.riskScore}, ${audit.riskLevel}, ${audit.status},
        ${JSON.stringify(audit.findings)}::jsonb
      )
      RETURNING id, invoice_number AS "invoiceNumber", vendor, amount::text AS amount,
        document_name AS "documentName", risk_score AS "riskScore", risk_level AS "riskLevel",
        status, findings, created_at AS "createdAt"`;

    return res.status(201).json({ invoice });
  } catch (error) {
    console.error("Invoice audit failed:", error.message);
    return res.status(500).json({ message: "Could not save the invoice review." });
  }
});

router.get("/", async (req, res) => {
  try {
    const invoices = await sql`SELECT id, invoice_number AS "invoiceNumber", vendor,
        amount::text AS amount, document_name AS "documentName", risk_score AS "riskScore",
        risk_level AS "riskLevel", status, findings, created_at AS "createdAt"
      FROM invoices WHERE user_id = ${req.user.id}
      ORDER BY created_at DESC LIMIT 50`;
    return res.json({ invoices });
  } catch (error) {
    console.error("Invoice list failed:", error.message);
    return res.status(500).json({ message: "Could not load invoices." });
  }
});

export default router;