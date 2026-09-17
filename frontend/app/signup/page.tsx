"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthForm from "../components/AuthForm";
import { saveSession } from "../lib/auth";

export default function SignupPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
            Invoice Auditor
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">Start reviewing risky invoices</p>
        </div>

        <AuthForm
          title="Create account"
          fields={[
            { name: "name", label: "Full name", type: "text", placeholder: "Jane Smith" },
            { name: "email", label: "Email", type: "email", placeholder: "finance@company.com" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
            { name: "confirmPassword", label: "Confirm password", type: "password", placeholder: "••••••••" },
          ]}
          submitButtonText="Create account"
          onSubmit={(data) => {
            saveSession({ name: data.name, email: data.email });
            router.push("/dashboard");
          }}
        />

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
