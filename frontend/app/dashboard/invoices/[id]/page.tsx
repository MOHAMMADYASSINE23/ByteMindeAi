"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { getInvoiceReview, InvoiceReview, updateInvoiceStatus } from "../../../lib/invoices";

const statusStyles: Record<InvoiceReview["status"], string> = {
  ready_for_review: "bg-slate-100 text-slate-700",
  needs_review: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

const riskStyles: Record<InvoiceReview["riskLevel"], string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
};

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadInvoice() {
      setLoading(true);
      setError("");

      try {
        const { invoice: loadedInvoice } = await getInvoiceReview(params.id);
        if (isCurrent) setInvoice(loadedInvoice);
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError instanceof Error ? requestError.message : "Could not load the invoice.");
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    if (params.id) loadInvoice();
    return () => {
      isCurrent = false;
    };
  }, [params.id]);

  const handleStatusUpdate = async (status: InvoiceReview["status"]) => {
    if (!invoice) return;

    setIsUpdating(true);
    try {
      const { invoice: updatedInvoice } = await updateInvoiceStatus(invoice.id, status);
      setInvoice(updatedInvoice);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update the invoice status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-100 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Back to dashboard
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
              Loading invoice details...
            </div>
          ) : error && !invoice ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
              {error}
            </div>
          ) : invoice ? (
            <div className="space-y-6">
              {error && (
                <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {error}
                </p>
              )}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Invoice detail</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                      {invoice.invoiceNumber || `Invoice #${invoice.id}`}
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">{invoice.vendor}</p>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskStyles[invoice.riskLevel]}`}>
                      {invoice.riskLevel} risk
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[invoice.status]}`}>
                      {invoice.status.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Amount</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      ${Number(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Risk score</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{invoice.riskScore}/100</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Document</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">{invoice.documentName || "No document name"}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Submitted</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">{new Date(invoice.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Review actions</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">Decision workflow</h2>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusUpdate("approved")}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusUpdate("rejected")}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusUpdate("needs_review")}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                    >
                      Escalate
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Findings</p>
                <div className="mt-5 space-y-3">
                  {invoice.findings.map((finding) => (
                    <div
                      key={finding.code}
                      className={`rounded-xl border p-4 ${
                        finding.severity === "high"
                          ? "border-rose-200 bg-rose-50"
                          : finding.severity === "medium"
                            ? "border-amber-200 bg-amber-50"
                            : "border-emerald-200 bg-emerald-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">{finding.code.replaceAll("_", " ")}</p>
                        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                          {finding.severity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{finding.message}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
