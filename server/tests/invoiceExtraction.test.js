import test from 'node:test';
import assert from 'node:assert/strict';
import { extractInvoiceMetadata, formatPdfTextItems } from '../lib/invoiceExtraction.js';

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

test('prefers grand total over subtotal and tax', () => {
  const text = `Northwind Supply Co
Invoice # INV-2048
Subtotal: $900.00
Tax: $90.00
Grand Total: $990.00`;

  const result = extractInvoiceMetadata(text);

  assert.equal(result.amount, 990);
});

test('prefers amount due when multiple total-like values exist', () => {
  const text = `ACME INDUSTRIES
Invoice Number: ACME-2048
Subtotal: $1,200.00
Total: $1,260.00
Amount Due: $1,260.00`;

  const result = extractInvoiceMetadata(text);

  assert.equal(result.amount, 1260);
});

test('returns null when no labeled or currency amount exists', () => {
  const result = extractInvoiceMetadata('Northwind Supply Co\nInvoice # INV-2048');

  assert.equal(result.amount, null);
});

test('extracts an amount labeled with a currency code', () => {
  const result = extractInvoiceMetadata('ACME INDUSTRIES\nGrand Total: EUR 1,250.50');

  assert.equal(result.amount, 1250.5);
});

test('extracts European-style amounts with a decimal comma', () => {
  const result = extractInvoiceMetadata('ACME INDUSTRIES\nTotal Due: 1.250,75 EUR');

  assert.equal(result.amount, 1250.75);
});

test('extracts currency symbols after the amount', () => {
  const result = extractInvoiceMetadata('ACME INDUSTRIES\nAmount Due: 2,420.75 €');

  assert.equal(result.amount, 2420.75);
});

test('supports currency-only fallback when no total label is present', () => {
  const result = extractInvoiceMetadata('ACME INDUSTRIES\nInvoice # ACME-2048\nEUR 850,00');

  assert.equal(result.amount, 850);
});


test('keeps PDF text items on separate lines based on their vertical positions', () => {
  const text = formatPdfTextItems([
    { str: 'Northwind', transform: [1, 0, 0, 1, 40, 700] },
    { str: 'Supply Co', transform: [1, 0, 0, 1, 110, 700] },
    { str: 'Invoice #', transform: [1, 0, 0, 1, 40, 675] },
    { str: 'INV-2048', transform: [1, 0, 0, 1, 100, 675] },
    { str: 'Grand Total: $990.00', transform: [1, 0, 0, 1, 40, 640] },
  ]);

  assert.equal(text, 'Northwind Supply Co\\nInvoice # INV-2048\\nGrand Total: $990.00');

  const result = extractInvoiceMetadata(text);
  assert.equal(result.vendor, 'Northwind Supply Co');
  assert.equal(result.invoiceNumber, 'INV-2048');
  assert.equal(result.amount, 990);
});
