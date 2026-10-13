import { apiRequest } from "./api";

export interface InvoiceFinding {
  code: string;
  severity: "low" | "medium" | "high";
  message: string;
}

export interface InvoiceReview {
  id: string;
  invoiceNumber: string | null;
  vendor: string;
  amount: string;
  documentName: string | null;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  status: "ready_for_review" | "needs_review" | "approved" | "rejected";
  findings: InvoiceFinding[];
  createdAt: string;
}

export async function createInvoiceReview(input: {
  invoiceNumber: string;
  vendor: string;
  amount: string;
  documentName: string;
}) {
  return apiRequest<{ invoice: InvoiceReview }>("/api/invoices", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getInvoiceReviews() {
  return apiRequest<{ invoices: InvoiceReview[] }>("/api/invoices");
}
export async function getInvoiceReview(id: string) {
  return apiRequest<{ invoice: InvoiceReview }>(`/api/invoices/${id}`);
}

export async function updateInvoiceStatus(id: string, status: InvoiceReview["status"]) {
  return apiRequest<{ invoice: InvoiceReview }>(`/api/invoices/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}