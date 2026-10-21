import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const METADATA_KEYWORDS = /(invoice|amount|total|balance|due|date|payment|bill|receipt|page|po\s*#|order)/i;
const CURRENCY = '(?:USD|EUR|GBP|CAD|AUD|LBP|[$€£¥])';
const AMOUNT = '([0-9][0-9,.]*(?:[0-9])?)';

export function extractInvoiceMetadata(text = '') {
  const normalizedText = String(text ?? '')
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .trim();

  if (!normalizedText) {
    return { vendor: '', invoiceNumber: '', amount: null };
  }

  const invoiceNumber = extractInvoiceNumber(normalizedText);
  const amount = extractInvoiceAmount(normalizedText);
  const vendor = extractVendorName(normalizedText);

  return {
    vendor,
    invoiceNumber,
    amount,
  };
}

export async function extractInvoiceFromFile(file) {
  if (!file) {
    return null;
  }

  const fileName = file.originalname || file.filename || 'invoice';
  const buffer = file.buffer || file.data || Buffer.alloc(0);
  const text = await extractTextFromBuffer(buffer, fileName);
  const metadata = extractInvoiceMetadata(text);

  return {
    ...metadata,
    documentName: fileName,
  };
}

async function extractTextFromBuffer(buffer, fileName) {
  const lowerName = String(fileName || '').toLowerCase();

  if (lowerName.endsWith('.pdf')) {
    return extractPdfText(buffer);
  }

  if (/\.(png|jpe?g|webp|bmp|gif)$/.test(lowerName)) {
    return extractImageText(buffer);
  }

  return '';
}

async function extractPdfText(buffer) {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str ?? '').join(' ');
    pages.push(text);
  }

  return pages.join('\n');
}

async function extractImageText(buffer) {
  const result = await Tesseract.recognize(buffer, 'eng');
  return result?.data?.text || '';
}

function extractVendorName(text) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/\t/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  for (const line of lines) {
    if (METADATA_KEYWORDS.test(line)) {
      continue;
    }

    const candidate = line
      .replace(/^[\W_]+|[\W_]+$/g, '')
      .replace(/\s*[:#-]\s*$/g, '');

    if (!candidate || candidate.length < 3 || candidate.length > 120) {
      continue;
    }

    if (/(^\$|\d)/.test(candidate)) {
      continue;
    }

    if (candidate.toLowerCase().includes('invoice')) {
      continue;
    }

    return candidate;
  }

  const fallback = lines.find((line) => !/invoice|total|amount|due|date|payment|balance/i.test(line));
  return fallback ? fallback.replace(/^[\W_]+|[\W_]+$/g, '') : '';
}

function extractInvoiceNumber(text) {
  const patterns = [
    /(?:invoice|inv(?:oice)?|ref(?:erence)?|po(?:\s*#)?|document)\s*(?:no|number|#)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{2,})/i,
    /(?:invoice|inv(?:oice)?)\s+([A-Z0-9][A-Z0-9-]{2,})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  const genericMatch = text.match(/\b[A-Z]{2,}-\d{3,}\b|\b\d{5,}\b/i);
  return genericMatch ? genericMatch[0].trim() : '';
}

function parseAmount(value) {
  let normalized = value.replace(/\s/g, '');

  if (normalized.includes(',') && normalized.includes('.')) {
    // The last separator is treated as the decimal separator.
    const decimalSeparator = normalized.lastIndexOf(',') > normalized.lastIndexOf('.') ? ',' : '.';
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
    normalized = normalized.split(thousandsSeparator).join('');
    normalized = normalized.replace(decimalSeparator, '.');
  } else if (normalized.includes(',')) {
    const decimals = normalized.length - normalized.lastIndexOf(',') - 1;
    normalized = decimals === 1 || decimals === 2
      ? normalized.replace(',', '.')
      : normalized.replace(/,/g, '');
  }

  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

function extractInvoiceAmount(text) {
  // Prefer final payable totals before less-specific amount labels.
  const labels = [
    'grand\\s+total',
    'invoice\\s+total',
    'total\\s+due',
    'amount\\s+due',
    'balance\\s+due',
    'total',
    'amount',
  ];

  for (const label of labels) {
    const pattern = new RegExp(
      `\\b${label}\\b\\s*[:=\\-]?\\s*(?:${CURRENCY}\\s*)?${AMOUNT}(?:\\s*${CURRENCY})?`,
      'i',
    );
    const match = text.match(pattern);
    if (match?.[1]) {
      const amount = parseAmount(match[1]);
      if (amount !== null) return amount;
    }
  }

  // Fallback only when a currency marker makes the number identifiable as money.
  const currencyPattern = new RegExp(
    `(?:${CURRENCY}\\s*)${AMOUNT}(?:\\s*${CURRENCY})?`,
    'i',
  );
  const currencyMatch = text.match(currencyPattern);
  return currencyMatch?.[1] ? parseAmount(currencyMatch[1]) : null;
}
