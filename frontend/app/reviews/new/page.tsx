"use client";

import Link from "next/link";
import { useState } from "react";

export default function NewReviewPage() {
  const [fileName, setFileName] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
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
                  <span className="mt-1 text-xs text-slate-500">Maximum 10 MB</span>
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

              <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                Run audit
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

        {submitted && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <p className="font-semibold">Review queued for analysis.</p>
            <p className="mt-1 text-sm">The next step will connect this form to document extraction and risk scoring.</p>
          </div>
        )}
      </div>
    </main>
  );
}
