// backend/src/aiService.js
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// Schema for a single candidate's analysis
const candidateAnalysisSchema = z.object({
    fileName: z.string().describe("The original filename of the resume."),
    candidateName: z.string().describe("The name of the candidate, extracted from the resume."),
    score: z.number().min(0).max(100).describe("The relative match score from 0-100 compared to other candidates."),
    good_points: z.array(z.string()).describe("A list of 3-5 key strengths and alignments with the job description."),
    bad_points: z.array(z.string()).describe("A list of 3-5 key weaknesses or areas missing from the job description."),
    rank: z.number().int().positive().describe("The final rank of this candidate among the batch (1 being the best)."),
});

// The final output schema: an object containing a ranked list of candidates
const rankedListSchema = z.object({
    ranked_candidates: z.array(candidateAnalysisSchema),
});

// Re-configure the model to use our new, more complex schema
const model = new ChatOpenAI({
    apiKey: process.env.GROQ_API_KEY,
    modelName: "meta-llama/llama-4-maverick-17b-128e-instruct",
    temperature: 0.1, // Lower temperature for more consistent, factual ranking
    configuration: {
        baseURL: process.env.GROQ_API_BASE_URL,
    },
}).withStructuredOutput(rankedListSchema); // <-- Note the new schema here

// The new prompt for batch ranking
const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are an expert HR Director. Your task is to analyze a BATCH of resumes against a single job description.
  Your goal is to produce a final, ranked shortlist of all candidates.
  1.  Carefully read the Job Description.
  2.  Read through ALL the resumes provided in the batch.
  3.  Compare the candidates against each other.
  4.  Assign a relative score to each candidate. A superstar candidate might get a 95, while a solid but less-qualified one gets a 75.
  5.  Assign a rank to each candidate, with 1 being the absolute best in the batch.
  6.  Extract the candidate's name from each resume.
  7.  Provide concise good and bad points for each candidate based on the job description.
  8.  Return the final analysis as a single JSON object containing a ranked list.`],
    ["human", `Please analyze and rank the following resumes against the job description.

  --- JOB DESCRIPTION ---
  {job_description}

  --- BATCH OF RESUMES ---
  {resumes_batch}`],
]);

const chain = prompt.pipe(model);

// The new master function for analysis and ranking
export async function analyzeAndRankResumes(jobDescription, parsedResumes) {
    // Format the batch of resumes into a single string for the prompt
    const resumesBatchString = parsedResumes
        .map(
            (resume, index) =>
                `--- RESUME ${index + 1} (Filename: ${resume.fileName}) ---
${resume.text}
--- END OF RESUME ${index + 1} ---`
        )
        .join("\n\n");

    try {
        const result = await chain.invoke({
            job_description: jobDescription,
            resumes_batch: resumesBatchString,
        });

        // The AI result is already ranked, but we can ensure it's sorted by the rank field just in case
        result.ranked_candidates.sort((a, b) => a.rank - b.rank);

        return result.ranked_candidates; // Return just the array of candidates
    } catch (error) {
        console.error("Error in AI ranking analysis:", error);
        throw new Error("Failed to analyze and rank the batch of resumes with AI.");
    }
}