import test from "node:test";
import assert from "node:assert/strict";
import { resolveInvoiceAmount } from "../lib/invoiceAmount.js";

test("uses a manually entered amount when valid", () => {
  assert.equal(resolveInvoiceAmount("125.50", 99), 125.5);
});

test("falls back to the extracted amount when manual input is blank", () => {
  assert.equal(resolveInvoiceAmount("", 125.5), 125.5);
  assert.equal(resolveInvoiceAmount("   ", 125.5), 125.5);
});

test("falls back to the extracted amount when manual input is invalid", () => {
  assert.equal(resolveInvoiceAmount("not-a-number", 125.5), 125.5);
});

test("returns NaN when neither manual nor extracted amount is valid", () => {
  assert.equal(Number.isNaN(resolveInvoiceAmount("", null)), true);
  assert.equal(Number.isNaN(resolveInvoiceAmount("invalid", Number.NaN)), true);
});

test("preserves zero as explicit manual input for route-level validation", () => {
  assert.equal(resolveInvoiceAmount("0", 125.5), 0);
});
