import { Router } from "express";
import multer from "multer";
import sql from "../configs/db.js";
import { requireAuth } from "../middlewares/auth.js";
import { assessInvoiceRisk } from "../lib/invoiceRisk.js";
import { extractInvoiceFromFile } from "../lib/invoiceExtraction.js";
import { isSupportedInvoiceUpload } from "../lib/uploadValidation.js";
import { resolveInvoiceAmount } from "../lib/invoiceAmount.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (isSupportedInvoiceUpload(file)) {
      callback(null, true);
      return;
    }

    callback(new Error("Upload a PDF, PNG, JPG, WEBP, BMP, or GIF file with a matching file type."));
  },
});

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
    status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    vendor_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    review_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status_history JSONB NOT NULL DEFAULT '[]'::jsonb`;
  await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vendor_history JSONB NOT NULL DEFAULT '[]'::jsonb`;
  await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS review_notes JSONB NOT NULL DEFAULT '[]'::jsonb`;
  await sql`CREATE INDEX IF NOT EXISTS invoices_user_created_idx ON invoices(user_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS invoices_user_number_idx ON invoices(user_id, invoice_number)`;
}

router.post("/", upload.single("invoiceFile"), async (req, res) => {
  const extractedData = req.file ? await extractInvoiceFromFile(req.file).catch(() => null) : null;
  const vendorInput = typeof req.body.vendor === "string" ? req.body.vendor.trim() : "";
  const invoiceNumberInput = typeof req.body.invoiceNumber === "string" ? req.body.invoiceNumber.trim() : "";
  const documentNameInput = typeof req.body.documentName === "string" ? req.body.documentName.trim() : "";
  const vendor = vendorInput || extractedData?.vendor || "";
  const invoiceNumber = invoiceNumberInput || extractedData?.invoiceNumber || "";
  const documentName = documentNameInput || extractedData?.documentName || req.file?.originalname || "";
  const extractedAmount = resolveInvoiceAmount(req.body.amount, extractedData?.amount);

  if (vendor.length < 2 || vendor.length > 160) {
    return res.status(400).json({ message: "Vendor must be between 2 and 160 characters." });
  }
  if (!Number.isFinite(extractedAmount) || extractedAmount <= 0 || extractedAmount > 1000000000) {
    return res.status(400).json({ message: "Enter an invoice total greater than zero." });
  }
  if (invoiceNumber.length > 100 || documentName.length > 255) {
    return res.status(400).json({ message: "Invoice number or document name is too long." });
  }

  try {
    const vendorHistoryRows = await sql`SELECT amount::numeric AS amount
      FROM invoices WHERE user_id = ${req.user.id} AND LOWER(vendor) = LOWER(${vendor})
      ORDER BY created_at DESC LIMIT 10`;
    const previousAmounts = vendorHistoryRows.map((entry) => Number(entry.amount));
    const averageAmount = previousAmounts.length
      ? previousAmounts.reduce((sum, value) => sum + value, 0) / previousAmounts.length
      : 0;
    const maxAmount = previousAmounts.length ? Math.max(...previousAmounts) : 0;
    const vendorHistory = previousAmounts.length > 0 ? {
      count: previousAmounts.length,
      averageAmount,
      maxAmount,
    } : null;

    const [duplicate] = invoiceNumber
      ? await sql`SELECT id FROM invoices
          WHERE user_id = ${req.user.id} AND LOWER(invoice_number) = LOWER(${invoiceNumber})
          LIMIT 1`
      : [];
    const audit = assessInvoiceRisk({ amount: extractedAmount, duplicateInvoiceNumber: Boolean(duplicate), vendorHistory });
    const [invoice] = await sql`INSERT INTO invoices
      (user_id, invoice_number, vendor, amount, document_name, risk_score, risk_level, status, findings, status_history, vendor_history)
      VALUES (
        ${req.user.id}, ${invoiceNumber || null}, ${vendor}, ${extractedAmount.toFixed(2)},
        ${documentName || null}, ${audit.riskScore}, ${audit.riskLevel}, ${audit.status},
        ${JSON.stringify(audit.findings)}::jsonb,
        ${JSON.stringify([{ status: audit.status, changedAt: new Date().toISOString() }])}::jsonb,
        ${JSON.stringify(vendorHistory ? [{ count: vendorHistory.count, averageAmount: vendorHistory.averageAmount, maxAmount: vendorHistory.maxAmount, checkedAt: new Date().toISOString() }] : [])}::jsonb
      )
      RETURNING id, invoice_number AS "invoiceNumber", vendor, amount::text AS amount,
        document_name AS "documentName", risk_score AS "riskScore", risk_level AS "riskLevel",
        status, findings, status_history AS "statusHistory", vendor_history AS "vendorHistory",
        review_notes AS "reviewNotes",
        created_at AS "createdAt"`;

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
        risk_level AS "riskLevel", status, findings, status_history AS "statusHistory",
        vendor_history AS "vendorHistory", review_notes AS "reviewNotes", created_at AS "createdAt"
      FROM invoices WHERE user_id = ${req.user.id}
      ORDER BY created_at DESC LIMIT 50`;
    return res.json({ invoices });
  } catch (error) {
    console.error("Invoice list failed:", error.message);
    return res.status(500).json({ message: "Could not load invoices." });
  }
});

router.get("/:id", async (req, res) => {
  const invoiceId = Number(req.params.id);

  if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
    return res.status(400).json({ message: "Invoice id is invalid." });
  }

  try {
    const [invoice] = await sql`SELECT id, invoice_number AS "invoiceNumber", vendor,
        amount::text AS amount, document_name AS "documentName", risk_score AS "riskScore",
        risk_level AS "riskLevel", status, findings, status_history AS "statusHistory",
        vendor_history AS "vendorHistory", review_notes AS "reviewNotes", created_at AS "createdAt"
      FROM invoices WHERE id = ${invoiceId} AND user_id = ${req.user.id}`;

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    return res.json({ invoice });
  } catch (error) {
    console.error("Invoice detail failed:", error.message);
    return res.status(500).json({ message: "Could not load the invoice." });
  }
});

router.post("/:id/notes", async (req, res) => {
  const invoiceId = Number(req.params.id);
  const note = typeof req.body.note === "string" ? req.body.note.trim() : "";

  if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
    return res.status(400).json({ message: "Invoice id is invalid." });
  }
  if (!note || note.length > 2000) {
    return res.status(400).json({ message: "A note is required and must be 2,000 characters or fewer." });
  }

  try {
    const entry = {
      note,
      author: req.user.name,
      email: req.user.email,
      createdAt: new Date().toISOString(),
    };
    const [invoice] = await sql`UPDATE invoices
      SET review_notes = COALESCE(review_notes, '[]'::jsonb) || ${JSON.stringify([entry])}::jsonb
      WHERE id = ${invoiceId} AND user_id = ${req.user.id}
      RETURNING id, invoice_number AS "invoiceNumber", vendor, amount::text AS amount,
        document_name AS "documentName", risk_score AS "riskScore", risk_level AS "riskLevel",
        status, findings, status_history AS "statusHistory", vendor_history AS "vendorHistory",
        review_notes AS "reviewNotes", created_at AS "createdAt"`;

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    return res.status(201).json({ invoice });
  } catch (error) {
    console.error("Invoice note save failed:", error.message);
    return res.status(500).json({ message: "Could not save the review note." });
  }
});

router.patch("/:id/status", async (req, res) => {
  const invoiceId = Number(req.params.id);
  const allowedStatuses = ["ready_for_review", "needs_review", "approved", "rejected"];
  const nextStatus = typeof req.body.status === "string" ? req.body.status.trim() : "";

  if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
    return res.status(400).json({ message: "Invoice id is invalid." });
  }
  if (!allowedStatuses.includes(nextStatus)) {
    return res.status(400).json({ message: "Status is not valid." });
  }

  try {
    const [existingInvoice] = await sql`SELECT status_history AS "statusHistory" FROM invoices
      WHERE id = ${invoiceId} AND user_id = ${req.user.id}`;
    const nextHistory = Array.isArray(existingInvoice?.statusHistory) ? existingInvoice.statusHistory : [];
    const updatedHistory = [...nextHistory, { status: nextStatus, changedAt: new Date().toISOString() }];

    const [invoice] = await sql`UPDATE invoices
      SET status = ${nextStatus}, status_history = ${JSON.stringify(updatedHistory)}::jsonb
      WHERE id = ${invoiceId} AND user_id = ${req.user.id}
      RETURNING id, invoice_number AS "invoiceNumber", vendor,
        amount::text AS amount, document_name AS "documentName", risk_score AS "riskScore",
        risk_level AS "riskLevel", status, findings, status_history AS "statusHistory",
        vendor_history AS "vendorHistory", review_notes AS "reviewNotes", created_at AS "createdAt"`;

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    return res.json({ invoice });
  } catch (error) {
    console.error("Invoice status update failed:", error.message);
    return res.status(500).json({ message: "Could not update the invoice status." });
  }
});

// Convert upload validation failures into clear client errors instead of generic server errors.
router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "The invoice file must be 10 MB or smaller."
      : "The uploaded file could not be accepted.";
    return res.status(status).json({ message, code: error.code });
  }

  if (error.message?.startsWith("Upload a PDF,")) {
    return res.status(400).json({ message: error.message });
  }

  return next(error);
});

export default router;