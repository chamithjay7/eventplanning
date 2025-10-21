import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

type EventItem = {
    id: number;
    name: string;
    location: string;
    startTime: string;
    endTime: string;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED";
};

type Booking = {
    id: number;
    eventId: number;
    ticketTypeId: number;
    userId: number;
    quantity: number;
    status: "CONFIRMED" | "CANCELLED";
    createdAt: string;
};

export default function OrganizerBookings() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [list, setList] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        loadMyEvents();
    }, []);

    useEffect(() => {
        if (selectedId != null) loadBookings(selectedId);
    }, [selectedId]);

    const loadMyEvents = async () => {
        setErr("");
        try {
            const res = await api.get<EventItem[]>("/api/events/mine");
            setEvents(res.data);
            if (res.data.length > 0) setSelectedId(res.data[0].id);
        } catch {
            setErr("Failed to load your events");
        }
    };

    const loadBookings = async (eventId: number) => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get<Booking[]>(`/api/events/${eventId}/bookings`);
            setList(res.data);
        } catch {
            setErr("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const totals = useMemo(() => {
        const totalQty = list.reduce((s, b) => s + (b.status === "CONFIRMED" ? b.quantity : 0), 0);
        const totalAll = list.length;
        const cancelled = list.filter(b => b.status === "CANCELLED").length;
        return { totalQty, totalAll, cancelled };
    }, [list]);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="section-title">Organizer · Bookings</h2>
                <div className="d-flex gap-2">
                    <select
                        className="form-select form-select-sm"
                        value={selectedId ?? ""}
                        onChange={(e) => setSelectedId(Number(e.target.value))}
                        style={{ minWidth: 260 }}
                    >
                        {events.length === 0 && <option value="">No events</option>}
                        {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                                #{ev.id} · {ev.name}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => selectedId && loadBookings(selectedId)}
                        disabled={loading || selectedId == null}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {err && <div className="alert alert-danger">{err}</div>}

            <div className="row g-3 mb-3">
                <div className="col-md-4">
                    <div className="card p-3">
                        <div className="text-muted small">Total bookings</div>
                        <div className="h5 m-0">{totals.totalAll}</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card p-3">
                        <div className="text-muted small">Confirmed quantity</div>
                        <div className="h5 m-0">{totals.totalQty}</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card p-3">
                        <div className="text-muted small">Cancelled bookings</div>
                        <div className="h5 m-0">{totals.cancelled}</div>
                    </div>
                </div>
            </div>

            <div className="card p-0">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                    <tr>
                        <th style={{ width: 90 }}>ID</th>
                        <th>User</th>
                        <th>Ticket Type</th>
                        <th>Qty</th>
                        <th>Status</th>
                        <th>Created</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-4 text-muted">
                                No bookings for this event
                            </td>
                        </tr>
                    )}
                    {list.map((b) => (
                        <tr key={b.id}>
                            <td>#{b.id}</td>
                            <td>{b.userId}</td>
                            <td>{b.ticketTypeId}</td>
                            <td>{b.quantity}</td>
                            <td>
                  <span
                      className={`badge ${
                          b.status === "CONFIRMED" ? "bg-success" : "bg-secondary"
                      }`}
                  >
                    {b.status}
                  </span>
                            </td>
                            <td>{new Date(b.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
