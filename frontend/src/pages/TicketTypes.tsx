import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

type EventItem = {
    id: number;
    name: string;
};

type TicketType = {
    id: number;
    name: string;
    price: number;
    capacity: number;
    sold: number;
};

type FormVals = {
    name: string;
    price: string;
    capacity: string;
};

const emptyForm: FormVals = { name: "", price: "", capacity: "" };

export default function TicketTypes() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | "">("");
    const [list, setList] = useState<TicketType[]>([]);
    const [form, setForm] = useState<FormVals>(emptyForm);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId === "") return;
        loadTypes(Number(selectedEventId));
    }, [selectedEventId]);

    const loadEvents = async () => {
        setErr("");
        try {
            const res = await api.get<EventItem[]>("/api/events/mine");
            setEvents(res.data);
            if (res.data.length > 0) setSelectedEventId(res.data[0].id);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Failed to load your events");
        }
    };

    const loadTypes = async (eventId: number) => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get<TicketType[]>(`/api/events/${eventId}/ticket-types`);
            setList(res.data);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Failed to load ticket types");
        } finally {
            setLoading(false);
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEventId === "") return;
        setErr("");
        setMsg("");
        try {
            await api.post(`/api/events/${selectedEventId}/ticket-types`, {
                name: form.name.trim(),
                price: form.price ? Number(form.price) : 0,
                capacity: form.capacity ? Number(form.capacity) : 0,
            });
            setMsg("Ticket type created successfully");
            setForm(emptyForm);
            setShowForm(false);
            await loadTypes(Number(selectedEventId));
        } catch (ex: any) {
            setErr(ex?.response?.data?.message || "Failed to add ticket type");
        }
    };

    const deleteTicket = async (ticketId: number) => {
        if (!confirm("Delete this ticket type? All related bookings will be affected!")) return;
        if (selectedEventId === "") return;

        try {
            await api.delete(`/api/events/${selectedEventId}/ticket-types/${ticketId}`);
            setMsg("Ticket type deleted");
            await loadTypes(Number(selectedEventId));
        } catch (ex: any) {
            setErr(ex?.response?.data?.message || "Delete failed");
        }
    };

    const totals = useMemo(() => {
        const capacity = list.reduce((s, t) => s + (t.capacity || 0), 0);
        const sold = list.reduce((s, t) => s + (t.sold || 0), 0);
        const revenue = list.reduce((s, t) => s + (t.sold || 0) * (t.price || 0), 0);
        return { capacity, sold, remaining: Math.max(0, capacity - sold), revenue };
    }, [list]);

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="section-title mb-1">Ticket Types</h2>
                    <p className="text-muted small mb-0">Manage ticket categories for your events</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <select
                        className="form-select form-select-sm"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : "")}
                        style={{ minWidth: 200 }}
                    >
                        {events.length === 0 && <option value="">No events</option>}
                        {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                                #{ev.id} - {ev.name}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowForm(!showForm)}
                        disabled={selectedEventId === ""}
                    >
                        {showForm ? "Cancel" : "+ Add Ticket Type"}
                    </button>
                </div>
            </div>

            {msg && <div className="alert alert-success">{msg}</div>}
            {err && <div className="alert alert-danger">{err}</div>}

            {/* Add Form */}
            {showForm && (
                <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Create New Ticket Type</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={submit}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">
                                        Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., VIP, Regular, Student"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                        maxLength={100}
                                    />
                                    <small className="text-muted">Ticket category name</small>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">
                                        Price (Rs.) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="2000"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                    <small className="text-muted">Ticket price</small>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">
                                        Capacity <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="100"
                                        value={form.capacity}
                                        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                                        required
                                        min="1"
                                    />
                                    <small className="text-muted">Total tickets available</small>
                                </div>
                            </div>
                            <div className="d-flex gap-2 mt-3">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? "Creating..." : "Create Ticket Type"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Ticket Types Grid */}
            {loading && list.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                </div>
            ) : list.length === 0 ? (
                <div className="card p-5 text-center">
                    <div className="text-muted">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="64"
                            fill="currentColor"
                            className="mb-3"
                            viewBox="0 0 16 16"
                        >
                            <path d="M4 4.85v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Z" />
                            <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3h-13ZM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.05a2.5 2.5 0 0 0 0 4.9v1.05a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.05a2.5 2.5 0 0 0 0-4.9V4.5Z" />
                        </svg>
                        <h5>No ticket types yet</h5>
                        <p>Add your first ticket type to start selling tickets!</p>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {list.map((ticket) => {
                        const available = ticket.capacity - ticket.sold;
                        const soldPercentage = (ticket.sold / ticket.capacity) * 100;

                        return (
                            <div key={ticket.id} className="col-md-6 col-lg-4">
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
                                    {/* Header */}
                                    <div
                                        className="card-header border-0 text-white"
                                        style={{
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            padding: "1.5rem",
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h5 className="card-title mb-2 fw-bold">{ticket.name}</h5>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="fs-3 fw-bold">
                                                        Rs. {ticket.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <span
                                                className={`badge ${
                                                    available > 0 ? "bg-success" : "bg-danger"
                                                }`}
                                            >
                                                {available > 0 ? "Available" : "Sold Out"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="card-body">
                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="small text-muted">Tickets Sold</span>
                                                <span className="small fw-semibold">
                                                    {ticket.sold} / {ticket.capacity}
                                                </span>
                                            </div>
                                            <div className="progress" style={{ height: "8px" }}>
                                                <div
                                                    className={`progress-bar ${
                                                        soldPercentage >= 100
                                                            ? "bg-danger"
                                                            : soldPercentage >= 75
                                                            ? "bg-warning"
                                                            : "bg-success"
                                                    }`}
                                                    style={{ width: `${soldPercentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <div className="card bg-light border-0">
                                                    <div className="card-body p-2 text-center">
                                                        <div className="fw-bold text-success fs-5">
                                                            {available}
                                                        </div>
                                                        <small className="text-muted">Available</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="card bg-light border-0">
                                                    <div className="card-body p-2 text-center">
                                                        <div className="fw-bold text-primary fs-5">
                                                            Rs. {(ticket.sold * ticket.price).toLocaleString()}
                                                        </div>
                                                        <small className="text-muted">Revenue</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            className="btn btn-outline-danger btn-sm w-100"
                                            onClick={() => deleteTicket(ticket.id)}
                                        >
                                            Delete Ticket Type
                                        </button>
                                    </div>

                                    {/* Footer */}
                                    <div className="card-footer bg-light border-0 small text-muted">
                                        ID: #{ticket.id}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Summary Stats */}
            {list.length > 0 && (
                <div className="row g-3 mt-4">
                    <div className="col-md-3">
                        <div className="card border-0 bg-primary bg-opacity-10">
                            <div className="card-body text-center">
                                <h3 className="text-primary mb-0">{list.length}</h3>
                                <small className="text-muted">Ticket Types</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 bg-success bg-opacity-10">
                            <div className="card-body text-center">
                                <h3 className="text-success mb-0">{totals.remaining}</h3>
                                <small className="text-muted">Available</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 bg-warning bg-opacity-10">
                            <div className="card-body text-center">
                                <h3 className="text-warning mb-0">{totals.sold}</h3>
                                <small className="text-muted">Total Sold</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 bg-info bg-opacity-10">
                            <div className="card-body text-center">
                                <h3 className="text-info mb-0">Rs. {totals.revenue.toLocaleString()}</h3>
                                <small className="text-muted">Total Revenue</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
