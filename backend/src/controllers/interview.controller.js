const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf, evaluateMockInterviewAnswer } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");
const mockInterviewModel = require("../models/mockInterview.model");

async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body;
        const hasFile = !!req.file;
        const hasSelfDescription = !!selfDescription && selfDescription.trim().length > 0;

        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is required." });
        }

        if (!hasFile && !hasSelfDescription) {
            return res.status(400).json({ message: "Please provide either a Resume PDF or a Quick Self Description." });
        }

        let resumeContentText = "";
        if (hasFile) {
            if (typeof pdfParse === "function") {
                const parsedPdf = await pdfParse(req.file.buffer);
                resumeContentText = parsedPdf.text;
            } else if (pdfParse && pdfParse.PDFParse) {
                const parsedPdf = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
                resumeContentText = parsedPdf.text || parsedPdf;
            } else if (pdfParse && typeof pdfParse.default === "function") {
                 const parsedPdf = await pdfParse.default(req.file.buffer);
                 resumeContentText = parsedPdf.text;
            } else {
                 throw new Error("PDF parser could not be initialized.");
            }
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContentText,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContentText,
            selfDescription,
            jobDescription,
            title: interViewReportByAi.title || "Interview Report",
            ...interViewReportByAi
        });

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });

    } catch (error) {
        console.error("Generate Report Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id });

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." });
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Get Report Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });
    } catch (error) {
        console.error("Get All Reports Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id });

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error("Generate Resume PDF Error:", error);
        res.status(500).json({ message: "Server error while generating PDF", error: error.message });
    }
}

async function deleteInterviewReportController(req, res) {
    try {
        const { id } = req.params;

        const deletedReport = await interviewReportModel.findOneAndDelete({ 
            _id: id, 
            user: req.user.id 
        });

        if (!deletedReport) {
            return res.status(404).json({ message: "Report not found or you are not authorized to delete it." });
        }

        res.status(200).json({ message: "Interview report deleted successfully." });
    } catch (error) {
        console.error("Delete Report Error:", error);
        res.status(500).json({ message: "Server error while deleting report", error: error.message });
    }
}

async function toggleTaskCompletionController(req, res) {
    try {
        const { id } = req.params;
        const { taskString } = req.body;

        if (!taskString) {
            return res.status(400).json({ message: "Task string is required" });
        }

        const report = await interviewReportModel.findOne({ _id: id, user: req.user.id });
        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        }

        const isCompleted = report.completedTasks.includes(taskString);
        
        const updatedReport = await interviewReportModel.findOneAndUpdate(
            { _id: id, user: req.user.id },
            isCompleted 
                ? { $pull: { completedTasks: taskString } } 
                : { $push: { completedTasks: taskString } }, 
            { new: true } 
        );

        res.status(200).json({ 
            message: "Task toggled successfully", 
            completedTasks: updatedReport.completedTasks 
        });

    } catch (error) {
        console.error("Toggle Task Error:", error);
        res.status(500).json({ message: "Server error while updating task", error: error.message });
    }
}

async function evaluateAnswerController(req, res) {
    try {
        const { question, userAnswer, jobTitle } = req.body;

        if (!question || !userAnswer || !jobTitle) {
            return res.status(400).json({ message: "Question, userAnswer, and jobTitle are required." });
        }

        const evaluation = await evaluateMockInterviewAnswer({ question, userAnswer, jobTitle });

        res.status(200).json({ message: "Evaluation successful", evaluation });
    } catch (error) {
        console.error("Evaluate Answer Error:", error);
        res.status(500).json({ message: "Server error evaluating answer", error: error.message });
    }
}

async function saveMockInterviewController(req, res) {
    try {
        const { interviewReportId, jobTitle, qaList, totalScore } = req.body;

        if (!interviewReportId || !qaList || totalScore === undefined) {
            return res.status(400).json({ message: "Missing required fields to save mock interview." });
        }

        const newMockInterview = await mockInterviewModel.create({
            user: req.user.id,
            interviewReport: interviewReportId,
            jobTitle,
            qaList,
            totalScore
        });

        res.status(201).json({ 
            message: "Mock interview saved successfully!", 
            mockInterview: newMockInterview 
        });
    } catch (error) {
        console.error("Save Mock Interview Error:", error);
        res.status(500).json({ message: "Server error saving mock interview", error: error.message });
    }
}

async function getAllMockInterviewsController(req, res) {
    try {
        const mockInterviews = await mockInterviewModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Mock interviews fetched successfully.",
            mockInterviews
        });
    } catch (error) {
        console.error("Get All Mock Interviews Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function deleteMockInterviewController(req, res) {
    try {
        const { id } = req.params;
        const deletedMock = await mockInterviewModel.findOneAndDelete({ _id: id, user: req.user.id });

        if (!deletedMock) {
            return res.status(404).json({ message: "Mock interview not found or unauthorized." });
        }

        res.status(200).json({ message: "Mock interview deleted successfully." });
    } catch (error) {
        console.error("Delete Mock Interview Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    deleteInterviewReportController,
    toggleTaskCompletionController,
    evaluateAnswerController,
    getAllMockInterviewsController,
    deleteMockInterviewController,
    saveMockInterviewController
};