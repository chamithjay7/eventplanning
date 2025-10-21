const API_BASE = "http://localhost:8081";

function saveToken(token) {
    localStorage.setItem("token", token);
}

function getToken() {
    return localStorage.getItem("token");
}

function clearToken() {
    localStorage.removeItem("token");
}

async function apiRequest(path, options = {}) {
    const token = getToken();
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(API_BASE + path, { ...options, headers });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed: " + res.status);
    }
    return res.json();
}
