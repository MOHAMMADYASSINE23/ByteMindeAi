import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
                Invoice Auditor
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
                Catch invoice risk before it becomes a cost.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Review expenses, validate totals, detect duplicates, and flag suspicious vendor pricing with a finance-first AI workflow.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/reviews/new"
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Upload invoice
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  View dashboard
                </Link>
              </div>
            </div>

            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Risk alert</p>
                <p className="mt-2 text-2xl font-bold text-amber-900">85% above average</p>
                <p className="mt-2 text-sm text-amber-800">
                  Keyboard price jumped from $48 to $89 for ABC Supplies.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Invoices</p>
                  <p className="mt-2 text-2xl font-bold">1,284</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">High risk</p>
                  <p className="mt-2 text-2xl font-bold text-amber-600">7</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Approved</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-600">94%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
