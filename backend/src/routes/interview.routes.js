const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");

const interviewRouter = express.Router();

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only PDF files are allowed."), false);
        }
    }
});

const aiGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { message: "Too many reports generated. Please try again after an hour to conserve API limits." },
    standardHeaders: true,
    legacyHeaders: false,
});

interviewRouter.post("/", authMiddleware, aiGenerationLimiter, upload.single("resume"), interviewController.generateInterViewReportController);

interviewRouter.get("/report/:interviewId", authMiddleware, interviewController.getInterviewReportByIdController);

interviewRouter.get("/", authMiddleware, interviewController.getAllInterviewReportsController);

interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware, interviewController.generateResumePdfController);

interviewRouter.delete("/:id", authMiddleware, interviewController.deleteInterviewReportController);

interviewRouter.patch("/:id/task", authMiddleware, interviewController.toggleTaskCompletionController);

interviewRouter.post("/mock/evaluate", authMiddleware, interviewController.evaluateAnswerController);

interviewRouter.post("/mock/save", authMiddleware, interviewController.saveMockInterviewController);

interviewRouter.get("/mock", authMiddleware, interviewController.getAllMockInterviewsController);

interviewRouter.delete("/mock/:id", authMiddleware, interviewController.deleteMockInterviewController);

module.exports = interviewRouter;