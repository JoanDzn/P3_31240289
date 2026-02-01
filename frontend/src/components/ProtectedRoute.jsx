import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return (
        <div className="center-screen">
            <h1 style={{ color: '#ff6b00', marginRight: '1rem' }}>JOAN'S FIX</h1>
            <div className="spinner"></div>
        </div>
    );

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return <Outlet />;
}

export default ProtectedRoute;
