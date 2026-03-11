import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})

/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    if (resumeFile) {
        formData.append("resume", resumeFile)
    }

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data
}

/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)
    return response.data
}

/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")
    return response.data
}

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })
    return response.data
}

/**
 * @description Service to delete a specific interview report.
 */
export const deleteInterviewReport = async (id) => {
    const response = await api.delete(`/api/interview/${id}`)
    return response.data
}

/**
 * 🔥 FAANG FEATURE: Toggle Task Tracker
 * @description Service to toggle a task completion status in the preparation roadmap
 */
export const toggleTaskCompletion = async (id, taskString) => {
    const response = await api.patch(`/api/interview/${id}/task`, { taskString })
    return response.data
}

/**
 * 🔥 NEW FAANG FEATURE: Evaluate Mock Interview Answer
 * @description Send a single QA pair to Gemini for a score and feedback (Stateless)
 */
export const evaluateMockAnswer = async ({ question, userAnswer, jobTitle }) => {
    const response = await api.post("/api/interview/mock/evaluate", { question, userAnswer, jobTitle })
    return response.data
}

/**
 * 🔥 NEW FAANG FEATURE: Save Mock Interview Results
 * @description Save the final completed mock interview to the database
 */
export const saveMockInterview = async ({ interviewReportId, jobTitle, qaList, totalScore }) => {
    const response = await api.post("/api/interview/mock/save", { interviewReportId, jobTitle, qaList, totalScore })
    return response.data
}

/**
 * 🔥 NEW FAANG FEATURE: Get All Mock Interviews
 * @description Fetch all completed mock interviews for the dashboard
 */
export const getAllMockInterviews = async () => {
    const response = await api.get("/api/interview/mock")
    return response.data
}

/**
 * 🔥 NEW FAANG FEATURE: Delete Mock Interview
 * @description Delete a specific mock interview from the database
 */
export const deleteMockInterview = async (id) => {
    const response = await api.delete(`/api/interview/mock/${id}`)
    return response.data
}