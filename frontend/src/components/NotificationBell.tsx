import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

type NotificationItem = {
    id: number;
    title: string;
    message: string;
    type: "BOOKING" | "EVENT_UPDATE" | "GENERAL" | "SYSTEM" | "TASK";
    status: "UNREAD" | "READ" | "ARCHIVED";
    createdAt: string;
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [count, setCount] = useState(0);
    const [list, setList] = useState<NotificationItem[]>([]);
    const boxRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const load = async () => {
        try {
            const [c, l] = await Promise.all([
                api.get<number>("/api/notifications/unread-count"),
                api.get<NotificationItem[]>("/api/notifications/latest"),
            ]);
            setCount(c.data);
            setList(l.data);
        } catch {
            /* ignore */
        }
    };

    useEffect(() => {
        load();
        const onClick = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    const markAll = async () => {
        await api.patch("/api/notifications/read-all");
        await load();
    };

    return (
        <div className="position-relative" ref={boxRef}>
            <button
                className="btn btn-outline-secondary btn-sm position-relative"
                onClick={() => setOpen((v) => !v)}
                title="Notifications"
            >
                🔔
                {count > 0 && (
                    <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: 10 }}
                    >
            {count}
          </span>
                )}
            </button>

            {open && (
                <div
                    className="card shadow position-absolute end-0 mt-2"
                    style={{ width: 340, zIndex: 1000 }}
                >
                    <div className="card-header d-flex justify-content-between align-items-center py-2">
                        <strong>Notifications</strong>
                        <button className="btn btn-link btn-sm" onClick={markAll}>
                            Mark all read
                        </button>
                    </div>
                    <div className="list-group list-group-flush" style={{ maxHeight: 360, overflowY: "auto" }}>
                        {list.length === 0 && (
                            <div className="text-muted small p-3">No notifications</div>
                        )}
                        {list.map((n) => (
                            <div
                                key={n.id}
                                className="list-group-item"
                                style={{ background: n.status === "UNREAD" ? "#f6f9ff" : "white" }}
                            >
                                <div className="small text-muted">
                                    {new Date(n.createdAt).toLocaleString()} • {n.type}
                                </div>
                                <div className="fw-semibold">{n.title}</div>
                                <div className="small">{n.message}</div>
                            </div>
                        ))}
                    </div>
                    <div className="card-footer text-center py-2">
                        <button
                            className="btn btn-link btn-sm text-decoration-none"
                            onClick={() => {
                                navigate("/notifications");
                                setOpen(false);
                            }}
                        >
                            View All Notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
