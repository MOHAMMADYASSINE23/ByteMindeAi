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
  statusHistory?: Array<{ status: string; changedAt: string }>;
  vendorHistory?: Array<{ count: number; averageAmount: number; maxAmount: number; checkedAt?: string }> | null;
  reviewNotes?: Array<{ note: string; author: string; email: string; createdAt: string }>;
  createdAt: string;
}

export async function createInvoiceReview(input: {
  invoiceNumber: string;
  vendor: string;
  amount: string;
  documentName: string;
  file?: File | null;
}) {
  if (input.file) {
    const formData = new FormData();
    formData.append('invoiceNumber', input.invoiceNumber);
    formData.append('vendor', input.vendor);
    formData.append('amount', input.amount);
    formData.append('documentName', input.documentName);
    formData.append('invoiceFile', input.file);

    return apiRequest<{ invoice: InvoiceReview }>('/api/invoices', {
      method: 'POST',
      body: formData,
    });
  }

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

export async function addInvoiceNote(id: string, note: string) {
  return apiRequest<{ invoice: InvoiceReview }>(`/api/invoices/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}