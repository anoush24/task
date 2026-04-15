import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { auth, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!auth?.accessToken) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(auth.user?.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default ProtectedRoute;