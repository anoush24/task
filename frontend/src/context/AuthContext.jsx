import { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ user: null, accessToken: null, role: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            try {
               
                const { data } = await api.get("/auth/refresh");
                setAuth({
                    user: data.user,
                    accessToken: data.accessToken, 
                    role: data.user.role
                });
                localStorage.setItem("auth", JSON.stringify({
                    token: data.accessToken, 
                    user: data.user
                }));
                setAuth({ user: null, accessToken: null, role: null });
                localStorage.removeItem("auth");
            } finally {
                setLoading(false);
            }
        };
        restoreSession();
    }, []);

    const logout = async () => {
        try { await api.post("/auth/logout"); } catch { }
        setAuth({ user: null, accessToken: null, role: null });
        localStorage.removeItem("auth");
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);