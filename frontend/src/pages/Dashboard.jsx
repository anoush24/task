import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  Plus, LogOut, CheckSquare, Clock, CircleCheck, AlertCircle,
  Pencil, Trash2, X, ChevronDown, Filter, Shield
} from "lucide-react";

const STATUS_COLORS = {
  "todo": "bg-gray-700 text-gray-300",
  "in-progress": "bg-amber-500/20 text-amber-400",
  "done": "bg-emerald-500/20 text-emerald-400",
};

const PRIORITY_COLORS = {
  low: "bg-blue-500/10 text-blue-400",
  medium: "bg-amber-500/10 text-amber-400",
  high: "bg-red-500/10 text-red-400",
};

const Dashboard = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = auth?.user?.role === "admin";

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [page, setPage] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", status: "todo", priority: "medium", dueDate: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Stats (admin only)
  const [stats, setStats] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 8 });
      if (filterStatus) params.append("status", filterStatus);
      if (filterPriority) params.append("priority", filterPriority);
      const { data } = await api.get(`/tasks?${params}`);
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterPriority]);

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const { data } = await api.get("/tasks/admin/stats");
      setStats(data);
    } catch {}
  }, [isAdmin]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: "", description: "", status: "todo", priority: "medium", dueDate: "" });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask._id}`, form);
      } else {
        await api.post("/tasks", form);
      }
      setShowModal(false);
      fetchTasks();
      if (isAdmin) fetchStats();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
      if (isAdmin) fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-cyan-500/30">

  {/* Header Styling */}
  <header className="border-b border-gray-800/50 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
          <CheckSquare size={20} className="text-cyan-500" />
        </div>
        <span className="font-heading font-black text-xl tracking-tighter uppercase">TaskFlow</span>
        {isAdmin && (
          <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-black tracking-widest ml-2">
            ADMIN
          </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">
              Hey, <span className="text-white font-semibold">{auth?.user?.name?.split(" ")[0]}</span>
            </span>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Admin stats */}
        {isAdmin && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Tasks" value={stats.totalTasks} color="text-white" />
            {stats.byStatus.map((s) => (
              <StatCard key={s._id} label={s._id} value={s.count} color={s._id === "done" ? "text-emerald-400" : "text-amber-400"} />
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{isAdmin ? "All Tasks" : "My Tasks"}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {pagination.total ?? 0} task{pagination.total !== 1 ? "s" : ""}
              {isAdmin ? " across all users" : ""}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              options={[["", "All Status"], ["todo", "To Do"], ["in-progress", "In Progress"], ["done", "Done"]]}
            />
            <Select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
              options={[["", "All Priority"], ["low", "Low"], ["medium", "Medium"], ["high", "High"]]}
            />
            <button onClick={openCreate}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-500/20"
            >
              <Plus size={16} /> New Task
            </button>
          </div>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <CheckSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No tasks found</p>
            <p className="text-sm mt-1">Create your first task to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} isAdmin={isAdmin}
                onEdit={() => openEdit(task)} onDelete={() => handleDelete(task._id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  page === p ? "bg-cyan-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >{p}</button>
            ))}
          </div>
        )}
      </main>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion_div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">{editTask ? "Edit Task" : "New Task"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Title">
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title" required
                  className="w-full bg-gray-800 border border-gray-700 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                />
              </FormField>

              <FormField label="Description">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description" rows={3}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Status">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </FormField>

                <FormField label="Priority">
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Due Date">
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                />
              </FormField>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm font-medium transition-all"
                >Cancel</button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-white text-sm font-bold transition-all"
                >
                  {formLoading ? "Saving..." : editTask ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion_div>
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task, isAdmin, onEdit, onDelete }) => (
  <div className="bg-[#111114] border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] rounded-2xl p-6 flex flex-col gap-4 group relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
    {/* Subtle glow effect on hover */}
    <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-all" />

    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${STATUS_COLORS[task.status]}`}>
          {task.status}
        </span>
        <h3 className="font-heading font-extrabold text-lg tracking-tight leading-tight pt-2 group-hover:text-cyan-400 transition-colors">
          {task.title}
        </h3>
      </div>
      
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
        <button onClick={onEdit} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-all">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-all">
          <Trash2 size={14} />
        </button>
      </div>
    </div>

    <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2">
      {task.description || "No additional parameters provided for this entry."}
    </p>

    <div className="mt-auto pt-4 border-t border-gray-800/50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
          <Clock size={12} className="text-gray-700" />
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
        </div>
        <div className={`text-[10px] font-black uppercase tracking-wider ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </div>
      </div>
    </div>
    
    {isAdmin && task.owner && (
      <div className="mt-2 text-[9px] font-bold text-gray-700 uppercase tracking-[0.2em]">
        Operator: {task.owner.name}
      </div>
    )}
  </div>
);

const StatCard = ({ label, value, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1 font-bold">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

const Select = ({ value, onChange, options }) => (
  <div className="relative">
    <select value={value} onChange={onChange}
      className="appearance-none bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
    >
      {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
    </select>
    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
  </div>
);

const FormField = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">{label}</label>
    {children}
  </div>
);

// Simple div wrapper to avoid importing motion just for modal
const motion_div = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export default Dashboard;