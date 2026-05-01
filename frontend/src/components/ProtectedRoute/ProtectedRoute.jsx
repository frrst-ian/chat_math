import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading">Loading...</div>;
    if (!user) return <Navigate to="/auth" replace />;
    return children;
};

export default ProtectedRoute;