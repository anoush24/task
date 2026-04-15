import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true, // send httpOnly refresh token cookie
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Auto-refresh 
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original.url.includes("/auth/refresh") && !original._retry) {
      original._retry = true;
      try {
        const { data } = await api.get("/auth/refresh");
        const auth = JSON.parse(localStorage.getItem("auth") || "{}");
        auth.token = data.accessToken;
        localStorage.setItem("auth", JSON.stringify(auth));
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem("auth");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;