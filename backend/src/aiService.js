// backend/src/aiService.js
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

const candidateAnalysisSchema = z.object({
    fileName: z.string().describe("The original filename of the resume."),
    candidateName: z.string().describe("The name of the candidate, extracted from the resume."),
    score: z.number().describe("The relative match score from 0-100 compared to other candidates."),
    good_points: z.array(z.string()).describe("A list of 3 to 5 key strengths and alignments with the job description."),
    bad_points: z.array(z.string()).describe("A list of 3 to 5 key weaknesses or areas missing from the job description."),
    rank: z.number().describe("The final rank of this candidate among the batch (1 being the best)."),
});

const rankedListSchema = z.object({
    ranked_candidates: z.array(candidateAnalysisSchema),
});

const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-1.5-flash-latest",
    // We keep a low temperature for objective, fact-based analysis
    temperature: 0.1,
}).withStructuredOutput(rankedListSchema);

const prompt = ChatPromptTemplate.fromMessages([
    ["system",
        `You are an elite AI Talent Analyst, operating with the precision of a senior HR partner at a top-tier tech firm. Your sole objective is to provide a critical, evidence-based ranking of candidates based on a provided job description (JD). You must be objective, analytical, and avoid superficial judgments.

#### EVALUATION FRAMEWORK
You will evaluate each candidate against the JD using this rubric. The final score is a holistic measure of all factors.

1.  **Core Technical Skills Match:**
    *   How many of the required technologies, languages, and frameworks listed in the JD are present in the resume?
    *   Is the experience with these skills superficial (e.g., 'familiar with') or deep (e.g., 'led project using X for 3 years')?
    *   Does the candidate possess skills that are a direct match for the JD's key responsibilities?

2.  **Relevant Experience & Domain:**
    *   Does the total years of experience align with what the JD implies (e.g., Senior vs. Junior)?
    *   Is their past work in a similar industry or on similar types of projects?
    *   Look for keywords in their project descriptions that match the JD's problem domain.

3.  **Quantifiable Achievements & Impact:**
    *   Does the resume list measurable results (e.g., "improved performance by 30%", "reduced costs by $10k")?
    *   Does the candidate describe the *impact* of their work, or just list job duties? Resumes with clear impact are superior.
    *   Are their achievements directly relevant to the goals of the role described in the JD?

4.  **Red Flags & Gaps**
    *   Are there major gaps in the required skills from the JD?
    *   Is there frequent job-hopping without clear progression?
    *   Is the resume poorly formatted or contain significant grammatical errors (may indicate poor attention to detail)?

#### TASK AND OUTPUT FORMAT
Your task is to analyze the entire batch of provided resumes against the single job description. Compare the candidates to each other based on the framework above.

Your final output **MUST** be a single JSON object containing a ranked list of all candidates.
*   The good_points and bad_points must be concise, specific, and directly reference evidence from the resume in relation to the JD.
    *   GOOD example: "Strength: 5+ years of direct experience with Node.js, matching the primary requirement."
    *   BAD example: "Strength: Seems like a good fit."
*   The candidate with the strongest overall match against the rubric receives Rank #1.`],
    ["human", `Please analyze, score, and rank the following batch of resumes based on the provided Job Description.

  --- JOB DESCRIPTION ---
  {job_description}

  --- BATCH OF RESUMES ---
  {resumes_batch}`],
]);

const chain = prompt.pipe(model);

export async function analyzeAndRankResumes(jobDescription, parsedResumes) {
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

        result.ranked_candidates.sort((a, b) => a.rank - b.rank);

        return result.ranked_candidates;
    } catch (error) {
        console.error("Error in AI ranking analysis:", error);
        throw new Error("Failed to analyze and rank the batch of resumes with AI.");
    }
}