"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession, SessionUser } from "../lib/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    setUser(session);
  }, [router]);

  if (!user) {
    return <div className="min-h-screen bg-slate-100" aria-label="Loading" />;
  }

  return children;
}
