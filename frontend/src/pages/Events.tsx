import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

import Modal from "../components/Modal";
import EventForm from "./parts/EventForm";
import type { EventFormValues } from "./parts/EventForm";
import BookingForm from "./parts/BookingForm";

type EventItem = {
    id: number;
    name: string;
    description: string;
    location: string;
    startTime: string; // ISO
    endTime: string;   // ISO
    status: "DRAFT" | "PUBLISHED" | "CANCELLED";
    createdAt: string;
    updatedAt: string;
};

type Page<T> = {
    content: T[];
    number: number;
    totalPages: number;
    totalElements: number;
};

const emptyVals: EventFormValues = {
    name: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
};

export default function Events() {
    const [page, setPage] = useState<Page<EventItem> | null>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const [q, setQ] = useState("");
    const [scope, setScope] = useState<"" | "upcoming" | "past">("");
    const [showCreate, setShowCreate] = useState(false);
    const [details, setDetails] = useState<EventItem | null>(null);
    const [editing, setEditing] = useState<EventItem | null>(null);
    const [bookingEvent, setBookingEvent] = useState<number | null>(null);

    const role = localStorage.getItem("role");

    useEffect(() => {
        load(0);
    }, [scope]);

    const load = async (p: number) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.set("page", String(p));
            params.set("size", "10");
            if (q.trim()) params.set("q", q.trim());
            if (scope) params.set("scope", scope);
            const res = await api.get<Page<EventItem>>(`/api/events?${params.toString()}`);
            setPage(res.data);
            setErr("");
        } catch (e: any) {
            setErr("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const headerRight = useMemo(
        () => (
            <div className="d-flex gap-2 flex-wrap">
                <select
                    className="form-select form-select-sm"
                    value={scope}
                    onChange={(e) => setScope(e.target.value as any)}
                    style={{ width: 160 }}
                >
                    <option value="">All Events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past Events</option>
                </select>

                <input
                    className="form-control form-control-sm"
                    placeholder="Search events..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && load(0)}
                    style={{ minWidth: 220 }}
                />
                <button className="btn btn-outline-secondary btn-sm" onClick={() => load(0)} disabled={loading}>
                    Search
                </button>

                {role === "ORGANIZER" && (
                    <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                        + New Event
                    </button>
                )}
            </div>
        ),
        [q, loading, scope, role]
    );

    const toIso = (s: string) => new Date(s).toISOString();

    const submitCreate = async (v: EventFormValues) => {
        setMsg("");
        setErr("");
        try {
            await api.post("/api/events", {
                ...v,
                startTime: toIso(v.startTime),
                endTime: toIso(v.endTime),
            });
            setMsg("Event created successfully");
            setShowCreate(false);
            await load(page?.number ?? 0);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Create failed");
        }
    };

    const openEdit = (e: EventItem) => setEditing(e);

    const submitEdit = async (v: EventFormValues) => {
        if (!editing) return;
        setMsg("");
        setErr("");
        try {
            await api.put(`/api/events/${editing.id}`, {
                ...v,
                startTime: toIso(v.startTime),
                endTime: toIso(v.endTime),
            });
            setMsg("Event updated successfully");
            setEditing(null);
            await load(page?.number ?? 0);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Update failed");
        }
    };

    const publish = async (id: number) => {
        try {
            await api.patch(`/api/events/${id}/publish`);
            setMsg("Event published successfully");
            await load(page?.number ?? 0);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Publish failed");
        }
    };

    const cancel = async (id: number) => {
        try {
            await api.patch(`/api/events/${id}/cancel`);
            setMsg("Event cancelled");
            await load(page?.number ?? 0);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Cancel failed");
        }
    };

    const remove = async (id: number) => {
        if (!confirm("Delete this event?")) return;
        try {
            await api.delete(`/api/events/${id}`);
            setMsg("Event deleted");
            await load(page?.number ?? 0);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Delete failed (Admin only?)");
        }
    };

    if (!page) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="section-title mb-1">Events</h2>
                    <p className="text-muted small mb-0">Discover and manage amazing events</p>
                </div>
                {headerRight}
            </div>

            {msg && <div className="alert alert-success">{msg}</div>}
            {err && <div className="alert alert-danger">{err}</div>}

            {/* Create Form */}
            {showCreate && (
                <EventForm
                    initial={emptyVals}
                    onCancel={() => setShowCreate(false)}
                    onSubmit={submitCreate}
                    title="Create Event"
                />
            )}

            {/* Edit Form */}
            {editing && (
                <EventForm
                    initial={{
                        name: editing.name,
                        description: editing.description,
                        location: editing.location,
                        startTime: new Date(editing.startTime).toISOString().slice(0, 16),
                        endTime: new Date(editing.endTime).toISOString().slice(0, 16),
                    }}
                    onCancel={() => setEditing(null)}
                    onSubmit={submitEdit}
                    title={`Edit Event #${editing.id}`}
                />
            )}

            {/* Events Grid */}
            {page.content.length === 0 ? (
                <div className="card p-5 text-center">
                    <div className="text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-calendar-x mb-3" viewBox="0 0 16 16">
                            <path d="M6.146 7.146a.5.5 0 0 1 .708 0L8 8.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 9l1.147 1.146a.5.5 0 0 1-.708.708L8 9.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 9 6.146 7.854a.5.5 0 0 1 0-.708z"/>
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                        </svg>
                        <h5>No events found</h5>
                        <p>Try adjusting your search or filters</p>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {page.content.map((e) => (
                        <div key={e.id} className="col-md-6 col-lg-4">
                            <div className="card h-100 shadow-sm border-0" style={{
                                transition: "all 0.3s ease",
                                cursor: "pointer"
                            }}
                            onMouseEnter={(el) => {
                                el.currentTarget.style.transform = "translateY(-8px)";
                                el.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={(el) => {
                                el.currentTarget.style.transform = "translateY(0)";
                                el.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                            }}>
                                {/* Card Header with gradient */}
                                <div className="card-header border-0 text-white" style={{
                                    background: e.status === "PUBLISHED"
                                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                        : e.status === "CANCELLED"
                                        ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                                        : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                    padding: "1.5rem"
                                }}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <h5 className="card-title mb-2 fw-bold">{e.name}</h5>
                                            <div className="d-flex align-items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                                </svg>
                                                <small className="opacity-90">{e.location}</small>
                                            </div>
                                        </div>
                                        <span className={`badge ${
                                            e.status === "PUBLISHED"
                                                ? "bg-success"
                                                : e.status === "CANCELLED"
                                                    ? "bg-danger"
                                                    : "bg-secondary"
                                        }`} style={{ fontSize: "0.7rem" }}>
                                            {e.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <p className="card-text text-muted small mb-3" style={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden"
                                    }}>
                                        {e.description}
                                    </p>

                                    {/* Date & Time */}
                                    <div className="mb-3">
                                        <div className="d-flex align-items-start gap-2 mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-primary mt-1" viewBox="0 0 16 16">
                                                <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                                            </svg>
                                            <div className="small">
                                                <div className="fw-semibold text-dark">
                                                    {new Date(e.startTime).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-muted">
                                                    {new Date(e.startTime).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })} - {new Date(e.endTime).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex flex-wrap gap-2">
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => setDetails(e)}
                                        >
                                            View Details
                                        </button>

                                        {role === "ORGANIZER" && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => openEdit(e)}
                                                >
                                                    Edit
                                                </button>
                                                {e.status !== "PUBLISHED" && (
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => publish(e.id)}
                                                    >
                                                        Publish
                                                    </button>
                                                )}
                                                {e.status !== "CANCELLED" && (
                                                    <button
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() => cancel(e.id)}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {role === "USER" && e.status === "PUBLISHED" && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => setBookingEvent(e.id)}
                                            >
                                                Book Now
                                            </button>
                                        )}

                                        {role === "ADMIN" && (
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => remove(e.id)}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="card-footer bg-light border-0 small text-muted">
                                    ID: #{e.id}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="d-flex gap-2 align-items-center justify-content-center mt-4">
                <button
                    className="btn btn-outline-primary btn-sm"
                    disabled={page.number <= 0 || loading}
                    onClick={() => load(page.number - 1)}
                >
                    Previous
                </button>
                <span className="px-3 text-muted">
                    Page {page.number + 1} of {Math.max(1, page.totalPages)} • {page.totalElements} total events
                </span>
                <button
                    className="btn btn-outline-primary btn-sm"
                    disabled={page.number >= page.totalPages - 1 || loading}
                    onClick={() => load(page.number + 1)}
                >
                    Next
                </button>
            </div>

            {/* DETAILS MODAL */}
            {details && (
                <Modal
                    title={details.name}
                    onClose={() => setDetails(null)}
                    footer={
                        <button className="btn btn-secondary" onClick={() => setDetails(null)}>
                            Close
                        </button>
                    }
                >
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="text-muted small mb-1">Status</div>
                            <span
                                className={`badge ${
                                    details.status === "PUBLISHED"
                                        ? "bg-success"
                                        : details.status === "CANCELLED"
                                            ? "bg-danger"
                                            : "bg-secondary"
                                }`}
                            >
                                {details.status}
                            </span>
                        </div>
                        <div className="col-md-6">
                            <div className="text-muted small mb-1">Location</div>
                            <div className="fw-semibold">{details.location}</div>
                        </div>
                        <div className="col-md-6">
                            <div className="text-muted small mb-1">Event ID</div>
                            <div className="fw-semibold">#{details.id}</div>
                        </div>
                        <div className="col-md-6">
                            <div className="text-muted small mb-1">Start Time</div>
                            <div className="fw-semibold">{new Date(details.startTime).toLocaleString()}</div>
                        </div>
                        <div className="col-md-6">
                            <div className="text-muted small mb-1">End Time</div>
                            <div className="fw-semibold">{new Date(details.endTime).toLocaleString()}</div>
                        </div>
                        <div className="col-12">
                            <div className="text-muted small mb-1">Description</div>
                            <div className="fw-semibold">{details.description}</div>
                        </div>
                        <div className="col-12">
                            <div className="text-muted small mb-1">Created / Updated</div>
                            <div className="small">
                                {new Date(details.createdAt).toLocaleString()} | {new Date(details.updatedAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* BOOKING MODAL */}
            {bookingEvent && (
                <Modal
                    title={`Book Tickets — Event #${bookingEvent}`}
                    onClose={() => setBookingEvent(null)}
                    footer={null}
                >
                    <BookingForm
                        eventId={bookingEvent}
                        onClose={() => setBookingEvent(null)}
                        onBooked={() => load(page?.number ?? 0)}
                    />
                </Modal>
            )}
        </div>
    );
}
