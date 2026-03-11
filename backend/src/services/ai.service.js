const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewResponseSchema = {
    type: "object",
    properties: {
        title: { type: "string" },
        matchScore: { type: "number" },
        technicalQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    skill: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    day: { type: "number" },
                    focus: { type: "string" },
                    tasks: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },
    required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
};

const evaluationSchema = {
    type: "object",
    properties: {
        score: { type: "number", description: "Score from 0 to 10" },
        feedback: { type: "string", description: "Specific, constructive feedback telling the candidate what they did well and what they missed." }
    },
    required: ["score", "feedback"]
};

// 🔥 THE FIX: A Bulletproof JSON Parser that strips out AI Markdown
function parseGeminiJSON(rawText) {
    let cleanText = rawText.trim();
    if (cleanText.startsWith("```json")) {
        cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith("```")) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    return JSON.parse(cleanText.trim());
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    try {
        const prompt = `You are an expert technical interviewer and career coach. 
        Generate a comprehensive interview preparation report based on the provided candidate details.
        
        CRITICAL INSTRUCTION: You MUST generate EXACTLY 5 technical questions and EXACTLY 5 behavioral questions. Do not generate more or less.
        
        Resume Context: ${resume || "Not provided."}
        Self Description: ${selfDescription || "Not provided."}
        Job Description: ${jobDescription || "General Software Engineer"}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // 🔥 Restored to the correct, working model
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewResponseSchema, 
            }
        });

        // 🔥 Using the safe parser
        const parsedResponse = parseGeminiJSON(response.text);

        console.log("=== SUCCESSFUL AI GENERATION ===");
        console.log(JSON.stringify(parsedResponse, null, 2));

        return parsedResponse;

    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate report from AI.");
    }
}

async function generatePdfFromHtml(htmlContent) {
    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4", 
            margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" }
        });

        return pdfBuffer;
    } catch (error) {
        console.error("Puppeteer PDF Error:", error);
        throw new Error("Failed to generate PDF document.");
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    try {
        const prompt = `Generate an HTML resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Respond ONLY with a valid JSON object containing a single key "html" with the HTML string.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // 🔥 Restored
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: { html: { type: "string" } },
                    required: ["html"]
                }
            }
        });

        // 🔥 Using the safe parser
        const jsonContent = parseGeminiJSON(response.text);
        const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

        return pdfBuffer;
    } catch (error) {
        console.error("AI Resume PDF Generation Error:", error);
        throw new Error("Failed to generate tailored resume PDF.");
    }
}

async function evaluateMockInterviewAnswer({ question, userAnswer, jobTitle }) {
    try {
        const prompt = `You are a strict technical interviewer for the position of ${jobTitle}. 
        
        Question asked to candidate: "${question}"
        Candidate's answer: "${userAnswer}"
        
        Evaluate the candidate's answer. Be critical but fair. Provide a score out of 10 and specific feedback on what was good and what was missing.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // 🔥 Restored
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: evaluationSchema, 
            }
        });

        // 🔥 Using the safe parser
        const parsedResponse = parseGeminiJSON(response.text);
        return parsedResponse;

    } catch (error) {
        console.error("AI Evaluation Error:", error);
        throw new Error("Failed to evaluate answer.");
    }
}

module.exports = {
    generateInterviewReport,
    generateResumePdf,
    evaluateMockInterviewAnswer 
};