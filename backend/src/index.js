// backend/src/index.js
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import 'dotenv/config';

import { parseResume } from './resumeParser.js';
// We now import our new, powerful ranking function
import { analyzeAndRankResumes } from './aiService.js';

const app = new Hono();

app.use('/api/*', cors({
    origin: 'http://localhost:5173',
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

        // Step 1: Parse all resumes in parallel
        const parsingPromises = resumeFiles.map(async (file) => {
            try {
                const text = await parseResume(file);
                return { status: 'fulfilled', fileName: file.name, text: text };
            } catch (e) {
                return { status: 'rejected', fileName: file.name, error: e.message };
            }
        });

        const parsingResults = await Promise.all(parsingPromises);

        // Filter out any resumes that failed to parse
        const successfullyParsedResumes = parsingResults.filter(
            (result) => result.status === 'fulfilled'
        );

        const failedToParseResumes = parsingResults.filter(
            (result) => result.status === 'rejected'
        );

        if (successfullyParsedResumes.length === 0) {
            return c.json({ error: "Could not parse any of the uploaded resumes." }, 400)
        }

        // Step 2: Send the entire batch to the AI for analysis and ranking
        const rankedAnalysis = await analyzeAndRankResumes(jobDescription, successfullyParsedResumes);

        // Create error objects for resumes that failed to parse, so the user knows
        const failedResults = failedToParseResumes.map(f => ({ ...f, error: `File failed to be parsed.` }));

        // Combine the ranked list with any files that failed
        const finalResults = [...rankedAnalysis, ...failedResults];

        // Final sort to ensure ranked items are at the top
        finalResults.sort((a,b) => (a.rank || 999) - (b.rank || 999));

        return c.json({ results: finalResults });

    } catch (error) {
        console.error('Error in /api/analyze:', error);
        return c.json({ error: 'An unexpected server error occurred.' }, 500);
    }
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});