import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("USER");
    const [msg, setMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg("");
        setSuccessMsg("");

        // Validation
        if (password !== confirmPassword) {
            setMsg("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setMsg("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/users", { username, email, password, role });
            setSuccessMsg("Registration successful! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err: any) {
            const m =
                err?.response?.data?.message ||
                err?.response?.data?.fields && JSON.stringify(err.response.data.fields) ||
                err?.message ||
                "Registration failed";
            setMsg(m);
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "ADMIN": return "👑";
            case "ORGANIZER": return "📋";
            case "VENDOR": return "🏪";
            case "USER": return "👤";
            default: return "👤";
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
                                                Join Us Today!
                                            </h1>
                                            <p className="lead mb-4">
                                                Create your account and start organizing amazing events
                                            </p>
                                        </div>

                                        <div className="mb-4">
                                            <div className="d-flex align-items-start mb-3">
                                                <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3" style={{ width: "40px", height: "40px" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>✨</span>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">Quick & Easy</h6>
                                                    <small className="text-white-50">Sign up in less than a minute</small>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-start mb-3">
                                                <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3" style={{ width: "40px", height: "40px" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>🎯</span>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">Choose Your Role</h6>
                                                    <small className="text-white-50">Organizer, Vendor, or User - you decide</small>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-start mb-3">
                                                <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3" style={{ width: "40px", height: "40px" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>🔒</span>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">Secure & Safe</h6>
                                                    <small className="text-white-50">Your data is protected and encrypted</small>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-start">
                                                <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3" style={{ width: "40px", height: "40px" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>🎉</span>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">Start Immediately</h6>
                                                    <small className="text-white-50">Begin planning events right away</small>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <p className="small text-white-50 mb-0">
                                                Already have an account?{" "}
                                                <Link to="/login" className="text-white fw-bold text-decoration-none">
                                                    Sign In →
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Registration Form */}
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
                                                    <span style={{ fontSize: "2rem", color: "white" }}>🚀</span>
                                                </div>
                                            </div>
                                            <h2 className="fw-bold mb-2">Create Account</h2>
                                            <p className="text-muted">Fill in the details to get started</p>
                                        </div>

                                        {msg && (
                                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                                <strong>Error!</strong> {msg}
                                                <button type="button" className="btn-close" onClick={() => setMsg("")}></button>
                                            </div>
                                        )}

                                        {successMsg && (
                                            <div className="alert alert-success alert-dismissible fade show" role="alert">
                                                <strong>Success!</strong> {successMsg}
                                            </div>
                                        )}

                                        <form onSubmit={handleRegister}>
                                            {/* Username */}
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold text-muted small">
                                                    USERNAME *
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <span>👤</span>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control border-start-0 ps-0"
                                                        placeholder="Choose a username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold text-muted small">
                                                    EMAIL ADDRESS *
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <span>📧</span>
                                                    </span>
                                                    <input
                                                        type="email"
                                                        className="form-control border-start-0 ps-0"
                                                        placeholder="Enter your email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold text-muted small">
                                                    PASSWORD *
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <span>🔒</span>
                                                    </span>
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className="form-control border-start-0 border-end-0 ps-0"
                                                        placeholder="Create a password (min 6 chars)"
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

                                            {/* Confirm Password */}
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold text-muted small">
                                                    CONFIRM PASSWORD *
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <span>🔑</span>
                                                    </span>
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        className="form-control border-start-0 border-end-0 ps-0"
                                                        placeholder="Re-enter your password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        required
                                                        disabled={loading}
                                                    />
                                                    <span
                                                        className="input-group-text bg-light border-start-0"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        <span>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Role Selection */}
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold text-muted small">
                                                    SELECT YOUR ROLE *
                                                </label>
                                                <div className="row g-2">
                                                    <div className="col-6">
                                                        <div
                                                            className={`card ${role === "USER" ? "border-primary" : "border"} h-100`}
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => setRole("USER")}
                                                        >
                                                            <div className="card-body text-center p-3">
                                                                <div style={{ fontSize: "2rem" }}>👤</div>
                                                                <h6 className="mb-1">User</h6>
                                                                <small className="text-muted">Browse & book events</small>
                                                                {role === "USER" && (
                                                                    <div className="mt-2">
                                                                        <span className="badge bg-primary">Selected</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div
                                                            className={`card ${role === "VENDOR" ? "border-primary" : "border"} h-100`}
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => setRole("VENDOR")}
                                                        >
                                                            <div className="card-body text-center p-3">
                                                                <div style={{ fontSize: "2rem" }}>👤</div>
                                                                <h6 className="mb-1">Vendor</h6>
                                                                <small className="text-muted">Browse & book events</small>
                                                                {role === "VENDOR" && (
                                                                    <div className="mt-2">
                                                                        <span className="badge bg-primary">Selected</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-6">
                                                        <div
                                                            className={`card ${role === "ORGANIZER" ? "border-primary" : "border"} h-100`}
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => setRole("ORGANIZER")}
                                                        >
                                                            <div className="card-body text-center p-3">
                                                                <div style={{ fontSize: "2rem" }}>📋</div>
                                                                <h6 className="mb-1">Organizer</h6>
                                                                <small className="text-muted">Create & manage events</small>
                                                                {role === "ORGANIZER" && (
                                                                    <div className="mt-2">
                                                                        <span className="badge bg-primary">Selected</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/*<div className="col-6">*/}
                                                    {/*    <div*/}
                                                    {/*        className={`card ${role === "ADMIN" ? "border-danger" : "border"} h-100`}*/}
                                                    {/*        style={{ cursor: "pointer" }}*/}
                                                    {/*        onClick={() => setRole("ADMIN")}*/}
                                                    {/*    >*/}
                                                    {/*        <div className="card-body text-center p-3">*/}
                                                    {/*            <div style={{ fontSize: "2rem" }}>👑</div>*/}
                                                    {/*            <h6 className="mb-1">Admin</h6>*/}
                                                    {/*            <small className="text-muted">Full system access</small>*/}
                                                    {/*            {role === "ADMIN" && (*/}
                                                    {/*                <div className="mt-2">*/}
                                                    {/*                    <span className="badge bg-danger">Selected</span>*/}
                                                    {/*                </div>*/}
                                                    {/*            )}*/}
                                                    {/*        </div>*/}
                                                    {/*    </div>*/}
                                                    {/*</div>*/}
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-lg w-100 text-white mb-3"
                                                disabled={loading}
                                                style={{
                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                    border: "none"
                                                }}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Creating Account...
                                                    </>
                                                ) : (
                                                    <>
                                                        🚀 Create Account
                                                    </>
                                                )}
                                            </button>

                                            <div className="text-center">
                                                <p className="text-muted mb-0">
                                                    Already have an account?{" "}
                                                    <Link
                                                        to="/login"
                                                        className="text-decoration-none fw-semibold"
                                                        style={{ color: "#667eea" }}
                                                    >
                                                        Sign In
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
