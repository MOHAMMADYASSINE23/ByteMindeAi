"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { clearSession, getSession } from "../lib/auth";
import type { SessionUser } from "../lib/auth";
import { getInvoiceReviews, InvoiceReview } from "../lib/invoices";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [invoices, setInvoices] = useState<InvoiceReview[]>([]);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<"all" | "needs_review" | "high_risk">("all");

  useEffect(() => {
    getSession().then(setUser);
    getInvoiceReviews()
      .then(({ invoices: userInvoices }) => setInvoices(userInvoices))
      .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : "Could not load reviews."));
  }, []);

  const handleLogout = async () => {
    await clearSession();
    router.replace("/login");
  };

  const priorityInvoices = invoices.filter((invoice) => invoice.status === "needs_review");
  const highRiskCount = invoices.filter((invoice) => invoice.riskLevel === "high").length;

  const visibleInvoices =
    filter === "needs_review"
      ? invoices.filter((invoice) => invoice.status === "needs_review")
      : filter === "high_risk"
        ? invoices.filter((invoice) => invoice.riskLevel === "high")
        : invoices;

  const stats = [
    { label: "Total invoices", value: String(invoices.length), tone: "bg-indigo-50 text-indigo-700" },
    { label: "Needs review", value: String(priorityInvoices.length), tone: "bg-amber-50 text-amber-700" },
    { label: "High risk", value: String(highRiskCount), tone: "bg-rose-50 text-rose-700" },
    { label: "Ready for review", value: String(invoices.filter((invoice) => invoice.status === "ready_for_review").length), tone: "bg-emerald-50 text-emerald-700" },
  ];

  const getRiskTone = (riskLevel: InvoiceReview["riskLevel"]) => {
    if (riskLevel === "high") return "bg-rose-100 text-rose-700";
    if (riskLevel === "medium") return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  };

  const getStatusText = (status: InvoiceReview["status"]) => {
    if (status === "needs_review") return "Needs review";
    if (status === "ready_for_review") return "Ready";
    if (status === "approved") return "Approved";
    return "Rejected";
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Finance overview
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Signed in as {user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/reviews/new" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              New review
            </Link>
            <button onClick={handleLogout} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Log out
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold ${item.tone}`}>
                {item.label}
              </div>
              <p className="mt-5 text-3xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent invoice reviews</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "needs_review", label: "Needs review" },
                  { key: "high_risk", label: "High risk" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key as typeof filter)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      filter === tab.key
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Vendor</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <Link href={`/dashboard/invoices/${invoice.id}`} className="text-indigo-600 hover:text-indigo-500">
                          {invoice.invoiceNumber || `#${invoice.id}`}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{invoice.vendor}</td>
                      <td className="px-4 py-3 text-slate-600">${Number(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getRiskTone(invoice.riskLevel)}`}>
                          {invoice.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {loadError && <p role="alert" className="mt-3 text-sm text-rose-700">{loadError}</p>}
            {!loadError && visibleInvoices.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No matching invoices in this view.</p>}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Priority reviews</h2>
            <div className="mt-4 space-y-3">
              {priorityInvoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-amber-900">{invoice.invoiceNumber || `Invoice #${invoice.id}`} · {invoice.vendor}</p>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${getRiskTone(invoice.riskLevel)}`}>
                      {invoice.riskLevel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-amber-800">Risk score {invoice.riskScore}/100. {invoice.findings[0]?.message}</p>
                </div>
              ))}
              {priorityInvoices.length === 0 && <p className="text-sm text-slate-500">No invoices currently require manual review.</p>}
            </div>
          </div>
        </section>
      </div>
      </main>
    </ProtectedRoute>
  );
}
