import express from 'express';
import { generateArticle, generateBlogTittle, generateImage } from '../controllers/aiController.js';
import { auth, rateLimiter } from '../middlewares/auth.js';

const aiRouter = express.Router();

aiRouter.post('/generate-article', auth, generateArticle)
aiRouter.post('/generate-blog-title', auth, generateBlogTittle)
aiRouter.post('/generate-image', auth, rateLimiter(5, 15 * 60 * 1000), generateImage) // 5 requests per 15 minutes

export default aiRouter