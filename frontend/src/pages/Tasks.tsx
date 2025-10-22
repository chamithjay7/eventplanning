import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";

type Task = {
    id: number;
    eventId: number;
    assignedToUserId?: number;
    assignedToUsername?: string;
    title: string;
    description?: string;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
    dueDate?: string;
    createdAt: string;
};

type Event = {
    id: number;
    title: string;
};

type User = {
    id: number;
    username: string;
};

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");

    // Check user role
    const userRole = localStorage.getItem("role") || "";
    const isAdmin = userRole === "ADMIN";

    // Form states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [viewTask, setViewTask] = useState<Task | null>(null);

    // Form fields
    const [selectedEvent, setSelectedEvent] = useState<number>(0);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [assignedToUserId, setAssignedToUserId] = useState<number>(0);
    const [status, setStatus] = useState<Task["status"]>("TODO");

    // Filter
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setErr("");
        try {
            if (isAdmin) {
                // Admin: Load all tasks
                const tasksRes = await api.get<Task[]>("/api/tasks/all");
                setTasks(tasksRes.data);
            } else {
                // Organizer: Load organizer's events
                const eventsRes = await api.get<Event[]>("/api/events/mine");
                setMyEvents(eventsRes.data);

                // Load all users for assignment
                const usersRes = await api.get<User[]>("/api/users/simple");
                setUsers(usersRes.data);

                // If user has events, load tasks for first event
                if (eventsRes.data.length > 0) {
                    await loadTasksForEvent(eventsRes.data[0].id);
                }
            }
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const loadTasksForEvent = async (eventId: number) => {
        try {
            const res = await api.get<Task[]>(`/api/tasks/event/${eventId}`);
            setTasks(res.data);
            setSelectedEvent(eventId);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Failed to load tasks");
        }
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const openEditModal = (task: Task) => {
        setEditTask(task);
        setTitle(task.title);
        setDescription(task.description || "");
        setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
        setAssignedToUserId(task.assignedToUserId || 0);
        setStatus(task.status);
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setDueDate("");
        setAssignedToUserId(0);
        setStatus("TODO");
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            setErr("Title is required");
            return;
        }
        if (selectedEvent === 0) {
            setErr("Please select an event");
            return;
        }

        try {
            await api.post("/api/tasks", {
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                assignedToUserId: assignedToUserId || undefined,
                eventId: selectedEvent,
            });
            setMsg("Task created successfully");
            setShowCreateModal(false);
            resetForm();
            await loadTasksForEvent(selectedEvent);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Failed to create task");
        }
    };

    const handleUpdate = async () => {
        if (!editTask) return;
        if (!title.trim()) {
            setErr("Title is required");
            return;
        }

        try {
            await api.put(`/api/tasks/${editTask.id}`, {
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                assignedToUserId: assignedToUserId || undefined,
                status,
            });
            setMsg("Task updated successfully");
            setEditTask(null);
            resetForm();
            await loadTasksForEvent(selectedEvent);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Failed to update task");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            await api.delete(`/api/tasks/${id}`);
            setMsg("Task deleted successfully");
            await loadTasksForEvent(selectedEvent);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Failed to delete task");
        }
    };

    const filteredTasks = tasks.filter((t) => {
        if (filterStatus === "ALL") return true;
        return t.status === filterStatus;
    });

    const getStatusColor = (status: Task["status"]) => {
        switch (status) {
            case "TODO":
                return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
            case "IN_PROGRESS":
                return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
            case "DONE":
                return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
            case "CANCELLED":
                return "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    if (!isAdmin && myEvents.length === 0) {
        return (
            <div className="card p-5 text-center">
                <h5>No Events Found</h5>
                <p className="text-muted">Create an event first to manage tasks</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="section-title mb-1">{isAdmin ? "All Tasks" : "Team Tasks"}</h2>
                    <p className="text-muted small mb-0">
                        {isAdmin ? "View all tasks in the system" : "Manage tasks for your events"}
                    </p>
                </div>
                {!isAdmin && (
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        + Create Task
                    </button>
                )}
            </div>

            {msg && <div className="alert alert-success">{msg}</div>}
            {err && <div className="alert alert-danger">{err}</div>}

            {/* Event Selector & Filters */}
            <div className="card mb-4 p-3">
                <div className="row g-3">
                    {!isAdmin && (
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Select Event</label>
                            <select
                                className="form-select"
                                value={selectedEvent}
                                onChange={(e) => loadTasksForEvent(Number(e.target.value))}
                            >
                                {myEvents.map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className={isAdmin ? "col-md-12" : "col-md-6"}>
                        <label className="form-label fw-semibold">Filter by Status</label>
                        <select
                            className="form-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Tasks</option>
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tasks Grid */}
            {filteredTasks.length === 0 ? (
                <div className="card p-5 text-center">
                    <h5>No Tasks Found</h5>
                    <p className="text-muted">Create your first task for this event</p>
                </div>
            ) : (
                <div className="row g-4">
                    {filteredTasks.map((task) => (
                        <div key={task.id} className="col-md-6 col-lg-4">
                            <div
                                className="card h-100 shadow-sm border-0"
                                style={{ transition: "all 0.3s ease" }}
                                onMouseEnter={(el) => {
                                    el.currentTarget.style.transform = "translateY(-8px)";
                                    el.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)";
                                }}
                                onMouseLeave={(el) => {
                                    el.currentTarget.style.transform = "translateY(0)";
                                    el.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                                }}
                            >
                                {/* Card Header */}
                                <div
                                    className="card-header text-white border-0"
                                    style={{
                                        background: getStatusColor(task.status),
                                        padding: "1.25rem",
                                    }}
                                >
                                    <h6 className="mb-0 fw-bold">{task.title}</h6>
                                    <span className="badge bg-light text-dark mt-2" style={{ fontSize: "0.7rem" }}>
                                        {task.status.replace("_", " ")}
                                    </span>
                                </div>

                                <div className="card-body">
                                    {task.description && (
                                        <p className="text-muted small mb-3">
                                            {task.description.length > 100
                                                ? task.description.substring(0, 100) + "..."
                                                : task.description}
                                        </p>
                                    )}

                                    <div className="mb-2">
                                        <small className="text-muted">Assigned to:</small>
                                        <div className="fw-semibold">
                                            {task.assignedToUsername || "Unassigned"}
                                        </div>
                                    </div>

                                    {task.dueDate && (
                                        <div className="mb-2">
                                            <small className="text-muted">Due Date:</small>
                                            <div className="fw-semibold">
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}

                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => setViewTask(task)}
                                        >
                                            👁️ View
                                        </button>
                                        {!isAdmin && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => openEditModal(task)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(task.id)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE MODAL */}
            {showCreateModal && (
                <Modal
                    title="Create New Task"
                    onClose={() => setShowCreateModal(false)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleCreate}>
                                Create Task
                            </button>
                        </>
                    }
                >
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Title <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Description</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={1000}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Due Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Assign To</label>
                        <select
                            className="form-select"
                            value={assignedToUserId}
                            onChange={(e) => setAssignedToUserId(Number(e.target.value))}
                        >
                            <option value={0}>Unassigned</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                    </div>
                </Modal>
            )}

            {/* EDIT MODAL */}
            {editTask && (
                <Modal
                    title={`Edit Task - #${editTask.id}`}
                    onClose={() => setEditTask(null)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setEditTask(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleUpdate}>
                                Update Task
                            </button>
                        </>
                    }
                >
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Title <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Description</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={1000}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Due Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Assign To</label>
                        <select
                            className="form-select"
                            value={assignedToUserId}
                            onChange={(e) => setAssignedToUserId(Number(e.target.value))}
                        >
                            <option value={0}>Unassigned</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Status</label>
                        <select
                            className="form-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as Task["status"])}
                        >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </Modal>
            )}

            {/* VIEW MODAL */}
            {viewTask && (
                <Modal title={`Task Details - #${viewTask.id}`} onClose={() => setViewTask(null)}>
                    <div className="mb-3">
                        <h5>{viewTask.title}</h5>
                    </div>
                    {viewTask.description && (
                        <div className="mb-3">
                            <label className="text-muted small">Description</label>
                            <p>{viewTask.description}</p>
                        </div>
                    )}
                    <div className="row g-3">
                        <div className="col-6">
                            <label className="text-muted small">Status</label>
                            <div className="fw-semibold">{viewTask.status.replace("_", " ")}</div>
                        </div>
                        <div className="col-6">
                            <label className="text-muted small">Assigned To</label>
                            <div className="fw-semibold">{viewTask.assignedToUsername || "Unassigned"}</div>
                        </div>
                        {viewTask.dueDate && (
                            <div className="col-6">
                                <label className="text-muted small">Due Date</label>
                                <div className="fw-semibold">
                                    {new Date(viewTask.dueDate).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                        <div className="col-6">
                            <label className="text-muted small">Created</label>
                            <div className="fw-semibold">
                                {new Date(viewTask.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
//Tasks