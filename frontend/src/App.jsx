import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* User dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Admin dashboard  */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="/unauthorized" element={
            <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white text-center">
              <div>
                <h1 className="text-4xl font-black mb-2">403</h1>
                <p className="text-gray-400 mb-4">You don't have permission to view this page.</p>
                <a href="/login" className="text-emerald-500 hover:underline text-sm">Go to Login</a>
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;