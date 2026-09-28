"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { clearSession, getSession } from "../lib/auth";
import type { SessionUser } from "../lib/auth";

const stats = [
  { label: "Total invoices", value: "1,284", tone: "bg-indigo-50 text-indigo-700" },
  { label: "Pending review", value: "18", tone: "bg-amber-50 text-amber-700" },
  { label: "High risk", value: "7", tone: "bg-rose-50 text-rose-700" },
  { label: "Approved", value: "94%", tone: "bg-emerald-50 text-emerald-700" },
];

const recentInvoices = [
  { id: "INV-10482", vendor: "ABC Supplies", amount: "$935", risk: "High" },
  { id: "INV-10491", vendor: "XYZ Electronics", amount: "$1,240", risk: "Medium" },
  { id: "INV-10502", vendor: "OfficePro", amount: "$680", risk: "High" },
  { id: "INV-10518", vendor: "Northwind Co.", amount: "$420", risk: "Low" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    getSession().then(setUser);
  }, []);

  const handleLogout = async () => {
    await clearSession();
    router.replace("/login");
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent invoice reviews</h2>
              <button className="text-sm font-medium text-indigo-600">View all</button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Vendor</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-medium text-slate-800">{invoice.id}</td>
                      <td className="px-4 py-3 text-slate-600">{invoice.vendor}</td>
                      <td className="px-4 py-3 text-slate-600">{invoice.amount}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            invoice.risk === "High"
                              ? "bg-rose-100 text-rose-700"
                              : invoice.risk === "Medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {invoice.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Risk alerts</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-medium text-amber-900">Price anomaly</p>
                <p className="mt-1 text-sm text-amber-800">Keyboard from ABC Supplies is 85% above the vendor average.</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                <p className="text-sm font-medium text-rose-900">Duplicate invoice</p>
                <p className="mt-1 text-sm text-rose-800">INV-10482 was submitted twice in the same week.</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-sm font-medium text-emerald-900">Healthy</p>
                <p className="mt-1 text-sm text-emerald-800">Northwind Co. is within policy tolerance.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      </main>
    </ProtectedRoute>
  );
}
