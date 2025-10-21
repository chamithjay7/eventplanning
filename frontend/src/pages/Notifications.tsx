import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";

type NotificationType = "GENERAL" | "EVENT_UPDATE" | "BOOKING" | "TASK" | "SYSTEM";
type NotificationStatus = "UNREAD" | "READ" | "ARCHIVED";

type Notification = {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    status: NotificationStatus;
    createdAt: string;
};

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [viewNotification, setViewNotification] = useState<Notification | null>(null);

    useEffect(() => {
        loadNotifications();
    }, [filter]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const endpoint = filter === "unread" ? "/api/notifications/unread" : "/api/notifications";
            const res = await api.get<Notification[]>(endpoint);
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to load notifications:", err);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.patch(`/api/notifications/${id}/read`);
            await loadNotifications();
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch("/api/notifications/read-all");
            await loadNotifications();
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const handleArchive = async (id: number) => {
        try {
            await api.patch(`/api/notifications/${id}/archive`);
            await loadNotifications();
        } catch (err) {
            console.error("Failed to archive:", err);
        }
    };

    const handleViewNotification = async (notification: Notification) => {
        setViewNotification(notification);
        if (notification.status === "UNREAD") {
            await handleMarkAsRead(notification.id);
        }
    };

    const getTypeColor = (type: NotificationType) => {
        switch (type) {
            case "GENERAL": return "secondary";
            case "EVENT_UPDATE": return "primary";
            case "BOOKING": return "success";
            case "TASK": return "warning";
            case "SYSTEM": return "danger";
            default: return "secondary";
        }
    };

    const getTypeIcon = (type: NotificationType) => {
        switch (type) {
            case "GENERAL": return "📢";
            case "EVENT_UPDATE": return "📅";
            case "BOOKING": return "🎫";
            case "TASK": return "✅";
            case "SYSTEM": return "⚙️";
            default: return "📬";
        }
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
                    <h2>Notifications</h2>
                    <p className="text-muted">Stay updated with your latest notifications</p>
                </div>
                <div className="col-auto">
                    <button
                        className="btn btn-outline-primary"
                        onClick={handleMarkAllAsRead}
                        disabled={notifications.filter(n => n.status === "UNREAD").length === 0}
                    >
                        Mark All as Read
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="btn-group" role="group">
                        <button
                            type="button"
                            className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setFilter("all")}
                        >
                            All Notifications
                        </button>
                        <button
                            type="button"
                            className={`btn ${filter === "unread" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setFilter("unread")}
                        >
                            Unread Only
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="row">
                <div className="col">
                    {notifications.length === 0 ? (
                        <div className="alert alert-info text-center">
                            <h5>No notifications</h5>
                            <p className="mb-0">
                                {filter === "unread"
                                    ? "You're all caught up! No unread notifications."
                                    : "You don't have any notifications yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="list-group">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`list-group-item list-group-item-action ${
                                        notification.status === "UNREAD" ? "list-group-item-primary" : ""
                                    }`}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="d-flex w-100 justify-content-between align-items-start">
                                        <div
                                            className="flex-grow-1"
                                            onClick={() => handleViewNotification(notification)}
                                        >
                                            <div className="d-flex align-items-center mb-2">
                                                <span className="me-2" style={{ fontSize: "1.5rem" }}>
                                                    {getTypeIcon(notification.type)}
                                                </span>
                                                <h5 className="mb-0">
                                                    {notification.title}
                                                    {notification.status === "UNREAD" && (
                                                        <span className="badge bg-primary ms-2">New</span>
                                                    )}
                                                </h5>
                                            </div>
                                            <p className="mb-1 text-muted">
                                                {notification.message.length > 100
                                                    ? notification.message.substring(0, 100) + "..."
                                                    : notification.message}
                                            </p>
                                            <small className="text-muted">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </small>
                                            <span className={`badge bg-${getTypeColor(notification.type)} ms-2`}>
                                                {notification.type}
                                            </span>
                                        </div>
                                        <div className="d-flex flex-column gap-2">
                                            {notification.status === "UNREAD" && (
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                            {notification.status !== "ARCHIVED" && (
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleArchive(notification.id);
                                                    }}
                                                >
                                                    Archive
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* View Notification Modal */}
            {viewNotification && (
                <Modal title="Notification Details" onClose={() => setViewNotification(null)}>
                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-3">
                            <span className="me-2" style={{ fontSize: "2rem" }}>
                                {getTypeIcon(viewNotification.type)}
                            </span>
                            <div>
                                <h5 className="mb-0">{viewNotification.title}</h5>
                                <span className={`badge bg-${getTypeColor(viewNotification.type)}`}>
                                    {viewNotification.type}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Message</label>
                        <p className="text-muted">{viewNotification.message}</p>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Status</label>
                        <p>
                            <span className={`badge ${
                                viewNotification.status === "UNREAD" ? "bg-primary" :
                                viewNotification.status === "READ" ? "bg-success" :
                                "bg-secondary"
                            }`}>
                                {viewNotification.status}
                            </span>
                        </p>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Received</label>
                        <p className="text-muted">
                            {new Date(viewNotification.createdAt).toLocaleString()}
                        </p>
                    </div>

                    <div className="d-flex gap-2">
                        {viewNotification.status !== "ARCHIVED" && (
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    handleArchive(viewNotification.id);
                                    setViewNotification(null);
                                }}
                            >
                                Archive
                            </button>
                        )}
                        <button
                            className="btn btn-primary"
                            onClick={() => setViewNotification(null)}
                        >
                            Close
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
