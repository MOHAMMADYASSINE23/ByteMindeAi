import test from "node:test";
import assert from "node:assert/strict";
import { assessInvoiceRisk } from "../lib/invoiceRisk.js";

test("a low-value invoice with no duplicate stays low risk", () => {
  const result = assessInvoiceRisk({ amount: 4999.99, duplicateInvoiceNumber: false });
  assert.equal(result.riskScore, 0);
  assert.equal(result.riskLevel, "low");
  assert.equal(result.status, "ready_for_review");
});

test("an elevated-value invoice is marked for review", () => {
  const result = assessInvoiceRisk({ amount: 5000, duplicateInvoiceNumber: false });
  assert.equal(result.riskScore, 30);
  assert.equal(result.riskLevel, "medium");
  assert.equal(result.status, "needs_review");
});

test("a high-value invoice is marked for manual review", () => {
  const result = assessInvoiceRisk({ amount: 10000, duplicateInvoiceNumber: false });
  assert.equal(result.riskScore, 35);
  assert.equal(result.riskLevel, "medium");
  assert.equal(result.status, "needs_review");
});

test("duplicate invoices receive a high risk score capped at 100", () => {
  const result = assessInvoiceRisk({ amount: 10000, duplicateInvoiceNumber: true });
  assert.equal(result.riskScore, 100);
  assert.equal(result.riskLevel, "high");
  assert.equal(result.status, "needs_review");
  assert.deepEqual(result.findings.map((finding) => finding.code), ["POSSIBLE_DUPLICATE", "HIGH_VALUE"]);
});

test("vendor history outliers are flagged when the invoice is much higher than typical spend", () => {
  const result = assessInvoiceRisk({
    amount: 18000,
    duplicateInvoiceNumber: false,
    vendorHistory: {
      count: 4,
      averageAmount: 5200,
      maxAmount: 6500,
    },
  });

  assert.equal(result.riskScore, 100);
  assert.equal(result.riskLevel, "high");
  assert.deepEqual(result.findings.map((finding) => finding.code), ["VENDOR_HISTORY_OUTLIER"]);
});