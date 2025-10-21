import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg("");
        setLoading(true);
        try {
            const res = await api.post("/api/auth/login", { username, password });
            const { token, role } = res.data;

            // Save token and role
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            navigate("/dashboard");
        } catch (err: any) {
            const m =
                err?.response?.data?.message ||
                err?.message ||
                "Login failed";
            setMsg(m);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10 col-xl-9">
                        <div className="card border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
                            <div className="row g-0">
                                {/* Left Side - Branding */}
                                <div className="col-lg-5 d-none d-lg-block" style={{
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white"
                                }}>
                                    <div className="p-5 d-flex flex-column justify-content-center h-100">
                                        <div className="mb-4">
                                            <h1 className="display-4 fw-bold mb-3">
                                                EventEase
                                            </h1>
                                            <p className="lead mb-4">
                                                Your all-in-one platform for seamless event management
                                            </p>
                                        </div>

                                        <div className="mb-4">
                                            <div className="d-flex align-items-start mb-3">
                                                <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3" style={{ width: "40px", height: "40px" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>📅</span>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">Organize Events</h6>
                                                    <small className="text-white-50">Create and manage events effortlessly</small>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-start mb-3">
                                                <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3" style={{ width: "40px", height: "40px" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>🎫</span>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">Book Tickets</h6>
                                                    <small className="text-white-50">Easy ticket booking and management</small>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-start mb-3">
                                                <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3" style={{ width: "40px", height: "40px" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>🏪</span>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">Find Vendors</h6>
                                                    <small className="text-white-50">Connect with trusted vendors and venues</small>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-start">
                                                <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3" style={{ width: "40px", height: "40px" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>📊</span>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">Track Everything</h6>
                                                    <small className="text-white-50">Comprehensive analytics and insights</small>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <p className="small text-white-50 mb-0">
                                                © 2025 EventEase. All rights reserved.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Login Form */}
                                <div className="col-lg-7">
                                    <div className="p-5">
                                        <div className="text-center mb-4">
                                            <div className="mb-3">
                                                <div
                                                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                                    style={{
                                                        width: "70px",
                                                        height: "70px",
                                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                    }}
                                                >
                                                    <span style={{ fontSize: "2rem", color: "white" }}>🎉</span>
                                                </div>
                                            </div>
                                            <h2 className="fw-bold mb-2">Welcome Back!</h2>
                                            <p className="text-muted">Sign in to continue to EventEase</p>
                                        </div>

                                        {msg && (
                                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                                <strong>Error!</strong> {msg}
                                                <button type="button" className="btn-close" onClick={() => setMsg("")}></button>
                                            </div>
                                        )}

                                        <form onSubmit={handleLogin}>
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold text-muted small">
                                                    USERNAME
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <span>👤</span>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control border-start-0 ps-0"
                                                        placeholder="Enter your username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold text-muted small">
                                                    PASSWORD
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <span>🔒</span>
                                                    </span>
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className="form-control border-start-0 border-end-0 ps-0"
                                                        placeholder="Enter your password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                        disabled={loading}
                                                    />
                                                    <span
                                                        className="input-group-text bg-light border-start-0"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        <span>{showPassword ? "👁️" : "👁️‍🗨️"}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-4 text-end">
                                                <Link
                                                    to="/forgot-password"
                                                    className="text-decoration-none small"
                                                    style={{ color: "#667eea" }}
                                                >
                                                    Forgot Password?
                                                </Link>
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-lg w-100 text-white mb-4"
                                                disabled={loading}
                                                style={{
                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                    border: "none"
                                                }}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Signing in...
                                                    </>
                                                ) : (
                                                    "Sign In"
                                                )}
                                            </button>

                                            <div className="text-center">
                                                <p className="text-muted mb-0">
                                                    Don't have an account?{" "}
                                                    <Link
                                                        to="/register"
                                                        className="text-decoration-none fw-semibold"
                                                        style={{ color: "#667eea" }}
                                                    >
                                                        Create Account
                                                    </Link>
                                                </p>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
