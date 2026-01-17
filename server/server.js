import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import aiRouter from './routes/aiRoutes.js';
import { connectImagekit } from './configs/imagekit.js';
import sql from './configs/db.js';

const app = express()

const imagekit = connectImagekit();

app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

app.get('/', (req, res) =>res.send('Hello World!'))

app.get('/test-db', async (req, res) => {
try {
await sql`SELECT 1`;
res.send('Database connection OK');
} catch (error) {
res.send('Database error: ' + error.message);
}
});

app.get('/test-api', (req, res) => {
res.json({
openai_key: !!process.env.OPENAI_API_KEY,
gemini_key: !!process.env.GEMINI_API_KEY,
imagekit_public: !!process.env.IMAGEKIT_PUBLIC_KEY,
clerk_publish: !!process.env.CLERK_PUBLISHABLE_KEY
});
});

app.get('/create-table', async (req, res) => {
try {
await sql`CREATE TABLE IF NOT EXISTS creations (
id SERIAL PRIMARY KEY,
user_id TEXT NOT NULL,
prompt TEXT NOT NULL,
content TEXT NOT NULL,
type TEXT NOT NULL,
publish BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
)`;
res.send('Table created');
} catch (error) {
res.send('Error: ' + error.message);
}
});

app.use('/api/ai', aiRouter); // Move API routes before requireAuth

app.use(requireAuth()); // Apply auth to remaining routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});