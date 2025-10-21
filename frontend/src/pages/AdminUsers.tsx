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

type RoleFilter = "ALL" | "USER" | "ORGANIZER" | "VENDOR" | "ADMIN";

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [editUser, setEditUser] = useState<User | null>(null);
    const [viewUser, setViewUser] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [deleteError, setDeleteError] = useState("");
    const [newRole, setNewRole] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/api/users");
            setUsers(res.data.content || []);
            setFilteredUsers(res.data.content || []);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Filter users based on search and role filter
    useEffect(() => {
        let result = users;

        // Apply role filter
        if (roleFilter !== "ALL") {
            result = result.filter(u => u.role === roleFilter);
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(u =>
                u.username.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                u.role.toLowerCase().includes(query)
            );
        }

        setFilteredUsers(result);
    }, [users, searchQuery, roleFilter]);

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleteError("");

        try {
            await api.delete(`/api/users/${deleteTarget.id}`);
            setDeleteTarget(null);
            load();
        } catch (e: any) {
            // Handle different error response formats
            let rawError = e?.response?.data;

            // If data is a string, use it directly
            if (typeof rawError === 'string') {
                rawError = rawError;
            } else {
                // If it's an object, try to extract the message
                rawError = rawError?.message || rawError?.error || e?.message;
            }

            // Parse the error into a user-friendly message
            let errorMessage = "Failed to delete user";

            if (typeof rawError === 'string') {
                if (rawError.includes('foreign key constraint')) {
                    // Extract the table name from the constraint error
                    const tableMatch = rawError.match(/`(\w+)`[,\s]+CONSTRAINT/i);
                    const tableName = tableMatch ? tableMatch[1] : 'related records';

                    errorMessage = `Cannot delete user because they have ${tableName} in the system. Please delete all related ${tableName} first, then try again.`;
                } else if (rawError.toLowerCase().includes('cannot delete yourself')) {
                    errorMessage = "You cannot delete your own account while logged in.";
                } else if (rawError.toLowerCase().includes('last admin')) {
                    errorMessage = "Cannot delete the last admin user in the system.";
                } else {
                    errorMessage = rawError;
                }
            }

            setDeleteError(errorMessage);

            // Log for debugging
            console.error('Delete error details:', {
                status: e?.response?.status,
                rawData: e?.response?.data,
                parsedMessage: errorMessage
            });
        }
    };

    const handleEdit = (u: User) => {
        setEditUser(u);
        setNewRole(u.role);
    };

    const handleUpdate = async () => {
        if (!editUser) return;
        try {
            await api.put(`/api/users/${editUser.id}`, { role: newRole });
            setEditUser(null);
            load();
        } catch (e: any) {
            alert(e?.response?.data?.message || "Update failed");
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

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "ADMIN": return "👑";
            case "ORGANIZER": return "📋";
            case "VENDOR": return "🏪";
            case "USER": return "👤";
            default: return "👤";
        }
    };

    const getRoleCount = (role: string) => {
        return users.filter(u => u.role === role).length;
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
                <p className="mt-2 text-muted">Loading users...</p>
            </div>
        );
    }

    if (err) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger">{err}</div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col">
                    <h2>User Management</h2>
                    <p className="text-muted">Manage all users in the system</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #6c757d" }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Total Users</p>
                                    <h3 className="mb-0">{users.length}</h3>
                                </div>
                                <div className="bg-secondary bg-opacity-10 rounded-circle p-3">
                                    <span style={{ fontSize: "2rem" }}>👥</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #dc3545" }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Admins</p>
                                    <h3 className="mb-0">{getRoleCount("ADMIN")}</h3>
                                </div>
                                <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                                    <span style={{ fontSize: "2rem" }}>👑</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #0d6efd" }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Organizers</p>
                                    <h3 className="mb-0">{getRoleCount("ORGANIZER")}</h3>
                                </div>
                                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                                    <span style={{ fontSize: "2rem" }}>📋</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #0dcaf0" }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Vendors</p>
                                    <h3 className="mb-0">{getRoleCount("VENDOR")}</h3>
                                </div>
                                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                                    <span style={{ fontSize: "2rem" }}>🏪</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="🔍 Search by username, email, or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <div className="btn-group w-100" role="group">
                                <button
                                    className={`btn ${roleFilter === "ALL" ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => setRoleFilter("ALL")}
                                >
                                    All ({users.length})
                                </button>
                                <button
                                    className={`btn ${roleFilter === "ADMIN" ? "btn-danger" : "btn-outline-danger"}`}
                                    onClick={() => setRoleFilter("ADMIN")}
                                >
                                    👑 Admins ({getRoleCount("ADMIN")})
                                </button>
                                <button
                                    className={`btn ${roleFilter === "ORGANIZER" ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => setRoleFilter("ORGANIZER")}
                                >
                                    📋 Organizers ({getRoleCount("ORGANIZER")})
                                </button>
                                <button
                                    className={`btn ${roleFilter === "VENDOR" ? "btn-info" : "btn-outline-info"}`}
                                    onClick={() => setRoleFilter("VENDOR")}
                                >
                                    🏪 Vendors ({getRoleCount("VENDOR")})
                                </button>
                                <button
                                    className={`btn ${roleFilter === "USER" ? "btn-secondary" : "btn-outline-secondary"}`}
                                    onClick={() => setRoleFilter("USER")}
                                >
                                    👤 Users ({getRoleCount("USER")})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3">
                    <h5 className="mb-0">
                        Users List
                        {searchQuery && (
                            <span className="text-muted ms-2 small">
                                ({filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'})
                            </span>
                        )}
                    </h5>
                </div>
                <div className="card-body p-0">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <div style={{ fontSize: "3rem" }}>🔍</div>
                            <p className="mt-2">No users found</p>
                            {searchQuery && (
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setRoleFilter("ALL");
                                    }}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th style={{ width: "60px" }}></th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th className="text-end" style={{ width: "200px" }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div
                                                className={`bg-${getRoleBadgeColor(u.role)} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                                                style={{ width: "40px", height: "40px" }}
                                            >
                                                    <span className={`text-${getRoleBadgeColor(u.role)} fw-semibold`}>
                                                        {getInitials(u.username)}
                                                    </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-semibold">{u.username}</div>
                                            <small className="text-muted">ID: {u.id}</small>
                                        </td>
                                        <td>
                                            <span className="text-muted">{u.email}</span>
                                        </td>
                                        <td>
                                                <span className={`badge bg-${getRoleBadgeColor(u.role)}`}>
                                                    {getRoleIcon(u.role)} {u.role}
                                                </span>
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </small>
                                        </td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-outline-info me-1"
                                                onClick={() => setViewUser(u)}
                                                title="View Details"
                                            >
                                                👁️ View
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-1"
                                                onClick={() => handleEdit(u)}
                                                title="Edit Role"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => {
                                                    setDeleteTarget(u);
                                                    setDeleteError("");
                                                }}
                                                title="Delete User"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <Modal title="⚠️ Confirm Delete" onClose={() => {
                    setDeleteTarget(null);
                    setDeleteError("");
                }}>
                    {deleteError && (
                        <div className="alert alert-danger">
                            <strong>❌ Error:</strong> {deleteError}
                        </div>
                    )}

                    <div className="text-center mb-3">
                        <div
                            className={`bg-${getRoleBadgeColor(deleteTarget.role)} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                            style={{ width: "80px", height: "80px" }}
                        >
                            <span className={`text-${getRoleBadgeColor(deleteTarget.role)}`} style={{ fontSize: "2.5rem" }}>
                                {getRoleIcon(deleteTarget.role)}
                            </span>
                        </div>
                        <h5>{deleteTarget.username}</h5>
                        <span className={`badge bg-${getRoleBadgeColor(deleteTarget.role)}`}>
                            {deleteTarget.role}
                        </span>
                    </div>

                    <div className="alert alert-warning border-warning">
                        <strong>⚠️ Warning:</strong> Are you sure you want to delete this user?
                        <br />
                        <small>This action cannot be undone.</small>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                        <button
                            className="btn btn-danger flex-fill"
                            onClick={confirmDelete}
                        >
                            🗑️ Delete User
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setDeleteTarget(null);
                                setDeleteError("");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}

            {/* Edit Role Modal */}
            {editUser && (
                <Modal title={`Edit Role - ${editUser.username}`} onClose={() => setEditUser(null)}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Current Role</label>
                        <div>
                            <span className={`badge bg-${getRoleBadgeColor(editUser.role)} fs-6`}>
                                {getRoleIcon(editUser.role)} {editUser.role}
                            </span>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Select New Role</label>
                        <select
                            className="form-select"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                        >
                            <option value="USER">👤 USER - Regular user with basic access</option>
                            <option value="ORGANIZER">📋 ORGANIZER - Can create and manage events</option>
                            <option value="VENDOR">🏪 VENDOR - Can manage vendor services</option>
                            <option value="ADMIN">👑 ADMIN - Full system access</option>
                        </select>
                    </div>

                    <div className="alert alert-warning small">
                        <strong>Warning:</strong> Changing a user's role will immediately affect their permissions and access to features.
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-success flex-fill"
                            onClick={handleUpdate}
                            disabled={newRole === editUser.role}
                        >
                            💾 Save Changes
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setEditUser(null)}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}

            {/* View User Modal */}
            {viewUser && (
                <Modal title="User Details" onClose={() => setViewUser(null)}>
                    <div className="text-center mb-3">
                        <div
                            className={`bg-${getRoleBadgeColor(viewUser.role)} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2`}
                            style={{ width: "80px", height: "80px" }}
                        >
                            <span className={`text-${getRoleBadgeColor(viewUser.role)}`} style={{ fontSize: "2rem" }}>
                                {getRoleIcon(viewUser.role)}
                            </span>
                        </div>
                        <h4 className="mb-1">{viewUser.username}</h4>
                        <span className={`badge bg-${getRoleBadgeColor(viewUser.role)} mb-2`}>
                            {viewUser.role}
                        </span>
                    </div>

                    <div className="card bg-light border-0 mb-3">
                        <div className="card-body">
                            <div className="row g-2">
                                <div className="col-12">
                                    <small className="text-muted">User ID</small>
                                    <div className="fw-semibold">{viewUser.id}</div>
                                </div>
                                <div className="col-12">
                                    <small className="text-muted">Email Address</small>
                                    <div className="fw-semibold">{viewUser.email}</div>
                                </div>
                                <div className="col-12">
                                    <small className="text-muted">Member Since</small>
                                    <div className="fw-semibold">
                                        {new Date(viewUser.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric"
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-grid gap-2">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setViewUser(null);
                                handleEdit(viewUser);
                            }}
                        >
                            ✏️ Edit Role
                        </button>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => setViewUser(null)}
                        >
                            Close
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}