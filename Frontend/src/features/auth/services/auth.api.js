import axios from "axios"

const api = axios.create({
    baseURL: "https://interview-ai-backend-z9lt.onrender.com/",
    withCredentials: true
})

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        return response.data
    } catch (err) {
        console.log(err)
        throw err; 
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })
        return response.data
    } catch (err) {
        console.log(err)
        throw err;
    }
}

export async function logout() {
    try {
        const response = await api.post("/api/auth/logout")
        return response.data
    } catch (err) {
        console.log(err)
        throw err;
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/me")
        return response.data
    } catch (err) {
        console.log(err)
        throw err;
    }
}

export async function forgotPassword(email) {
    try {
        const response = await api.post("/api/auth/forgot-password", { email });
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export async function resetPassword({ email, otp, newPassword }) {
    try {
        const response = await api.post("/api/auth/reset-password", { email, otp, newPassword });
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}