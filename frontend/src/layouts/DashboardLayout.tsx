import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

export default function DashboardLayout({ children }: PropsWithChildren) {
    const [role, setRole] = useState<string | null>(null);
    const [hasToken, setHasToken] = useState(false);
    const loc = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const t = localStorage.getItem("token");
        const r = localStorage.getItem("role");
        setHasToken(!!t);
        setRole(r);
    }, [loc]);

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `nav-link px-3 py-2 rounded ${isActive ? "active bg-primary text-white" : "text-secondary"}`;

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    const getRoleColor = (role: string | null) => {
        switch (role) {
            case "ADMIN": return "danger";
            case "ORGANIZER": return "primary";
            case "VENDOR": return "info";
            case "USER": return "secondary";
            default: return "secondary";
        }
    };

    const getRoleIcon = (role: string | null) => {
        switch (role) {
            case "ADMIN": return "👑";
            case "ORGANIZER": return "📋";
            case "VENDOR": return "🏪";
            case "USER": return "👤";
            default: return "👤";
        }
    };

    if (!hasToken) {
        return (
            <div className="container py-5">
                <div className="alert alert-warning">
                    Please <NavLink to="/login">login</NavLink>.
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <aside
                    className="col-12 col-md-3 col-lg-2 min-vh-100 p-0"
                    style={{
                        background: "linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)",
                        boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
                        borderRight: "1px solid #dee2e6"
                    }}
                >
                    <div className="p-4">
                        {/* Logo/Brand */}
                        <div className="text-center mb-4 pb-3" style={{ borderBottom: "1px solid #dee2e6" }}>
                            <div
                                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    boxShadow: "0 4px 8px rgba(102, 126, 234, 0.3)"
                                }}
                            >
                                <span style={{ fontSize: "2rem" }}>🎉</span>
                            </div>
                            <h5 className="mb-0 text-dark fw-bold">EventEase</h5>
                            <small className="text-muted">Manage Your Events</small>
                        </div>

                        {/* Navigation */}
                        <nav className="nav flex-column gap-1">
                            <NavLink to="/dashboard" className={linkClass} style={{ transition: "all 0.3s" }}>
                                <span className="me-2">🏠</span> Dashboard
                            </NavLink>
                            <NavLink to="/profile" className={linkClass} style={{ transition: "all 0.3s" }}>
                                <span className="me-2">👤</span> My Profile
                            </NavLink>
                            <NavLink to="/notifications" className={linkClass} style={{ transition: "all 0.3s" }}>
                                <span className="me-2">🔔</span> Notifications
                            </NavLink>
                            <NavLink to="/events" className={linkClass} style={{ transition: "all 0.3s" }}>
                                <span className="me-2">📅</span> Events
                            </NavLink>
                            <NavLink to="/bookings" className={linkClass} style={{ transition: "all 0.3s" }}>
                                <span className="me-2">🎫</span> My Bookings
                            </NavLink>
                            <NavLink to="/my-tasks" className={linkClass} style={{ transition: "all 0.3s" }}>
                                <span className="me-2">✅</span> My Tasks
                            </NavLink>
                            <NavLink to="/reviews" className={linkClass} style={{ transition: "all 0.3s" }}>
                                <span className="me-2">⭐</span> Reviews
                            </NavLink>
                            <NavLink to="/vendors" className={linkClass} style={{ transition: "all 0.3s" }}>
                                <span className="me-2">🏪</span> Vendors
                            </NavLink>
                            <NavLink to="/venues" className={linkClass} style={{ transition: "all 0.3s" }}>
                                <span className="me-2">🏢</span> Venues
                            </NavLink>

                            {role === "ORGANIZER" && (
                                <>
                                    <div className="mt-3 mb-2">
                                        <small className="text-muted fw-semibold ps-3">ORGANIZER</small>
                                    </div>
                                    <NavLink to="/my-events" className={linkClass} style={{ transition: "all 0.3s" }}>
                                        <span className="me-2">📝</span> My Events
                                    </NavLink>
                                    <NavLink to="/ticket-types" className={linkClass} style={{ transition: "all 0.3s" }}>
                                        <span className="me-2">🎟️</span> Ticket Types
                                    </NavLink>
                                    <NavLink to="/tasks" className={linkClass} style={{ transition: "all 0.3s" }}>
                                        <span className="me-2">📋</span> Team Tasks
                                    </NavLink>
                                </>
                            )}

                            {role === "ADMIN" && (
                                <>
                                    <div className="mt-3 mb-2">
                                        <small className="text-muted fw-semibold ps-3">ADMIN</small>
                                    </div>
                                    <NavLink to="/users" className={linkClass} style={{ transition: "all 0.3s" }}>
                                        <span className="me-2">👥</span> Users
                                    </NavLink>
                                    <NavLink to="/admin/notifications" className={linkClass} style={{ transition: "all 0.3s" }}>
                                        <span className="me-2">📡</span> Broadcast
                                    </NavLink>
                                    <NavLink to="/tasks" className={linkClass} style={{ transition: "all 0.3s" }}>
                                        <span className="me-2">📋</span> All Tasks
                                    </NavLink>
                                </>
                            )}
                        </nav>

                        {/* User Info & Logout */}
                        <div className="mt-auto pt-4" style={{ borderTop: "1px solid #dee2e6" }}>
                            <div
                                className="p-3 rounded mb-3"
                                style={{
                                    background: "white",
                                    border: "1px solid #dee2e6",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                }}
                            >
                                <div className="d-flex align-items-center mb-2">
                                    <span className="me-2" style={{ fontSize: "1.5rem" }}>
                                        {getRoleIcon(role)}
                                    </span>
                                    <div className="flex-grow-1">
                                        <small className="text-muted d-block">Your Role</small>
                                        <span className={`badge bg-${getRoleColor(role)}`}>
                                            {role || "USER"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
                                onClick={logout}
                                style={{
                                    transition: "all 0.3s",
                                    fontWeight: "500"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <span>🚪</span>
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="col p-4" style={{ background: "white" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
