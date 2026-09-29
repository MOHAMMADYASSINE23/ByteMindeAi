"use client";

import Link from "next/link";
import { useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { createInvoiceReview, InvoiceReview } from "../../lib/invoices";

export default function NewReviewPage() {
  const [fileName, setFileName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [review, setReview] = useState<InvoiceReview | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = await createInvoiceReview({ invoiceNumber, vendor, amount, documentName: fileName });
      setReview(result.invoice);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not run the invoice review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-100 px-6 py-8 md:px-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Back to dashboard
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">New review</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Audit an invoice</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Upload an invoice and add the basic details your finance team needs for a first risk check.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="invoice" className="mb-2 block text-sm font-medium text-slate-700">
                  Invoice document
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">
                  <span className="text-sm font-semibold text-slate-800">Choose PDF or image</span>
                  <span className="mt-1 text-xs text-slate-500">File content is not uploaded yet</span>
                  <span className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-indigo-600 shadow-sm">
                    {fileName || "Browse files"}
                  </span>
                  <input
                    id="invoice"
                    type="file"
                    accept="application/pdf,image/*"
                    className="sr-only"
                    onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
                  />
                </label>
                <p className="mt-2 text-xs text-slate-500">Document storage is not connected yet; this records the selected filename only.</p>
              </div>

              <div>
                <label htmlFor="invoiceNumber" className="mb-2 block text-sm font-medium text-slate-700">Invoice number <span className="font-normal text-slate-500">(optional)</span></label>
                <input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  placeholder="INV-2026-1042"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="vendor" className="mb-2 block text-sm font-medium text-slate-700">Vendor</label>
                <input
                  id="vendor"
                  value={vendor}
                  onChange={(event) => setVendor(event.target.value)}
                  placeholder="ABC Supplies"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-indigo-400 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="amount" className="mb-2 block text-sm font-medium text-slate-700">Invoice total</label>
                <div className="flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white">
                  <span className="flex items-center border-r border-slate-200 px-3 text-sm text-slate-500">USD</span>
                  <input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="935.00"
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none"
                    required
                  />
                </div>
              </div>

              {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}

              <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60">
                {isSubmitting ? "Running review..." : "Run audit"}
              </button>
            </form>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm md:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">Audit checks</p>
            <h2 className="mt-3 text-xl font-semibold">What happens next?</h2>
            <div className="mt-6 space-y-5">
              {[
                ["01", "Extract fields", "Read vendor, totals, dates, and line items from the document."],
                ["02", "Check for risk", "Compare pricing, duplicates, and policy thresholds."],
                ["03", "Send for review", "Give your team a clear explanation and approval decision."],
              ].map(([number, title, description]) => (
                <div key={number} className="flex gap-3">
                  <span className="text-sm font-bold text-indigo-300">{number}</span>
                  <div>
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-5 text-slate-300">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {review && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">Audit result</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{review.status === "needs_review" ? "Manual review recommended" : "No configured checks were triggered"}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {review.vendor} · Invoice {review.invoiceNumber || "number not provided"} · ${Number(review.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 px-5 py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">Risk score</p>
                <p className="mt-1 text-3xl font-bold text-amber-900">{review.riskScore}/100</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {review.findings.map((finding) => (
                <div key={finding.code} className={`rounded-xl border p-4 ${finding.severity === "high" ? "border-rose-200 bg-rose-50" : finding.severity === "medium" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
                  <p className="text-sm font-semibold text-slate-900">{finding.code.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-slate-700">{finding.message}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                View saved reviews
              </Link>
            </div>
          </div>
        )}
      </div>
      </main>
    </ProtectedRoute>
  );
}
