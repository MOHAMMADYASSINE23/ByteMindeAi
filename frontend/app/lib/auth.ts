import { apiRequest } from "./api";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  plan: string;
}

export async function login(email: string, password: string) {
  return apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export async function signup(name: string, email: string, password: string) {
  return apiRequest("/api/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const payload = await apiRequest<{ user: SessionUser }>("/api/auth/me");
    return payload.user as SessionUser;
  } catch {
    return null;
  }
}

export async function clearSession() {
  await apiRequest<void>("/api/auth/logout", { method: "POST" });
}
