import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";
import MockInterviewArena from "./features/interview/pages/MockInterviewArena";
import MockInterviewResult from "./features/interview/pages/MockInterviewResult"; // 🔥 NEW IMPORT

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/",
        element: (
            <Protected>
                <Home />
            </Protected>
        )
    },
    {
        path: "/interview/:interviewId",
        element: (
            <Protected>
                <Interview />
            </Protected>
        )
    },
    {
        path: "/mock-interview/:interviewId",
        element: (
            <Protected>
                <MockInterviewArena />
            </Protected>
        )
    },
    {
        // 🔥 NEW ROUTE FOR MOCK RESULTS
        path: "/mock-result",
        element: (
            <Protected>
                <MockInterviewResult />
            </Protected>
        )
    }
]);