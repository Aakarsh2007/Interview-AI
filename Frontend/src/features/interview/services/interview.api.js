import axios from "axios";

const api = axios.create({
    baseURL: "https://interview-ai-backend-z9lt.onrender.com",
    withCredentials: true
});

export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    if (resumeFile) {
        formData.append("resume", resumeFile);
    }

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
};

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data;
};

export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/");
    return response.data;
};

export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    });
    return response.data;
};

export const deleteInterviewReport = async (id) => {
    const response = await api.delete(`/api/interview/${id}`);
    return response.data;
};

export const toggleTaskCompletion = async (id, taskString) => {
    const response = await api.patch(`/api/interview/${id}/task`, { taskString });
    return response.data;
};

export const evaluateMockAnswer = async ({ question, userAnswer, jobTitle }) => {
    const response = await api.post("/api/interview/mock/evaluate", { question, userAnswer, jobTitle });
    return response.data;
};

export const saveMockInterview = async ({ interviewReportId, jobTitle, qaList, totalScore }) => {
    const response = await api.post("/api/interview/mock/save", { interviewReportId, jobTitle, qaList, totalScore });
    return response.data;
};

export const getAllMockInterviews = async () => {
    const response = await api.get("/api/interview/mock");
    return response.data;
};

export const deleteMockInterview = async (id) => {
    const response = await api.delete(`/api/interview/mock/${id}`);
    return response.data;
};