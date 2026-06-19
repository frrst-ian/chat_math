import { Routes, Route, Navigate } from "react-router-dom";
import NewChat from "./pages/NewChat/NewChat";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Auth from "./pages/Auth/Auth";
import Settings from "./pages/Settings/Settings";
import Recommendations from "./pages/Recommendations/Recommendations";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route
                    path="new-chat"
                    element={
                        <ProtectedRoute>
                            <NewChat />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="recommendations"
                    element={
                        <ProtectedRoute>
                            <Recommendations />
                        </ProtectedRoute>
                    }
                />
            </Route>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
    );
};

export default AppRoutes;
