export interface SessionUser {
  id: string;
  name: string;
  email: string;
  plan: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function authRequest(path: string, body?: Record<string, string>) {
  const response = await fetch(`${API_BASE_URL}/api/auth/${path}`, {
    method: body ? "POST" : "GET",
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (response.status === 204) return null;
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Authentication request failed.");
  return payload;
}

export async function login(email: string, password: string) {
  return authRequest("login", { email, password });
}

export async function signup(name: string, email: string, password: string) {
  return authRequest("signup", { name, email, password });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const payload = await authRequest("me");
    return payload.user as SessionUser;
  } catch {
    return null;
  }
}

export async function clearSession() {
  await authRequest("logout", {});
}
