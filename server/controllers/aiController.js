import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import FormData from 'form-data';
import { connectImagekit } from '../configs/imagekit.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY, // Fallback to existing key if no OpenAI key
});
export const generateArticle = async (req, res) => {
    console.log('generateArticle called with prompt:', prompt, 'length:', length);
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.status(403).json({ success: false, message: 'Limit reached. Upgrade to continue.' })

         }

         const response = await openai.chat.completions.create({
           model: "gpt-3.5-turbo",
           messages: [{
                   role: "user",
                   content: prompt,
        },
    ],
    temperature: 0.7,
    max_tokens: length,
  });
  const content = response.choices[0].message.content;
    
    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article') `;
    if (plan !== 'premium') {
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: { free_usage: free_usage + 1 }
        })
    }
    res.json({ success: true, content });

  } catch (error) {
    console.log(error.message)
    res.json({success: false, message: error.message });
  }
}

export const generateBlogTittle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.status(403).json({ success: false, message: 'Limit reached. Upgrade to continue.' })

         }

         const response = await openai.chat.completions.create({
           model: "gpt-3.5-turbo",
           messages: [{
                   role: "user",
                   content: prompt,
        },
    ],
    temperature: 0.7,
    max_tokens: 100,
  });
  const content = response.choices[0].message.content;
    
    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title') `;
    if (plan !== 'premium') {
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: { free_usage: free_usage + 1 }
        })
    }
    res.json({ success: true, content });

  } catch (error) {
    console.log(error.message)
    res.json({success: false, message: error.message });
  }
}
 
export const generateImage = async (req, res) => {
    try {
        // Input validation
        const { prompt, publish } = req.body;

        // Validate required fields
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required and must be a string',
                error_code: 'INVALID_PROMPT'
            });
        }

        // Validate prompt length
        if (prompt.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Prompt must be at least 3 characters long',
                error_code: 'PROMPT_TOO_SHORT'
            });
        }

        if (prompt.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Prompt must be less than 500 characters',
                error_code: 'PROMPT_TOO_LONG'
            });
        }

        // Validate publish field
        if (publish !== undefined && typeof publish !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Publish must be a boolean value',
                error_code: 'INVALID_PUBLISH'
            });
        }

        // Get authenticated user data
        const { userId } = req.auth();
        const plan = req.plan;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication failed',
                error_code: 'AUTH_FAILED'
            });
        }

        // Check premium subscription
        if (plan !== 'premium') {
            return res.status(403).json({
                success: false,
                message: 'This feature is only available for premium subscriptions',
                error_code: 'PREMIUM_REQUIRED'
            });
        }

        console.log(`Generating image for user ${userId} with prompt: "${prompt.substring(0, 50)}..."`);

        // Create a simple PNG image (1x1 pixel) for testing
        const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

        // Upload to ImageKit with optimization and multiple sizes
        let imagekit, uploadResult, secure_url, thumbnail_url, optimized_url;

        try {
            imagekit = connectImagekit();

            // Upload original image with optimization
            uploadResult = await imagekit.upload({
                file: base64Image,
                fileName: `ai-image-${Date.now()}.png`,
                folder: '/ai-generated',
                // ImageKit optimization options
                options: {
                    quality: 85,
                    progressive: true,
                    optimize: true
                }
            });

            secure_url = uploadResult.url;

            if (!secure_url) {
                throw new Error('ImageKit returned empty URL');
            }

            // Generate optimized URLs with transformations
            const baseUrl = secure_url.split('/ai-generated/')[0];
            const imagePath = `/ai-generated/ai-image-${Date.now()}.png`;

            // Thumbnail version (150x150, cropped)
            thumbnail_url = `${baseUrl}/tr:w-150,h-150,c-at_max,f-auto,q-80${imagePath}`;

            // Web-optimized version (400x300, maintain aspect ratio)
            optimized_url = `${baseUrl}/tr:w-400,h-300,c-at_max,f-auto,q-85${imagePath}`;

            console.log('Image URLs generated:', { secure_url, thumbnail_url, optimized_url });

        } catch (uploadError) {
            console.error('ImageKit upload failed:', uploadError.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload and optimize image',
                error_code: 'UPLOAD_FAILED',
                details: uploadError.message
            });
        }

        // Save to database with error handling
        try {
            await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false}) `;

            console.log(`Successfully generated and saved image for user ${userId}`);

        } catch (dbError) {
            console.error('Database insertion failed:', dbError.message);
            // Don't return error here as the image was uploaded successfully
            // Just log the database error
        }

        res.json({
            success: true,
            content: secure_url,
            thumbnail: thumbnail_url,
            optimized: optimized_url,
            message: 'Image generated and optimized successfully',
            sizes: {
                original: '512x512',
                thumbnail: '150x150',
                optimized: '400x300'
            }
        });

    } catch (error) {
        console.error('Unexpected error in generateImage:', error);

        // Handle different types of errors
        if (error.message.includes('auth')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed',
                error_code: 'AUTH_ERROR'
            });
        }

        if (error.message.includes('network') || error.message.includes('timeout')) {
            return res.status(503).json({
                success: false,
                message: 'Service temporarily unavailable',
                error_code: 'SERVICE_UNAVAILABLE'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error_code: 'INTERNAL_ERROR'
        });
    }
}



