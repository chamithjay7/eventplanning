import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";

type NotificationType = "GENERAL" | "EVENT_UPDATE" | "BOOKING" | "TASK" | "SYSTEM";

export default function AdminNotifications() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState<NotificationType>("GENERAL");
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleBroadcast = async () => {
        if (!title || !message) {
            alert("Please enter both title and message");
            return;
        }

        if (!confirm(`Broadcast this notification to ALL users?\n\nTitle: ${title}\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            setSubmitting(true);
            await api.post("/api/notifications/admin/broadcast", {
                title,
                message,
                type
            });

            // Clear form
            setTitle("");
            setMessage("");
            setType("GENERAL");

            setShowSuccessModal(true);
        } catch (err: any) {
            console.error("Failed to broadcast notification:", err);
            alert(err.response?.data?.message || "Failed to broadcast notification");
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeColor = (t: NotificationType) => {
        switch (t) {
            case "GENERAL": return "secondary";
            case "EVENT_UPDATE": return "primary";
            case "BOOKING": return "success";
            case "TASK": return "warning";
            case "SYSTEM": return "danger";
            default: return "secondary";
        }
    };

    const getTypeIcon = (t: NotificationType) => {
        switch (t) {
            case "GENERAL": return "📢";
            case "EVENT_UPDATE": return "📅";
            case "BOOKING": return "🎫";
            case "TASK": return "✅";
            case "SYSTEM": return "⚙️";
            default: return "📬";
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col">
                    <h2>Broadcast Notifications</h2>
                    <p className="text-muted">Send notifications to all users in the system</p>
                </div>
            </div>

            {/* Create Notification Form */}
            <div className="row">
                <div className="col-lg-8 col-xl-6">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Create Broadcast Notification</h5>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-info">
                                <strong>Note:</strong> This notification will be sent to <strong>ALL users</strong> including Admins, Organizers, Vendors, and regular Users.
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Notification Type *
                                </label>
                                <select
                                    className="form-select"
                                    value={type}
                                    onChange={(e) => setType(e.target.value as NotificationType)}
                                >
                                    <option value="GENERAL">📢 General</option>
                                    <option value="EVENT_UPDATE">📅 Event Update</option>
                                    <option value="BOOKING">🎫 Booking</option>
                                    <option value="TASK">✅ Task</option>
                                    <option value="SYSTEM">⚙️ System</option>
                                </select>
                                <small className="text-muted">
                                    Selected: <span className={`badge bg-${getTypeColor(type)}`}>
                                        {getTypeIcon(type)} {type}
                                    </span>
                                </small>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., System Maintenance Notice"
                                    maxLength={100}
                                />
                                <small className="text-muted">{title.length} / 100 characters</small>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Message *
                                </label>
                                <textarea
                                    className="form-control"
                                    rows={6}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter your notification message here..."
                                    maxLength={500}
                                />
                                <small className="text-muted">{message.length} / 500 characters</small>
                            </div>

                            {/* Preview */}
                            {(title || message) && (
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Preview</label>
                                    <div className="border rounded p-3" style={{ background: "#f6f9ff" }}>
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="me-2" style={{ fontSize: "1.5rem" }}>
                                                {getTypeIcon(type)}
                                            </span>
                                            <h6 className="mb-0">
                                                {title || "(No title)"}
                                                <span className="badge bg-primary ms-2">New</span>
                                            </h6>
                                        </div>
                                        <p className="mb-1 text-muted">
                                            {message || "(No message)"}
                                        </p>
                                        <small className="text-muted">
                                            {new Date().toLocaleString()}
                                        </small>
                                        <span className={`badge bg-${getTypeColor(type)} ms-2`}>
                                            {type}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-danger btn-lg"
                                    onClick={handleBroadcast}
                                    disabled={submitting || !title || !message}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Broadcasting...
                                        </>
                                    ) : (
                                        <>
                                            📡 Broadcast to All Users
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="col-lg-4 col-xl-6">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">Instructions</h6>
                        </div>
                        <div className="card-body">
                            <h6>Notification Types:</h6>
                            <ul className="small">
                                <li><strong>📢 General:</strong> General announcements</li>
                                <li><strong>📅 Event Update:</strong> Event-related updates</li>
                                <li><strong>🎫 Booking:</strong> Booking confirmations/updates</li>
                                <li><strong>✅ Task:</strong> Task assignments/reminders</li>
                                <li><strong>⚙️ System:</strong> System maintenance/alerts</li>
                            </ul>

                            <h6 className="mt-3">Tips:</h6>
                            <ul className="small">
                                <li>Keep titles short and descriptive</li>
                                <li>Write clear, concise messages</li>
                                <li>Use appropriate notification types</li>
                                <li>Preview before sending</li>
                                <li>Notifications are sent immediately</li>
                            </ul>

                            <div className="alert alert-warning mt-3 small">
                                <strong>Warning:</strong> Once broadcasted, notifications cannot be recalled. All users will receive them instantly.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <Modal title="Success!" onClose={() => setShowSuccessModal(false)}>
                    <div className="text-center py-4">
                        <div style={{ fontSize: "4rem" }}>✅</div>
                        <h4 className="mt-3">Notification Broadcasted!</h4>
                        <p className="text-muted">
                            Your notification has been successfully sent to all users.
                        </p>
                    </div>
                    <div className="d-grid">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowSuccessModal(false)}
                        >
                            Create Another Notification
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
