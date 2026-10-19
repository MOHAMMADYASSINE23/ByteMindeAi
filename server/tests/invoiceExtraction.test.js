import test from 'node:test';
import assert from 'node:assert/strict';
import { extractInvoiceMetadata } from '../lib/invoiceExtraction.js';

test('extracts vendor, invoice number, and amount from invoice text', () => {
  const text = `Northwind Supply Co
Invoice # INV-2048
Due: 2026-10-10
Total $12,450.00`;

  const result = extractInvoiceMetadata(text);

  assert.equal(result.vendor, 'Northwind Supply Co');
  assert.equal(result.invoiceNumber, 'INV-2048');
  assert.equal(result.amount, 12450);
});

test('falls back to a clean vendor name when the first line is a heading', () => {
  const text = `ACME INDUSTRIES\nInvoice Number: 84591\nAmount Due: $2,420.75`;

  const result = extractInvoiceMetadata(text);

  assert.equal(result.vendor, 'ACME INDUSTRIES');
  assert.equal(result.invoiceNumber, '84591');
  assert.equal(result.amount, 2420.75);
});
