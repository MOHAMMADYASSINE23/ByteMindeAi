import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import "dotenv/config";
import sql from "../configs/db.js";

const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
const email = `invoice-detail-${randomUUID()}@example.invalid`;
const otherEmail = `invoice-detail-other-${randomUUID()}@example.invalid`;
const invoiceNumber = `DETAIL-${randomUUID()}`;
let cookie;
let otherCookie;

async function createTestUser(userEmail) {
  const response = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Detail Test User", email: userEmail, password: "detail-test-password-123" }),
  });
  assert.equal(response.status, 201, "signup should create a temporary user");
  return response.headers.getSetCookie()[0].split(";")[0];
}

try {
  cookie = await createTestUser(email);
  otherCookie = await createTestUser(otherEmail);
  assert.ok(cookie, "signup should issue the session cookie");
  assert.ok(otherCookie, "second signup should issue a session cookie");

  const headers = { "content-type": "application/json", cookie };
  const createResponse = await fetch(`${baseUrl}/api/invoices`, {
    method: "POST",
    headers,
    body: JSON.stringify({ invoiceNumber, vendor: "Detail Vendor", amount: "4200", documentName: "detail.pdf" }),
  });
  const created = await createResponse.json();
  assert.equal(createResponse.status, 201, "invoice creation should succeed");

  const detailUrl = `${baseUrl}/api/invoices/${created.invoice.id}`;
  const detailResponse = await fetch(detailUrl, { headers: { cookie } });
  const detail = await detailResponse.json();
  assert.equal(detailResponse.status, 200, "invoice detail should load");
  assert.equal(detail.invoice.vendor, "Detail Vendor");
  assert.equal(detail.invoice.riskLevel, "low");

  const foreignDetailResponse = await fetch(detailUrl, { headers: { cookie: otherCookie } });
  assert.equal(foreignDetailResponse.status, 404, "users must not access another user's invoice");

  const invalidStatusResponse = await fetch(`${detailUrl}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status: "paid" }),
  });
  assert.equal(invalidStatusResponse.status, 400, "unsupported statuses should be rejected");

  const updateResponse = await fetch(`${detailUrl}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status: "approved" }),
  });
  const updated = await updateResponse.json();
  assert.equal(updateResponse.status, 200, "status update should succeed");
  assert.equal(updated.invoice.status, "approved");

  console.log("Invoice detail smoke test passed: ownership, detail, validation, and status update.");
} finally {
  await sql`DELETE FROM users WHERE email IN (${email}, ${otherEmail})`;
}