import { Routes, Route, Navigate } from "react-router-dom";
import NewChat from "./pages/NewChat/NewChat";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
// import NotFound from "./components/NotFound/NotFound";
import Auth from "./pages/Auth/Auth";
import Settings from "./pages/Settings/Settings";

const AppRoutes = () => {
    return (
        <Routes>
            {/*<Route path="*" element={<NotFound />} />*/}
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
            </Route>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
    );
};

export default AppRoutes;
