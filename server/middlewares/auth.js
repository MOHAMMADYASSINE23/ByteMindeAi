import { clerkClient } from "@clerk/express";

// Simple in-memory rate limiter
const rateLimitStore = new Map();

export const rateLimiter = (maxRequests = 10, windowMs = 15 * 60 * 1000) => { // 10 requests per 15 minutes
    return (req, res, next) => {
        const key = req.auth()?.userId || req.ip || 'anonymous';
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

export const auth =  async(req, res, next) => {
    try{
        const {userId, has} = await req.auth();
        const hasPremiumPlan = await has({plan: 'premium'});
        const user = await clerkClient.users.getUser(userId);

        if(!hasPremiumPlan && user.publicMetadata.free_usage){
            req.free_usage = user.publicMetadata.free_usage;
        } else{
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {free_usage: 0}
            });
            req.free_usage = 0;
        }
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });

    }
}