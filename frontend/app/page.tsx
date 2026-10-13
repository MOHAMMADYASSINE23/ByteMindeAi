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
                Catch invoice risks before approval.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Record invoice details, flag duplicate numbers and high-value totals, then track each review decision in one place.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/reviews/new"
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Review an invoice
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  View dashboard
                </Link>
              </div>
            </div>

            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current audit rules</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Three checks, clear reasons</h2>
              <div className="mt-5 divide-y divide-slate-200">
                <div className="flex items-start gap-4 py-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">1</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Repeated invoice number</p>
                    <p className="mt-1 text-sm text-slate-600">Flags a number already submitted by your account.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">2</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Totals from $5,000</p>
                    <p className="mt-1 text-sm text-slate-600">Marks elevated-value invoices for policy review.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">3</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Totals from $10,000</p>
                    <p className="mt-1 text-sm text-slate-600">Recommends manual review for high-value invoices.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
