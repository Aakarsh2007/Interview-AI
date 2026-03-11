import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport, toggleTaskCompletion, evaluateMockAnswer, saveMockInterview } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"
import toast from 'react-hot-toast' 

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        const loadingToast = toast.loading("Analyzing profile & generating strategy...") 
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            
            // UX Polish: Clear auto-saved form data after successful generation!
            localStorage.removeItem("jobDescription")
            localStorage.removeItem("selfDescription")
            
            toast.success("Strategy generated successfully!", { id: loadingToast }) 
            return response.interviewReport
        } catch (error) {
            console.log("Generate Report Error:", error)
            toast.error(error.response?.data?.message || "Failed to generate report. Please check your inputs.", { id: loadingToast }) 
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

    const deleteReport = async (id) => {
        try {
            await deleteInterviewReport(id)
            setReports(prevReports => prevReports.filter(report => report._id !== id))
            toast.success("Report deleted successfully.") 
        } catch (error) {
            console.log("Delete Report Error:", error)
            toast.error("Failed to delete report.");
        }
    }

    const toggleTask = async (id, taskString) => {
        try {
            const response = await toggleTaskCompletion(id, taskString);
            setReport(prevReport => ({
                ...prevReport,
                completedTasks: response.completedTasks
            }));
        } catch (error) {
            console.log("Toggle Task Error:", error);
            toast.error("Failed to update task status.");
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

    // 🔥 NEW FAANG FEATURE: Evaluate Single Answer (Stateless, no global loading screen)
    const evaluateAnswer = async ({ question, userAnswer, jobTitle }) => {
        try {
            const response = await evaluateMockAnswer({ question, userAnswer, jobTitle });
            return response.evaluation; // Returns { score, feedback }
        } catch (error) {
            console.log("Evaluate Answer Error:", error);
            toast.error("Failed to evaluate answer. Please try again.");
            return null;
        }
    }

    // 🔥 NEW FAANG FEATURE: Save Final Mock Interview (Stateful, with loading screen)
    const submitMockInterview = async (payload) => {
        setLoading(true);
        const loadingToast = toast.loading("Saving interview results...");
        try {
            const response = await saveMockInterview(payload);
            toast.success("Mock Interview saved successfully!", { id: loadingToast });
            return response.mockInterview;
        } catch (error) {
            console.log("Save Mock Interview Error:", error);
            toast.error("Failed to save mock interview.", { id: loadingToast });
            return null;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    // Export the two new functions!
    return { 
        loading, report, reports, 
        generateReport, getReportById, getReports, getResumePdf, deleteReport, toggleTask, 
        evaluateAnswer, submitMockInterview 
    }
}