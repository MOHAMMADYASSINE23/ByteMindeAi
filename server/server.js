import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { ensureAuthTables } from './routes/authRoutes.js';
import authRouter from './routes/authRoutes.js';
import { ensureInvoiceTables } from './routes/invoiceRoutes.js';
import invoiceRouter from './routes/invoiceRoutes.js';

const app = express()

const developmentOrigins = process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:3000', 'http://localhost:5173'];
const configuredOrigins = (process.env.FRONTEND_URL || '')
    .split(',').map((origin) => origin.trim()).filter(Boolean);
const allowedOrigins = [...new Set([...developmentOrigins, ...configuredOrigins])];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) =>res.send('Hello World!'))

app.use('/api/auth', authRouter);
app.use('/api/invoices', invoiceRouter);

const PORT = process.env.PORT || 5000;

ensureAuthTables().then(ensureInvoiceTables).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Could not initialize auth tables:', error.message);
    process.exit(1);
});