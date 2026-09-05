"use client";

import Link from "next/link";
import AuthForm from "../components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
            Invoice Auditor
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to review invoice risks</p>
        </div>

        <AuthForm
          title="Welcome back"
          fields={[
            { name: "email", label: "Email", type: "email", placeholder: "finance@company.com" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
          ]}
          submitButtonText="Login"
          onSubmit={(data) => console.log(data)}
        />

        <p className="mt-6 text-center text-sm text-slate-500">
          Need an account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
