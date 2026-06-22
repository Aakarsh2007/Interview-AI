import express from 'express';
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import authMiddleware from '../middlewares/auth.middleware';
import {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    deleteInterviewReportController,
    toggleTaskCompletionController,
    evaluateAnswerController,
    saveMockInterviewController,
    getAllMockInterviewsController,
    deleteMockInterviewController,
    getNextQuestionController,
    getUserAnalyticsController
} from '../controllers/interview.controller';

const interviewRouter = express.Router();

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF files are allowed.') as any, false);
        }
    }
});

const aiGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Increased limit for production mock interviews
    message: { message: 'Too many reports generated. Please try again after an hour to conserve API limits.' },
    standardHeaders: true,
    legacyHeaders: false,
});

interviewRouter.post('/', authMiddleware as any, aiGenerationLimiter, upload.single('resume'), generateInterViewReportController as any);
interviewRouter.get('/report/:interviewId', authMiddleware as any, getInterviewReportByIdController as any);
interviewRouter.get('/', authMiddleware as any, getAllInterviewReportsController as any);
interviewRouter.post('/resume/pdf/:interviewReportId', authMiddleware as any, generateResumePdfController as any);
interviewRouter.delete('/:id', authMiddleware as any, deleteInterviewReportController as any);
interviewRouter.patch('/:id/task', authMiddleware as any, toggleTaskCompletionController as any);

interviewRouter.post('/mock/evaluate', authMiddleware as any, evaluateAnswerController as any);
interviewRouter.post('/mock/save', authMiddleware as any, saveMockInterviewController as any);
interviewRouter.get('/mock', authMiddleware as any, getAllMockInterviewsController as any);
interviewRouter.delete('/mock/:id', authMiddleware as any, deleteMockInterviewController as any);

// Dynamic Adaptive Questioning & Analytics Dashboard
interviewRouter.post('/mock/next-question', authMiddleware as any, getNextQuestionController as any);
interviewRouter.get('/analytics', authMiddleware as any, getUserAnalyticsController as any);

export default interviewRouter;
