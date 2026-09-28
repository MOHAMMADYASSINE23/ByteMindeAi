import { hashToken, SESSION_COOKIE } from "../lib/session.js";
import sql from "../configs/db.js";

// Simple in-memory rate limiter
const rateLimitStore = new Map();

export const rateLimiter = (maxRequests = 10, windowMs = 15 * 60 * 1000) => { // 10 requests per 15 minutes
    return (req, res, next) => {
        const key = req.user?.id || req.ip || 'anonymous';
        const now = Date.now();

        if (!rateLimitStore.has(key)) {
            rateLimitStore.set(key, { count: 0, resetTime: now + windowMs });
        }

        const userLimit = rateLimitStore.get(key);

        // Reset if window has passed
        if (now > userLimit.resetTime) {
            userLimit.count = 0;
            userLimit.resetTime = now + windowMs;
        }

        // Check if limit exceeded
        if (userLimit.count >= maxRequests) {
            const resetIn = Math.ceil((userLimit.resetTime - now) / 1000 / 60);
            return res.status(429).json({
                success: false,
                message: `Rate limit exceeded. Try again in ${resetIn} minutes.`,
                error_code: 'RATE_LIMIT_EXCEEDED',
                reset_in_minutes: resetIn
            });
        }

        // Increment counter
        userLimit.count++;

        // Add headers for client
        res.set({
            'X-RateLimit-Limit': maxRequests,
            'X-RateLimit-Remaining': Math.max(0, maxRequests - userLimit.count),
            'X-RateLimit-Reset': new Date(userLimit.resetTime).toISOString()
        });

        next();
    };
};

export const requireAuth = async (req, res, next) => {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    try {
        const [user] = await sql`SELECT users.id, users.name, users.email, users.plan,
                users.free_usage, user_sessions.id AS session_id
            FROM user_sessions
            JOIN users ON users.id = user_sessions.user_id
            WHERE user_sessions.token_hash = ${hashToken(token)}
              AND user_sessions.expires_at > NOW()
            LIMIT 1`;

        if (!user) {
            res.clearCookie(SESSION_COOKIE, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            });
            return res.status(401).json({ success: false, message: 'Session expired. Sign in again.' });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            freeUsage: user.free_usage,
            sessionId: user.session_id,
        };
        next();
    } catch (error) {
        console.error('Session validation failed:', error.message);
        res.status(500).json({ success: false, message: 'Could not validate session.' });
    }
};

export const auth = requireAuth;