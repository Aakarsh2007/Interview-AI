const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

// 100% Standard JSON Schema (Notice all types are lowercase!)
// This forces Gemini to return the exact structure Mongoose needs.
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

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    try {
        const prompt = `You are an expert technical interviewer and career coach. 
        Generate a comprehensive interview preparation report based on the provided candidate details.
        
        Resume Context: ${resume || "Not provided."}
        Self Description: ${selfDescription || "Not provided."}
        Job Description: ${jobDescription || "General Software Engineer"}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Using the most stable model for JSON Schema
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewResponseSchema, 
            }
        });

        const parsedResponse = JSON.parse(response.text);

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
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
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
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        html: { type: "string" }
                    },
                    required: ["html"]
                }
            }
        });

        const jsonContent = JSON.parse(response.text);
        const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

        return pdfBuffer;
    } catch (error) {
        console.error("AI Resume PDF Generation Error:", error);
        throw new Error("Failed to generate tailored resume PDF.");
    }
}

module.exports = {
    generateInterviewReport,
    generateResumePdf
};