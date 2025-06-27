// backend/src/index.js
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import 'dotenv/config';

import { parseResume } from './resumeParser.js';
import { analyzeAndRankResumes } from './aiService.js';

const app = new Hono();
app.use('/api/*', cors({
    origin: '*',
    allowHeaders: ['Content-Type'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
}));


app.post('/api/analyze', async (c) => {
    try {
        const formData = await c.req.formData();
        const jobDescription = formData.get('jobDescription');
        const resumeFiles = formData.getAll('resumes');

        if (!jobDescription || resumeFiles.length === 0) {
            return c.json({ error: 'Job description and at least one resume are required.' }, 400);
        }

        const parsingPromises = resumeFiles.map(async (file) => {
            try {
                const text = await parseResume(file);
                return { status: 'fulfilled', fileName: file.name, text: text };
            } catch (e) {
                return { status: 'rejected', fileName: file.name, error: e.message };
            }
        });

        const parsingResults = await Promise.all(parsingPromises);

        const successfullyParsedResumes = parsingResults.filter(
            (result) => result.status === 'fulfilled'
        );

        const failedToParseResumes = parsingResults.filter(
            (result) => result.status === 'rejected'
        );

        if (successfullyParsedResumes.length === 0) {
            return c.json({ error: "Could not parse any of the uploaded resumes." }, 400)
        }

        const rankedAnalysis = await analyzeAndRankResumes(jobDescription, successfullyParsedResumes);

        const failedResults = failedToParseResumes.map(f => ({ ...f, error: `File failed to be parsed.` }));

        const finalResults = [...rankedAnalysis, ...failedResults];

        finalResults.sort((a,b) => (a.rank || 999) - (b.rank || 999));

        return c.json({ results: finalResults });

    } catch (error) {
        console.error('Error in /api/analyze:', error);
        return c.json({ error: 'An unexpected server error occurred.' }, 500);
    }
});

// Use Render's port if available, otherwise default to 3000
const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});