"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession, SessionUser } from "../lib/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let active = true;
    getSession().then((session) => {
      if (!active) return;
      if (!session) router.replace("/login");
      else setUser(session);
    });

    return () => { active = false; };
  }, [router]);

  if (!user) {
    return <div className="min-h-screen bg-slate-100" aria-label="Loading" />;
  }

  return children;
}
