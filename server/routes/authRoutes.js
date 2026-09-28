import { randomBytes } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import sql from "../configs/db.js";
import { rateLimiter, requireAuth } from "../middlewares/auth.js";
import { hashToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "../lib/session.js";

const router = Router();
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export async function ensureAuthTables() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free',
    free_usage INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON user_sessions(expires_at)`;
}

async function createSession(userId, res) {
  const token = randomBytes(32).toString("base64url");
  await sql`INSERT INTO user_sessions (user_id, token_hash, expires_at)
    VALUES (${userId}, ${hashToken(token)}, NOW() + INTERVAL '7 days')`;
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_TTL_SECONDS * 1000 });
}

router.post("/signup", rateLimiter(5, 15 * 60 * 1000), async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }
  if (password.length < 12 || password.length > 128) {
    return res.status(400).json({ message: "Password must be between 12 and 128 characters." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await sql`INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name, email, plan`;

    if (!user) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    await createSession(user.id, res);
    return res.status(201).json({ user });
  } catch (error) {
    console.error("Signup failed:", error.message);
    return res.status(500).json({ message: "Could not create your account." });
  }
});

router.post("/login", rateLimiter(10, 15 * 60 * 1000), async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const [user] = await sql`SELECT id, name, email, password_hash, plan
      FROM users WHERE email = ${email} LIMIT 1`;
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    await createSession(user.id, res);
    return res.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({ message: "Could not sign in right now." });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await sql`DELETE FROM user_sessions WHERE token_hash = ${hashToken(token)}`;
  }
  res.clearCookie(SESSION_COOKIE, cookieOptions);
  res.status(204).end();
});

export default router;