import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";

type User = {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
};

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);

    // Password change state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");
    const [passwordErr, setPasswordErr] = useState("");

    // Activity stats state
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalBookings: 0,
        totalReviews: 0,
        unreadNotifications: 0
    });

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get<User>("/api/users/me");
            setUser(res.data);
            setEmail(res.data.email);

            // Load activity stats
            await loadStats();
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const [eventsRes, bookingsRes, notifRes] = await Promise.all([
                api.get("/api/events?size=1000").catch(() => ({ data: { content: [] } })),
                api.get("/api/bookings/mine").catch(() => ({ data: [] })),
                api.get("/api/notifications/unread-count").catch(() => ({ data: 0 }))
            ]);

            setStats({
                totalEvents: eventsRes.data.content?.length || 0,
                totalBookings: bookingsRes.data?.length || 0,
                totalReviews: 0,
                unreadNotifications: notifRes.data || 0
            });
        } catch (e) {
            // Silently fail stats loading
            console.error("Failed to load stats:", e);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg("");
        setErr("");
        try {
            await api.put("/api/users/me", { email });
            setMsg("Profile updated successfully!");
            setTimeout(() => setMsg(""), 3000);
            loadProfile();
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Update failed");
            setTimeout(() => setErr(""), 3000);
        }
    };

    const handlePasswordChange = async () => {
        setPasswordMsg("");
        setPasswordErr("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordErr("Please fill in all password fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordErr("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordErr("Password must be at least 6 characters long");
            return;
        }

        try {
            await api.put("/api/users/me/password", {
                currentPassword,
                newPassword
            });
            setPasswordMsg("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordMsg("");
            }, 2000);
        } catch (e: any) {
            setPasswordErr(e?.response?.data?.message || "Failed to change password");
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

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "ADMIN": return "danger";
            case "ORGANIZER": return "primary";
            case "VENDOR": return "info";
            case "USER": return "secondary";
            default: return "secondary";
        }
    };

    const getRoleDescription = (role: string) => {
        switch (role) {
            case "ADMIN": return "Full system administrator with all permissions";
            case "ORGANIZER": return "Can create and manage events";
            case "VENDOR": return "Can manage vendor services and listings";
            case "USER": return "Regular user with basic access";
            default: return "";
        }
    };

    const getInitials = (username: string) => {
        return username.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="container py-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading profile...</p>
            </div>
        );
    }

    if (err && !user) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger">{err}</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="container-fluid py-4">
            {/* Header Section */}
            <div className="row mb-4">
                <div className="col">
                    <h2>My Profile</h2>
                    <p className="text-muted">Manage your account settings and preferences</p>
                </div>
            </div>

            <div className="row g-4">
                {/* Left Column - Profile Info */}
                <div className="col-lg-4">
                    {/* Profile Card */}
                    <div className="card border-0 shadow-sm text-center mb-4">
                        <div className="card-body p-4">
                            {/* Avatar */}
                            <div
                                className={`bg-${getRoleBadgeColor(user.role)} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                                style={{ width: "100px", height: "100px" }}
                            >
                                <span className={`text-${getRoleBadgeColor(user.role)}`} style={{ fontSize: "3rem" }}>
                                    {getRoleIcon(user.role)}
                                </span>
                            </div>

                            {/* Username */}
                            <h4 className="mb-2">{user.username}</h4>

                            {/* Role Badge */}
                            <span className={`badge bg-${getRoleBadgeColor(user.role)} mb-2`}>
                                {getRoleIcon(user.role)} {user.role}
                            </span>

                            {/* Role Description */}
                            <p className="text-muted small mb-3">
                                {getRoleDescription(user.role)}
                            </p>

                            {/* Email */}
                            <div className="text-muted small mb-3">
                                <div>📧 {user.email}</div>
                            </div>

                            {/* Member Since */}
                            <div className="border-top pt-3 mt-3">
                                <small className="text-muted">
                                    <strong>Member since:</strong><br />
                                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Activity Stats */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 py-3">
                            <h6 className="mb-0">Activity Overview</h6>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <small className="text-muted">Events</small>
                                    <div className="h5 mb-0">📅 {stats.totalEvents}</div>
                                </div>
                                <div className="text-end">
                                    <small className="text-muted">Bookings</small>
                                    <div className="h5 mb-0">🎫 {stats.totalBookings}</div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <small className="text-muted">Notifications</small>
                                    <div className="h5 mb-0">🔔 {stats.unreadNotifications}</div>
                                </div>
                                <div className="text-end">
                                    <small className="text-muted">User ID</small>
                                    <div className="h5 mb-0">#{user.id}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Settings */}
                <div className="col-lg-8">
                    {/* Success/Error Messages */}
                    {msg && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            <strong>Success!</strong> {msg}
                            <button type="button" className="btn-close" onClick={() => setMsg("")}></button>
                        </div>
                    )}
                    {err && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <strong>Error!</strong> {err}
                            <button type="button" className="btn-close" onClick={() => setErr("")}></button>
                        </div>
                    )}

                    {/* Account Information */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">📝 Account Information</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleUpdate}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Username</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light"
                                            value={user.username}
                                            disabled
                                            readOnly
                                        />
                                        <small className="text-muted">Username cannot be changed</small>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Role</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light"
                                            value={user.role}
                                            disabled
                                            readOnly
                                        />
                                        <small className="text-muted">Contact admin to change role</small>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Email Address *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="Enter your email address"
                                        />
                                        <small className="text-muted">This email will be used for all notifications</small>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={email === user.email}
                                    >
                                        💾 Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">🔒 Security Settings</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1">Password</h6>
                                    <p className="text-muted small mb-0">
                                        Change your password to keep your account secure
                                    </p>
                                </div>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    🔑 Change Password
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">ℹ️ Account Details</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label text-muted small">Account ID</label>
                                    <div className="fw-semibold">#{user.id}</div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small">Account Type</label>
                                    <div>
                                        <span className={`badge bg-${getRoleBadgeColor(user.role)}`}>
                                            {getRoleIcon(user.role)} {user.role}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small">Registration Date</label>
                                    <div className="fw-semibold">
                                        {new Date(user.createdAt).toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small">Account Status</label>
                                    <div>
                                        <span className="badge bg-success">✓ Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <Modal title="🔑 Change Password" onClose={() => setShowPasswordModal(false)}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Current Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 6 characters)"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                        />
                    </div>

                    {passwordMsg && (
                        <div className="alert alert-success">{passwordMsg}</div>
                    )}
                    {passwordErr && (
                        <div className="alert alert-danger">{passwordErr}</div>
                    )}

                    <div className="alert alert-info small">
                        <strong>Password requirements:</strong>
                        <ul className="mb-0 mt-2">
                            <li>At least 6 characters long</li>
                            <li>Make it strong and unique</li>
                            <li>Don't reuse old passwords</li>
                        </ul>
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-primary flex-fill"
                            onClick={handlePasswordChange}
                            disabled={!currentPassword || !newPassword || !confirmPassword}
                        >
                            💾 Change Password
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowPasswordModal(false);
                                setCurrentPassword("");
                                setNewPassword("");
                                setConfirmPassword("");
                                setPasswordMsg("");
                                setPasswordErr("");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
