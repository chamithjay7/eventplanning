import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";

type Task = {
    id: number;
    eventId: number;
    title: string;
    description?: string;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
    dueDate?: string;
    createdAt: string;
};

export default function MyTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [loading, setLoading] = useState(true);

    // View modal
    const [viewTask, setViewTask] = useState<Task | null>(null);

    // Update status modal
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [newStatus, setNewStatus] = useState<Task["status"]>("TODO");

    useEffect(() => {
        loadMyTasks();
    }, []);

    useEffect(() => {
        if (statusFilter === "ALL") {
            setFilteredTasks(tasks);
        } else {
            setFilteredTasks(tasks.filter(t => t.status === statusFilter));
        }
    }, [statusFilter, tasks]);

    const loadMyTasks = async () => {
        try {
            setLoading(true);
            const res = await api.get<Task[]>("/api/tasks/mine");
            setTasks(res.data);
            setFilteredTasks(res.data);
        } catch (err) {
            console.error("Failed to load tasks:", err);
            alert("Failed to load your tasks");
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (task: Task) => {
        setEditTask(task);
        setNewStatus(task.status);
    };

    const handleUpdateStatus = async () => {
        if (!editTask) return;
        try {
            await api.patch(`/api/tasks/${editTask.id}/status`, { status: newStatus });
            alert("Task status updated!");
            setEditTask(null);
            loadMyTasks();
        } catch (err: any) {
            console.error("Update failed:", err);
            alert(err.response?.data?.message || "Failed to update status");
        }
    };

    const getStatusColor = (status: Task["status"]) => {
        switch (status) {
            case "TODO": return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
            case "IN_PROGRESS": return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
            case "DONE": return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
            case "CANCELLED": return "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
        }
    };

    const getStatusBadge = (status: Task["status"]) => {
        const colors = {
            TODO: "bg-secondary",
            IN_PROGRESS: "bg-warning",
            DONE: "bg-success",
            CANCELLED: "bg-danger"
        };
        return <span className={`badge ${colors[status]}`}>{status.replace("_", " ")}</span>;
    };

    if (loading) {
        return (
            <div className="container py-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col">
                    <h2>My Assigned Tasks</h2>
                    <p className="text-muted">Tasks assigned to you by event organizers</p>
                </div>
            </div>

            {/* Filter */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <label className="form-label fw-semibold">Filter by Status</label>
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Tasks</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Tasks Grid */}
            {filteredTasks.length === 0 ? (
                <div className="alert alert-info">
                    {statusFilter === "ALL"
                        ? "No tasks assigned to you yet."
                        : `No ${statusFilter.replace("_", " ")} tasks.`}
                </div>
            ) : (
                <div className="row g-3">
                    {filteredTasks.map(task => (
                        <div key={task.id} className="col-md-6 col-lg-4">
                            <div
                                className="card h-100 shadow-sm"
                                style={{
                                    background: getStatusColor(task.status),
                                    color: "white",
                                    border: "none"
                                }}
                            >
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title mb-0 text-white">{task.title}</h5>
                                        {getStatusBadge(task.status)}
                                    </div>

                                    {task.description && (
                                        <p className="card-text small mb-2 text-white-50">
                                            {task.description.substring(0, 100)}
                                            {task.description.length > 100 ? "..." : ""}
                                        </p>
                                    )}

                                    {task.dueDate && (
                                        <p className="card-text small mb-2">
                                            <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                                        </p>
                                    )}

                                    <p className="card-text small mb-3">
                                        <strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}
                                    </p>

                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-light"
                                            onClick={() => setViewTask(task)}
                                        >
                                            👁️ View
                                        </button>
                                        <button
                                            className="btn btn-sm btn-light"
                                            onClick={() => openEdit(task)}
                                        >
                                            ✏️ Update Status
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            {viewTask && (
                <Modal title="Task Details" onClose={() => setViewTask(null)}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Title</label>
                        <p>{viewTask.title}</p>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Description</label>
                        <p>{viewTask.description || "No description"}</p>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Status</label>
                        <div>{getStatusBadge(viewTask.status)}</div>
                    </div>
                    {viewTask.dueDate && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Due Date</label>
                            <p>{new Date(viewTask.dueDate).toLocaleString()}</p>
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Created At</label>
                        <p>{new Date(viewTask.createdAt).toLocaleString()}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setViewTask(null)}>
                        Close
                    </button>
                </Modal>
            )}

            {/* Update Status Modal */}
            {editTask && (
                <Modal title="Update Task Status" onClose={() => setEditTask(null)}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Task</label>
                        <p className="text-muted">{editTask.title}</p>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Current Status</label>
                        <div className="mb-2">{getStatusBadge(editTask.status)}</div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">New Status *</label>
                        <select
                            className="form-select"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as Task["status"])}
                        >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" onClick={handleUpdateStatus}>
                            Update Status
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditTask(null)}>
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
//MyTasks