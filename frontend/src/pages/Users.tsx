import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

type User = {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
};

type Page<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
};

const emptyForm = { id: 0, username: "", email: "", password: "", role: "USER" };

function roleBadge(role: string) {
    const map: Record<string, string> = {
        USER: "badge-user",
        ORGANIZER: "badge-organizer",
        VENDOR: "badge-vendor",
        ADMIN: "badge-admin",
    };
    const cls = map[role] || "badge-user";
    return <span className={`badge badge-role ${cls}`}>{role}</span>;
}

export default function Users() {
    const [page, setPage] = useState<Page<User> | null>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [form, setForm] = useState<{ id: number; username: string; email: string; password: string; role: string }>(emptyForm);
    const [showForm, setShowForm] = useState<"create" | "edit" | null>(null);
    const [q, setQ] = useState("");

    useEffect(() => {
        load(0);
    }, []);

    const load = async (p: number) => {
        try {
            setLoading(true);
            const url = q?.trim()
                ? `/api/users?q=${encodeURIComponent(q)}&page=${p}&size=10`
                : `/api/users?page=${p}&size=10`;
            const res = await api.get<Page<User>>(url);
            setPage(res.data);
            setMsg("");
            setError("");
        } catch (e: any) {
            setError(
                e?.response?.status === 403 ? "Forbidden (ADMIN only)" : "Failed to load users"
            );
        } finally {
            setLoading(false);
        }
    };

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.post("/api/users", {
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role,
            });
            setMsg("✅ User created");
            setShowForm(null);
            setForm(emptyForm);
            await load(page?.number ?? 0);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Create failed");
        } finally {
            setLoading(false);
        }
    };

    const onEdit = (u: User) => {
        setForm({
            id: u.id,
            username: u.username,
            email: u.email,
            password: "",
            role: u.role,
        });
        setShowForm("edit");
    };

    const onUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.put(`/api/users/${form.id}`, {
                email: form.email.trim(),
                role: form.role,
            });
            setMsg("✅ User updated");
            setShowForm(null);
            setForm(emptyForm);
            await load(page?.number ?? 0);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async (id: number) => {
        if (!confirm("Delete this user?")) return;
        try {
            setLoading(true);
            await api.delete(`/api/users/${id}`);
            setMsg("🗑️ User deleted");
            await load(page?.number ?? 0);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Delete failed");
        } finally {
            setLoading(false);
        }
    };

    const headerRight = useMemo(
        () => (
            <div className="d-flex gap-2">
                <input
                    className="form-control form-control-sm"
                    placeholder="Search username / email"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && load(0)}
                    style={{ minWidth: 260 }}
                />
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => load(0)}
                    disabled={loading}
                >
                    Search
                </button>
                <button
                    className="btn btn-success btn-sm"
                    onClick={() => {
                        setShowForm("create");
                        setForm(emptyForm);
                    }}
                >
                    + New User
                </button>
            </div>
        ),
        [q, loading]
    );

    const Form = () => (
        <div className="card elev p-3 mb-3">
            <h5 className="mb-3">{showForm === "create" ? "Create User" : "Edit User"}</h5>
            <form onSubmit={showForm === "create" ? onCreate : onUpdate} className="row g-2">
                <div className="col-md-3">
                    <label className="form-label text-dim">Username</label>
                    <input
                        className="form-control"
                        disabled={showForm === "edit"}
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        required={showForm === "create"}
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label text-dim">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                </div>
                {showForm === "create" && (
                    <div className="col-md-3">
                        <label className="form-label text-dim">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>
                )}
                <div className="col-md-2">
                    <label className="form-label text-dim">Role</label>
                    <select
                        className="form-select"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                        <option value="USER">USER</option>
                        <option value="ORGANIZER">ORGANIZER</option>
                        <option value="VENDOR">VENDOR</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>
                <div className="col-12 d-flex gap-2 mt-2">
                    <button className="btn btn-primary btn-sm" disabled={loading}>
                        {showForm === "create" ? "Create" : "Update"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                            setShowForm(null);
                            setForm(emptyForm);
                            setError("");
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );

    if (!page) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="section-title">Users</h2>
                {headerRight}
            </div>

            {msg && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {msg}
                    <button type="button" className="btn-close" onClick={() => setMsg("")}></button>
                </div>
            )}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError("")}></button>
                </div>
            )}

            {showForm && <Form />}

            <div className="card elev p-0">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                    <tr>
                        <th style={{ width: 90 }}>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th style={{ width: 160 }}>Role</th>
                        <th style={{ width: 200 }}>Created</th>
                        <th style={{ width: 150 }}></th>
                    </tr>
                    </thead>
                    <tbody>
                    {page.content.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center text-dim py-4">
                                No users found
                            </td>
                        </tr>
                    )}
                    {page.content.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="avatar">{u.username[0]?.toUpperCase()}</span>
                                    <div>
                                        <div className="fw-semibold">{u.username}</div>
                                        <div className="text-dim small">{u.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{u.email}</td>
                            <td>{roleBadge(u.role)}</td>
                            <td>{new Date(u.createdAt).toLocaleString()}</td>
                            <td className="d-flex gap-2">
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => onEdit(u)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => onDelete(u.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="d-flex gap-2 align-items-center mt-3">
                <button
                    className="btn btn-outline-primary btn-sm"
                    disabled={page.number <= 0 || loading}
                    onClick={() => load(page.number - 1)}
                >
                    Prev
                </button>
                <button
                    className="btn btn-outline-primary btn-sm"
                    disabled={page.number >= page.totalPages - 1 || loading}
                    onClick={() => load(page.number + 1)}
                >
                    Next
                </button>
                <span className="text-dim ms-2">
          Page {page.number + 1} / {Math.max(1, page.totalPages)} &nbsp;•&nbsp;{" "}
                    {page.totalElements} users
        </span>
            </div>
        </div>
    );
}
