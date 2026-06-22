import { GoogleGenAI } from '@google/genai';
import puppeteer from 'puppeteer';
import { createHash } from 'crypto';
import { redisClient } from '../config/redis';

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

// JSON Schema for Gemini
export const interviewResponseSchema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        matchScore: { type: 'number' },
        technicalQuestions: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    question: { type: 'string' },
                    intention: { type: 'string' },
                    answer: { type: 'string' }
                },
                required: ['question', 'intention', 'answer']
            }
        },
        behavioralQuestions: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    question: { type: 'string' },
                    intention: { type: 'string' },
                    answer: { type: 'string' }
                },
                required: ['question', 'intention', 'answer']
            }
        },
        skillGaps: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    skill: { type: 'string' },
                    severity: { type: 'string', enum: ['low', 'medium', 'high'] }
                },
                required: ['skill', 'severity']
            }
        },
        preparationPlan: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    day: { type: 'number' },
                    focus: { type: 'string' },
                    tasks: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                text: { type: 'string', description: 'The task action item description' },
                                resources: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            title: { type: 'string', description: "Title of the learning resource (e.g. 'React docs: useState')" },
                                            url: { type: 'string', description: 'A high-quality documentation URL, youtube query link, or practice problem link' },
                                            type: { type: 'string', enum: ['video', 'article', 'docs', 'practice'] }
                                        },
                                        required: ['title', 'url', 'type']
                                    }
                                }
                            },
                            required: ['text', 'resources']
                        }
                    }
                },
                required: ['day', 'focus', 'tasks']
            }
        },
        atsKeywordsMissing: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of 5-10 key technical skills, libraries, or methodologies from the JD that are missing or weak in the resume context'
        },
        atsSuggestedBullets: {
            type: 'array',
            items: { type: 'string' },
            description: "3-5 high-impact resume accomplishment bullet points integrating missing keywords using Google's X-Y-Z formula formatting"
        }
    },
    required: ['title', 'matchScore', 'technicalQuestions', 'behavioralQuestions', 'skillGaps', 'preparationPlan', 'atsKeywordsMissing', 'atsSuggestedBullets']
};

export const evaluationSchema = {
    type: 'object',
    properties: {
        score: { type: 'number', description: 'Score from 0 to 10' },
        feedback: { type: 'string', description: 'Specific, constructive feedback telling the candidate what they did well and what they missed.' }
    },
    required: ['score', 'feedback']
};

function parseGeminiJSON(rawText: string): any {
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    return JSON.parse(cleanText.trim());
}

// Caching Helpers
function getCacheKey(prefix: string, data: any): string {
    const serialized = JSON.stringify(data);
    const hash = createHash('sha256').update(serialized).digest('hex');
    return `${prefix}:${hash}`;
}

async function getCachedData<T>(key: string): Promise<T | null> {
    try {
        const val = await redisClient.get(key);
        if (val) {
            console.log(`[CACHE HIT] Key: ${key}`);
            return JSON.parse(val) as T;
        }
    } catch (err) {
        console.error('Redis cache get error:', err);
    }
    return null;
}

async function setCachedData(key: string, data: any, ttlSeconds: number = 86400 * 7): Promise<void> {
    try {
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
        console.log(`[CACHE SET] Key: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (err) {
        console.error('Redis cache set error:', err);
    }
}

export interface ReportParams {
    resume?: string;
    selfDescription?: string;
    jobDescription: string;
    role?: string;
    experienceLevel?: string;
    company?: string;
}

export async function generateInterviewReport(params: ReportParams): Promise<any> {
    const cacheKey = getCacheKey('report', params);
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return cached;

    try {
        const { resume, selfDescription, jobDescription, role, experienceLevel, company } = params;

        const roleText = role ? `for the role of ${role}` : '';
        const levelText = experienceLevel ? `at a ${experienceLevel} level` : '';
        const companyText = company ? `tailored specifically to ${company}'s interview process and expectations` : '';

        const prompt = `You are an expert technical interviewer and career coach.
        Generate a comprehensive interview preparation report ${roleText} ${levelText} ${companyText} based on the provided candidate details.
        
        CRITICAL INSTRUCTION: You MUST generate EXACTLY 5 technical questions and EXACTLY 5 behavioral questions. Do not generate more or less.
        
        For each task in the preparationPlan, you must generate 1 or 2 specific learning resources. The resources must have realistic URLs (e.g., specific YouTube search URLs like 'https://www.youtube.com/results?search_query=...' or MDN docs URLs, or React/Python official docs, or LeetCode problem search links for practice).
        
        ATS Analysis:
        - Identify 5-10 key technical terms, frameworks, or methodologies present in the Job Description that are missing or weak in the candidate's Resume Context. Put these in 'atsKeywordsMissing'.
        - Suggest 3-5 high-impact resume accomplishment bullet points that integrate these missing keywords. Use the 'action verb + task + quantified result' (e.g. Google X-Y-Z formula) format. Put these in 'atsSuggestedBullets'.
        
        Candidate's Resume Context: ${resume || 'Not provided.'}
        Quick Self Description: ${selfDescription || 'Not provided.'}
        Target Job Description: ${jobDescription || 'General Software Engineer'}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: interviewResponseSchema
            }
        });

        const parsedResponse = parseGeminiJSON(response.text || '');

        console.log('=== SUCCESSFUL AI REPORT GENERATION ===');
        await setCachedData(cacheKey, parsedResponse);

        return parsedResponse;

    } catch (error) {
        console.error('AI Report Generation Error:', error);
        throw new Error('Failed to generate report from AI.');
    }
}

export async function generatePdfFromHtml(htmlContent: string): Promise<Buffer> {
    let browser;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--headless']
        });
        const page = await browser.newPage();
        
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
        });

        return pdfBuffer as Buffer;
    } catch (error) {
        console.error('Puppeteer PDF Error:', error);
        throw new Error('Failed to generate PDF document.');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export interface ResumePdfParams {
    resume?: string;
    selfDescription?: string;
    jobDescription: string;
}

export async function generateResumePdf(params: ResumePdfParams): Promise<Buffer> {
    try {
        const { resume, selfDescription, jobDescription } = params;
        const prompt = `Generate an HTML resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Respond ONLY with a valid JSON object containing a single key "html" with the HTML string.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'object',
                    properties: { html: { type: 'string' } },
                    required: ['html']
                }
            }
        });

        const jsonContent = parseGeminiJSON(response.text || '');
        const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

        return pdfBuffer;
    } catch (error) {
        console.error('AI Resume PDF Generation Error:', error);
        throw new Error('Failed to generate tailored resume PDF.');
    }
}

export interface EvaluationParams {
    question: string;
    userAnswer: string;
    jobTitle: string;
}

export async function evaluateMockInterviewAnswer(params: EvaluationParams): Promise<any> {
    const cacheKey = getCacheKey('evaluate', params);
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return cached;

    try {
        const { question, userAnswer, jobTitle } = params;
        const prompt = `You are a strict technical interviewer for the position of ${jobTitle}. 
        
        Question asked to candidate: "${question}"
        Candidate's answer: "${userAnswer}"
        
        Evaluate the candidate's answer based on correctness, technical depth, and structure (such as STAR method if behavioral). Be critical but fair. Provide a score out of 10 and specific feedback on what was good and what was missing.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: evaluationSchema
            }
        });

        const parsedResponse = parseGeminiJSON(response.text || '');
        await setCachedData(cacheKey, parsedResponse);

        return parsedResponse;

    } catch (error) {
        console.error('AI Evaluation Error:', error);
        throw new Error('Failed to evaluate answer.');
    }
}
