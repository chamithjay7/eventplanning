import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://localhost:8081";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg("");
        setToken(null);
        setLoading(true);
        try {
            const res = await axios.post(`${API}/api/auth/forgot-password`, { email });
            setToken(res.data?.token || null);
            setMsg(res.data?.message || "Password reset link created");
        } catch (err: any) {
            setMsg(err?.response?.data?.message || "Failed to request reset");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <h3>Forgot Password</h3>

            <form onSubmit={handleSubmit} className="mt-3">
                <div className="mb-3">
                    <label className="form-label">Enter your email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        required
                    />
                </div>
                <button className="btn btn-primary" disabled={loading}>
                    {loading ? "Requesting..." : "Request Reset"}
                </button>
            </form>

            {msg && <div className="alert alert-info mt-3">{msg}</div>}

            {/* Dev/testing UX: show token and a direct link to Reset page */}
            {token && (
                <div className="card p-3 mt-3">
                    <div className="mb-2">
                        <b>Reset Token:</b>
                        <div className="small mt-1">
                            <code>{token}</code>
                        </div>
                    </div>
                    <Link
                        className="btn btn-success"
                        to={`/reset-password?token=${encodeURIComponent(token)}`}
                    >
                        Go to Reset Password
                    </Link>
                </div>
            )}
        </div>
    );
}
