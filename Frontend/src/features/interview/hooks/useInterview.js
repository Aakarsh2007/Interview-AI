import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"
import toast from 'react-hot-toast' // <-- NEW IMPORT

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        const loadingToast = toast.loading("Analyzing profile & generating strategy...") // Show loading toast
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            
            // UX Polish: Clear auto-saved form data after successful generation!
            localStorage.removeItem("jobDescription")
            localStorage.removeItem("selfDescription")
            
            toast.success("Strategy generated successfully!", { id: loadingToast }) // Update toast on success
            return response.interviewReport
        } catch (error) {
            console.log("Generate Report Error:", error)
            toast.error(error.response?.data?.message || "Failed to generate report. Please check your inputs.", { id: loadingToast }) // Update toast on error
            return null;
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.log("Get Report Error:", error)
            toast.error(error.response?.data?.message || "Failed to fetch report.");
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            console.log("Get All Reports Error:", error)
            toast.error("Failed to fetch reports.");
        } finally {
            setLoading(false)
        }
    }

    // NEW FAANG FEATURE: Delete Report
    const deleteReport = async (id) => {
        try {
            await deleteInterviewReport(id)
            // Optimistic UI Update: Remove it from the list instantly without reloading
            setReports(prevReports => prevReports.filter(report => report._id !== id))
            toast.success("Report deleted successfully.") // Success toast
        } catch (error) {
            console.log("Delete Report Error:", error)
            toast.error("Failed to delete report.");
        }
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        const loadingToast = toast.loading("Generating custom PDF...")
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            toast.success("PDF Downloaded!", { id: loadingToast })
        }
        catch (error) {
            console.log("Generate PDF Error:", error)
            toast.error("Failed to generate PDF.", { id: loadingToast });
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, deleteReport }
}