const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        // 1. Safety Check: Did they actually upload a file?
        if (!req.file) {
            return res.status(400).json({ message: "Resume PDF file is required." });
        }

        const { selfDescription, jobDescription } = req.body;
        if (!selfDescription || !jobDescription) {
            return res.status(400).json({ message: "Self description and job description are required." });
        }

        // 2. Bulletproof PDF Parsing (Handles different versions of the pdf-parse package)
        let resumeContentText = "";
        if (typeof pdfParse === "function") {
            // Standard parsing
            const parsedPdf = await pdfParse(req.file.buffer);
            resumeContentText = parsedPdf.text;
        } else if (pdfParse && pdfParse.PDFParse) {
            // Fallback to your original custom logic
            const parsedPdf = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
            resumeContentText = parsedPdf.text || parsedPdf;
        } else if (pdfParse && typeof pdfParse.default === "function") {
             // Final safety net
             const parsedPdf = await pdfParse.default(req.file.buffer);
             resumeContentText = parsedPdf.text;
        } else {
             throw new Error("PDF parser could not be initialized.");
        }

        // 3. Call the AI Service
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContentText,
            selfDescription,
            jobDescription
        });

        // 4. Save to Database
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContentText,
            selfDescription,
            jobDescription,
            title: interViewReportByAi.title || "Interview Report", // Fallback just in case
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

/**
 * @description Controller to get interview report by interviewId.
 */
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

/** * @description Controller to get all interview reports of logged in user.
 */
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

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
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

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};