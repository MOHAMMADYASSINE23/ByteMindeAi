import test from "node:test";
import assert from "node:assert/strict";
import { isSupportedInvoiceUpload } from "../lib/uploadValidation.js";

test("accepts supported invoice file types when extension and MIME type match", () => {
  for (const file of [
    { originalname: "invoice.pdf", mimetype: "application/pdf" },
    { originalname: "invoice.png", mimetype: "image/png" },
    { originalname: "invoice.JPG", mimetype: "image/jpeg" },
    { originalname: "invoice.webp", mimetype: "image/webp" },
  ]) {
    assert.equal(isSupportedInvoiceUpload(file), true);
  }
});

test("rejects unsupported file extensions", () => {
  assert.equal(isSupportedInvoiceUpload({ originalname: "invoice.svg", mimetype: "image/svg+xml" }), false);
  assert.equal(isSupportedInvoiceUpload({ originalname: "invoice.exe", mimetype: "application/octet-stream" }), false);
});

test("rejects mismatched extensions and MIME types", () => {
  assert.equal(isSupportedInvoiceUpload({ originalname: "invoice.pdf", mimetype: "image/png" }), false);
  assert.equal(isSupportedInvoiceUpload({ originalname: "invoice.png", mimetype: "application/pdf" }), false);
});

test("rejects missing upload metadata", () => {
  assert.equal(isSupportedInvoiceUpload(null), false);
  assert.equal(isSupportedInvoiceUpload({ originalname: "invoice.pdf" }), false);
});
