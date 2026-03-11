const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");

const interviewRouter = express.Router();

// FAANG Upgrade: Strict File Filtering (Only PDFs allowed, max 5MB)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only PDF files are allowed."), false);
        }
    }
});

// FAANG Upgrade: Rate Limiter (Max 5 reports per hour per IP)
const aiGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { message: "Too many reports generated. Please try again after an hour to conserve API limits." },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description, resume pdf and job description.
 * @access private
 */
interviewRouter.post("/", authMiddleware, aiGenerationLimiter, upload.single("resume"), interviewController.generateInterViewReportController);

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware, interviewController.getInterviewReportByIdController);

/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware, interviewController.getAllInterviewReportsController);

/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware, interviewController.generateResumePdfController);

/**
 * @route DELETE /api/interview/:id
 * @description Delete a specific interview report belonging to the user.
 * @access private
 */
interviewRouter.delete("/:id", authMiddleware, interviewController.deleteInterviewReportController);

/**
 * 🔥 NEW FAANG FEATURE: Toggle Task Tracker
 * @route PATCH /api/interview/:id/task
 * @description Toggle a task completion status in the preparation roadmap
 * @access private
 */
interviewRouter.patch("/:id/task", authMiddleware, interviewController.toggleTaskCompletionController);

/**
 * 🔥 NEW FAANG FEATURE: Evaluate Mock Interview Answer
 * @route POST /api/interview/mock/evaluate
 * @description Send a single QA pair to Gemini for a score and feedback
 * @access private
 */
interviewRouter.post("/mock/evaluate", authMiddleware, interviewController.evaluateAnswerController);

/**
 * 🔥 NEW FAANG FEATURE: Save Mock Interview Results
 * @route POST /api/interview/mock/save
 * @description Save the final completed mock interview to the database
 * @access private
 */
interviewRouter.post("/mock/save", authMiddleware, interviewController.saveMockInterviewController);

/**
 * 🔥 NEW FAANG FEATURE: Get All Mock Interviews
 * @route GET /api/interview/mock
 * @description Fetch all completed mock interviews for the dashboard
 * @access private
 */
interviewRouter.get("/mock", authMiddleware, interviewController.getAllMockInterviewsController);

/**
 * 🔥 NEW FAANG FEATURE: Delete Mock Interview
 * @route DELETE /api/interview/mock/:id
 * @description Delete a specific mock interview
 * @access private
 */
interviewRouter.delete("/mock/:id", authMiddleware, interviewController.deleteMockInterviewController);

module.exports = interviewRouter;