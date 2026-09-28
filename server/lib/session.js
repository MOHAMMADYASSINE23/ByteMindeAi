import { createHash } from "node:crypto";

export const SESSION_COOKIE = "invoice_auditor_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export const hashToken = (token) => createHash("sha256").update(token).digest("hex");
