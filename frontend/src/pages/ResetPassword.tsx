import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";

const API = "http://localhost:8081";

export default function ResetPassword() {
    const location = useLocation();
    const urlToken = useMemo(() => {
        const sp = new URLSearchParams(location.search);
        const t = sp.get("token");
        return t ?? "";
    }, [location.search]);

    const [token, setToken] = useState(urlToken);
    const [newPassword, setNewPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Keep state in sync if URL changes
    useEffect(() => {
        setToken(urlToken);
    }, [urlToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg("");
        setLoading(true);
        try {
            await axios.post(`${API}/api/auth/reset-password`, { token, newPassword });
            setMsg("Password reset successful. You can login now.");
            setNewPassword("");
        } catch (err: any) {
            setMsg(err?.response?.data?.message || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    const hasTokenFromUrl = !!urlToken;

    return (
        <div className="container py-5">
            <h3>Reset Password</h3>

            <form onSubmit={handleSubmit} className="mt-3">
                {/* If token is present in URL, show it read-only; otherwise allow manual input */}
                <div className="mb-3">
                    <label className="form-label">Reset Token</label>
                    <input
                        className="form-control"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        readOnly={hasTokenFromUrl}
                        placeholder="Paste your reset token"
                        required
                    />
                    {hasTokenFromUrl && (
                        <div className="form-text">Token loaded from the link.</div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e)=>setNewPassword(e.target.value)}
                        minLength={4}
                        required
                    />
                </div>

                <button className="btn btn-success" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>

            {msg && (
                <div className="alert alert-info mt-3">
                    {msg}{" "}
                    {msg.toLowerCase().includes("successful") && (
                        <span>
              Go to <Link to="/login">Login</Link>.
            </span>
                    )}
                </div>
            )}
        </div>
    );
}
