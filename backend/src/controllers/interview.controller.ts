import { Request, Response } from 'express';
import pdfParse from 'pdf-parse';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import interviewReportModel from '../models/interviewReport.model';
import mockInterviewModel from '../models/mockInterview.model';
import { generateInterviewReport, generateResumePdf, evaluateMockInterviewAnswer } from '../services/ai.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

// Zod validation schemas
const generateReportSchema = z.object({
    jobDescription: z.string().min(10, 'Job description must be at least 10 characters'),
    selfDescription: z.string().optional(),
    role: z.string().optional(),
    experienceLevel: z.string().optional(),
    company: z.string().optional()
});

const evaluateAnswerSchema = z.object({
    question: z.string().min(1),
    userAnswer: z.string().min(1),
    jobTitle: z.string().min(1)
});

const saveMockSchema = z.object({
    interviewReportId: z.string().min(1),
    jobTitle: z.string().min(1),
    qaList: z.array(z.object({
        question: z.string(),
        userAnswer: z.string(),
        aiFeedback: z.string(),
        score: z.number(),
        durationSeconds: z.number().optional(),
        isSpoken: z.boolean().optional()
    })),
    totalScore: z.number()
});

export async function generateInterViewReportController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        const validation = generateReportSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.format()
            });
        }

        const { selfDescription, jobDescription, role, experienceLevel, company } = validation.data;
        const hasFile = !!req.file;
        const hasSelfDescription = !!selfDescription && selfDescription.trim().length > 0;

        if (!hasFile && !hasSelfDescription) {
            return res.status(400).json({ message: 'Please provide either a Resume PDF or a Quick Self Description.' });
        }

        let resumeContentText = '';
        if (hasFile && req.file) {
            const pdfParser = pdfParse as any;
            if (typeof pdfParser === 'function') {
                const parsedPdf = await pdfParser(req.file.buffer);
                resumeContentText = parsedPdf.text;
            } else if (pdfParser && typeof pdfParser.default === 'function') {
                const parsedPdf = await pdfParser.default(req.file.buffer);
                resumeContentText = parsedPdf.text;
            } else {
                throw new Error('PDF parser could not be initialized.');
            }
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContentText,
            selfDescription,
            jobDescription,
            role,
            experienceLevel,
            company
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user?.id,
            resume: resumeContentText,
            selfDescription,
            jobDescription,
            title: interViewReportByAi.title || role || 'Interview Report',
            ...interViewReportByAi
        });

        return res.status(201).json({
            message: 'Interview report generated successfully.',
            interviewReport
        });

    } catch (error: any) {
        console.error('Generate Report Error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export async function getInterviewReportByIdController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        const { interviewId } = req.params;
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user?.id });

        if (!interviewReport) {
            return res.status(404).json({ message: 'Interview report not found.' });
        }

        return res.status(200).json({
            message: 'Interview report fetched successfully.',
            interviewReport
        });
    } catch (error: any) {
        console.error('Get Report Error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export async function getAllInterviewReportsController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user?.id })
            .sort({ createdAt: -1 })
            .select('-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan');

        return res.status(200).json({
            message: 'Interview reports fetched successfully.',
            interviewReports
        });
    } catch (error: any) {
        console.error('Get All Reports Error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export async function generateResumePdfController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        const { interviewReportId } = req.params;
        const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user?.id });

        if (!interviewReport) {
            return res.status(404).json({ message: 'Interview report not found.' });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;
        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=resume_${interviewReportId}.pdf`
        });

        return res.send(pdfBuffer);
    } catch (error: any) {
        console.error('Generate Resume PDF Error:', error);
        return res.status(500).json({ message: 'Server error while generating PDF', error: error.message });
    }
}

export async function deleteInterviewReportController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        const { id } = req.params;
        const deletedReport = await interviewReportModel.findOneAndDelete({ 
            _id: id, 
            user: req.user?.id 
        });

        if (!deletedReport) {
            return res.status(404).json({ message: 'Report not found or you are not authorized to delete it.' });
        }

        return res.status(200).json({ message: 'Interview report deleted successfully.' });
    } catch (error: any) {
        console.error('Delete Report Error:', error);
        return res.status(500).json({ message: 'Server error while deleting report', error: error.message });
    }
}

export async function toggleTaskCompletionController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        const { id } = req.params;
        const { taskString } = req.body;

        if (!taskString) {
            return res.status(400).json({ message: 'Task string is required' });
        }

        const report = await interviewReportModel.findOne({ _id: id, user: req.user?.id });
        if (!report) {
            return res.status(404).json({ message: 'Report not found.' });
        }

        const isCompleted = report.completedTasks.includes(taskString);
        
        const updatedReport = await interviewReportModel.findOneAndUpdate(
            { _id: id, user: req.user?.id },
            isCompleted 
                ? { $pull: { completedTasks: taskString } } 
                : { $push: { completedTasks: taskString } }, 
            { new: true } 
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found.' });
        }

        return res.status(200).json({ 
            message: 'Task toggled successfully', 
            completedTasks: updatedReport.completedTasks 
        });

    } catch (error: any) {
        console.error('Toggle Task Error:', error);
        return res.status(500).json({ message: 'Server error while updating task', error: error.message });
    }
}

export async function evaluateAnswerController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        const validation = evaluateAnswerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.format()
            });
        }

        const { question, userAnswer, jobTitle } = validation.data;
        const evaluation = await evaluateMockInterviewAnswer({ question, userAnswer, jobTitle });

        return res.status(200).json({ message: 'Evaluation successful', evaluation });
    } catch (error: any) {
        console.error('Evaluate Answer Error:', error);
        return res.status(500).json({ message: 'Server error evaluating answer', error: error.message });
    }
}

export async function getNextQuestionController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        const { jobTitle, experienceLevel, company, pastQuestions, questionIndex } = req.body;
        
        // Base logic for Dynamic adaptive difficulty selection
        const prompt = `You are a professional technical interviewer for the position of ${jobTitle} (${experienceLevel || 'Mid-Level'} level)${company ? ` at ${company}` : ''}.
        
        We are conducting a dynamic mock interview. This is question #${questionIndex || 1} of 5.
        
        Here is the history of past questions in this session:
        ${JSON.stringify(pastQuestions || [])}
        
        Analyze the candidate's performance so far:
        - If the candidate's score on the last question was 7 or above, generate a MORE DIFFICULT question.
        - If the candidate's score on the last question was less than 5, generate an EASIER, more foundational question.
        - If there are no past questions, generate a standard introductory technical question for this level.
        
        Return a single JSON object containing:
        {
          "question": "The question text to ask",
          "expectedKeywords": ["keyword1", "keyword2"],
          "intention": "What this question intends to test"
        }`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'object',
                    properties: {
                        question: { type: 'string' },
                        expectedKeywords: { type: 'array', items: { type: 'string' } },
                        intention: { type: 'string' }
                    },
                    required: ['question', 'expectedKeywords', 'intention']
                }
            }
        });
        
        const parsed = JSON.parse(response.text || '{}');
        return res.status(200).json({ question: parsed });
    } catch (err: any) {
        console.error('Get Next Question Error:', err);
        return res.status(500).json({ message: 'Server error generating question', error: err.message });
    }
}

export async function saveMockInterviewController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        const validation = saveMockSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.format()
            });
        }

        const { interviewReportId, jobTitle, qaList, totalScore } = validation.data;

        const newMockInterview = await mockInterviewModel.create({
            user: req.user?.id,
            interviewReport: interviewReportId,
            jobTitle,
            qaList,
            totalScore
        });

        return res.status(201).json({ 
            message: 'Mock interview saved successfully!', 
            mockInterview: newMockInterview 
        });
    } catch (error: any) {
        console.error('Save Mock Interview Error:', error);
        return res.status(500).json({ message: 'Server error saving mock interview', error: error.message });
    }
}

export async function getAllMockInterviewsController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        const mockInterviews = await mockInterviewModel
            .find({ user: req.user?.id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Mock interviews fetched successfully.',
            mockInterviews
        });
    } catch (error: any) {
        console.error('Get All Mock Interviews Error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export async function deleteMockInterviewController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        const { id } = req.params;
        const deletedMock = await mockInterviewModel.findOneAndDelete({ _id: id, user: req.user?.id });

        if (!deletedMock) {
            return res.status(404).json({ message: 'Mock interview not found or unauthorized.' });
        }

        return res.status(200).json({ message: 'Mock interview deleted successfully.' });
    } catch (error: any) {
        console.error('Delete Mock Interview Error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// User performance analytics controller
export async function getUserAnalyticsController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        const mockInterviews = await mockInterviewModel.find({ user: req.user?.id });
        const reports = await interviewReportModel.find({ user: req.user?.id });

        const totalInterviews = mockInterviews.length;
        const totalStrategies = reports.length;

        let totalScoreSum = 0;
        let strongestSkill = 'N/A';
        let weakestSkill = 'N/A';
        const skillScoreSums: { [key: string]: { sum: number; count: number } } = {};

        mockInterviews.forEach((mock) => {
            totalScoreSum += mock.totalScore;
            // Classify scores by role
            const role = mock.jobTitle || 'General';
            if (!skillScoreSums[role]) {
                skillScoreSums[role] = { sum: 0, count: 0 };
            }
            skillScoreSums[role].sum += mock.totalScore;
            skillScoreSums[role].count += 1;
        });

        const averageScore = totalInterviews > 0 ? Math.round(totalScoreSum / totalInterviews) : 0;

        let maxAvg = -1;
        let minAvg = 101;
        Object.keys(skillScoreSums).forEach((role) => {
            const avg = skillScoreSums[role].sum / skillScoreSums[role].count;
            if (avg > maxAvg) {
                maxAvg = avg;
                strongestSkill = role;
            }
            if (avg < minAvg) {
                minAvg = avg;
                weakestSkill = role;
            }
        });

        // Generate historic progress chart points
        const scoreHistory = mockInterviews
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((mock) => ({
                date: mock.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                score: mock.totalScore
            }));

        return res.status(200).json({
            analytics: {
                totalInterviews,
                totalStrategies,
                averageScore,
                strongestSkill: strongestSkill === 'N/A' ? 'Not enough data' : strongestSkill,
                weakestSkill: weakestSkill === 'N/A' ? 'Not enough data' : weakestSkill,
                scoreHistory
            }
        });

    } catch (error: any) {
        console.error('Get User Analytics Error:', error);
        return res.status(500).json({ message: 'Server error fetching analytics', error: error.message });
    }
}
