import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import "dotenv/config";
import sql from "../configs/db.js";

const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
const email = `invoice-smoke-${randomUUID()}@example.invalid`;
const invoiceNumber = `SMOKE-${randomUUID()}`;
let cookie;

try {
  const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Invoice Smoke Test", email, password: "smoke-test-password-123" }),
  });
  assert.equal(signupResponse.status, 201, "signup should create a temporary user");
  cookie = signupResponse.headers.getSetCookie()[0].split(";")[0];
  assert.ok(cookie, "signup should issue the session cookie");

  const headers = { "content-type": "application/json", cookie };
  const invoiceInput = { invoiceNumber, vendor: "Smoke Test Vendor", amount: "6500", documentName: "smoke.pdf" };
  const firstResponse = await fetch(`${baseUrl}/api/invoices`, {
    method: "POST",
    headers,
    body: JSON.stringify(invoiceInput),
  });
  const first = await firstResponse.json();
  assert.equal(firstResponse.status, 201);
  assert.equal(first.invoice.riskScore, 30);
  assert.equal(first.invoice.riskLevel, "medium");

  const duplicateResponse = await fetch(`${baseUrl}/api/invoices`, {
    method: "POST",
    headers,
    body: JSON.stringify(invoiceInput),
  });
  const duplicate = await duplicateResponse.json();
  assert.equal(duplicateResponse.status, 201);
  assert.equal(duplicate.invoice.riskScore, 100);
  assert.equal(duplicate.invoice.riskLevel, "high");
  assert.ok(duplicate.invoice.findings.some((finding) => finding.code === "POSSIBLE_DUPLICATE"));

  const listResponse = await fetch(`${baseUrl}/api/invoices`, { headers: { cookie } });
  const list = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.equal(list.invoices.length, 2);

  const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST", headers: { cookie } });
  assert.equal(logoutResponse.status, 204);
  const protectedResponse = await fetch(`${baseUrl}/api/invoices`, { headers: { cookie } });
  assert.equal(protectedResponse.status, 401);

  console.log("Invoice API smoke test passed: signup, session, audit, duplicate check, listing, logout.");
} finally {
  await sql`DELETE FROM users WHERE email = ${email}`;
}
