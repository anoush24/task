import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, UserCheck, ShieldCheck, ArrowRight, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState("user");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setAuth, auth } = useAuth();

    useEffect(() => {
        if (auth?.accessToken && auth?.user) {
            navigate(auth.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
        }
    }, [auth, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        const endpoint = isLogin ? "/auth/login" : "/auth/register";
        const payload = isLogin ? { email, password } : { name, email, password, role };

        try {
            const { data, status } = await api.post(endpoint, payload);

            if (status === 200 || status === 201) {
                if (isLogin) {
                    setAuth({ user: data.user, accessToken: data.accessToken, role: data.user.role });
                    localStorage.setItem("auth", JSON.stringify({ token: data.accessToken, user: data.user }));
                    navigate(data.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
                } else {
                    setSuccess("Account created! Please log in.");
                    setIsLogin(true);
                    setPassword("");
                    setName("");
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "Authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 font-sans selection:bg-cyan-500/30">
            <motion.div
                layout
                className="relative w-full max-w-4xl bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex border border-gray-800"
            >
                {/* Branding Panel */}
                <motion.div
                    animate={{ x: isLogin ? "0%" : "166.6%" }}
                    transition={{ type: "spring", stiffness: 40, damping: 14 }}
                    className="hidden md:flex w-[40%] p-12 text-white flex-col justify-between relative z-20 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-cyan-700 to-teal-900" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-16">
                            <div className="bg-white/20 p-2.5 rounded-xl">
                                <CheckSquare size={22} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-white">TaskFlow</h1>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? "l" : "r"}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <h2 className="font-heading font-black text-6xl tracking-tighter mb-6 leading-[0.9] text-white">
                                    {isLogin ? <>Welcome <br /> Back.</> : <>Get <br /> Started.</>}
                                </h2>
                                <p className="text-cyan-100/50 text-base font-medium leading-relaxed max-w-[240px]">
                                    {isLogin
                                        ? "Resume your dashboard and track your daily performance."
                                        : "Create your profile and enter the productivity oasis."}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <p className="relative z-10 text-[10px] font-bold text-cyan-200/30 uppercase tracking-widest">
                        TaskFlow API Demo // 2026
                    </p>
                </motion.div>

                {/* Form Panel */}
                <motion.div
                    animate={{ x: isLogin ? "0%" : "-60%" }}
                    transition={{ type: "spring", stiffness: 40, damping: 14 }}
                    className="w-full md:w-[60%] p-8 md:p-14"
                >
                    <div className="max-w-sm mx-auto">
                        <div className="mb-10">
                            <div className="flex items-center gap-2 md:hidden mb-6">
                                <CheckSquare size={20} className="text-cyan-500" />
                                <span className="font-black text-white text-lg">TaskFlow</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-1">
                                {isLogin ? "Sign In" : "Create Account"}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {isLogin ? "Enter your credentials to continue." : "Fill in the details below."}
                            </p>
                        </div>

                        {/* Role selector (register only) */}
                        {!isLogin && (
                            <div className="flex gap-3 mb-7">
                                <RoleBtn selected={role === "user"} onClick={() => setRole("user")} icon={<UserCheck size={16} />} label="User" />
                                <RoleBtn selected={role === "admin"} onClick={() => setRole("admin")} icon={<ShieldCheck size={16} />} label="Admin" />
                            </div>
                        )}

                        {/* Feedback messages */}
                        {error && (
                            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm">
                                {success}
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {!isLogin && (
                                <Field label="Full Name" type="text" placeholder="John Doe" icon={<User size={15} />}
                                    value={name} onChange={(e) => setName(e.target.value)} />
                            )}
                            <Field label="Email" type="email" placeholder="john@example.com" icon={<Mail size={15} />}
                                value={email} onChange={(e) => setEmail(e.target.value)} />
                            <Field label="Password" type="password" placeholder="••••••••" icon={<Lock size={15} />}
                                value={password} onChange={(e) => setPassword(e.target.value)} />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group mt-2 shadow-lg shadow-cyan-500/20"
                            >
                                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        <div className="mt-8 pt-7 border-t border-gray-800 text-center">
                            <p className="text-gray-500 text-sm">
                                {isLogin ? "Don't have an account?" : "Already have one?"}{" "}
                                <button
                                    onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
                                    className="text-cyan-500 font-bold hover:text-cyan-400 ml-1 transition-colors"
                                >
                                    {isLogin ? "Register" : "Sign in"}
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

const RoleBtn = ({ selected, onClick, icon, label }) => (
    <button type="button" onClick={onClick}
        className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${selected
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                : "border-gray-700 text-gray-500 hover:border-gray-600"
            }`}
    >
        {icon} {label}
    </button>
);

const Field = ({ label, icon, placeholder, type = "text", value, onChange }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">{label}</label>
        <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                {icon}
            </div>
            <input type={type} placeholder={placeholder} value={value} onChange={onChange} required
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 focus:border-cyan-500/50 rounded-xl text-sm text-white focus:outline-none transition-all placeholder:text-gray-600"
            />
        </div>
    </div>
);

export default Login;