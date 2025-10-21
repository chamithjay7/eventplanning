import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081",
    withCredentials: false // IMPORTANT: matches allowCredentials=false above
});

api.interceptors.request.use((config) => {
    const t = localStorage.getItem("token");
    if (t) {
        config.headers = config.headers ?? {};
        (config.headers as any)["Authorization"] = `Bearer ${t}`;
    }
    return config;
});

export default api;
