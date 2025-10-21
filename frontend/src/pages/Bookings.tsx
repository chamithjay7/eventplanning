import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";

type Booking = {
    id: number;
    eventTitle: string;
    status: string;
    createdAt: string;
};

export default function Bookings() {
    const [list, setList] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [filter, setFilter] = useState<"ALL" | "CONFIRMED" | "CANCELLED">("ALL");

    // View/Edit states
    const [viewBooking, setViewBooking] = useState<Booking | null>(null);
    const [editBooking, setEditBooking] = useState<Booking | null>(null);
    const [editQuantity, setEditQuantity] = useState<number>(1);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        setErr("");
        setMsg("");
        try {
            const res = await api.get<Booking[]>("/api/bookings/mine");
            setList(res.data);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (booking: Booking) => {
        setEditBooking(booking);
        setEditQuantity(1); // Default to 1, user can change
    };

    const submitEdit = async () => {
        if (!editBooking) return;

        try {
            await api.put(`/api/bookings/${editBooking.id}`, {
                eventId: 1, // Will be ignored by backend
                ticketTypeId: 1, // Will be ignored by backend
                quantity: editQuantity,
            });
            setMsg("Booking updated successfully");
            setEditBooking(null);
            await load();
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Update failed");
        }
    };

    const cancel = async (id: number) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await api.delete(`/api/bookings/${id}`);
            setMsg("Booking cancelled successfully");
            await load();
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Cancel failed");
        }
    };

    const filteredList = list.filter((b) => {
        if (filter === "ALL") return true;
        return b.status === filter;
    });

    if (loading) {
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
                    <h2 className="section-title mb-1">My Bookings</h2>
                    <p className="text-muted small mb-0">View and manage your event bookings</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <select
                        className="form-select form-select-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        style={{ width: 160 }}
                    >
                        <option value="ALL">All Bookings</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={load}
                        disabled={loading}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {msg && <div className="alert alert-success">{msg}</div>}
            {err && <div className="alert alert-danger">{err}</div>}

            {/* Bookings Grid */}
            {filteredList.length === 0 ? (
                <div className="card p-5 text-center">
                    <div className="text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-ticket-perforated mb-3" viewBox="0 0 16 16">
                            <path d="M4 4.85v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Z"/>
                            <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3h-13ZM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.05a2.5 2.5 0 0 0 0 4.9v1.05a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.05a2.5 2.5 0 0 0 0-4.9V4.5Z"/>
                        </svg>
                        <h5>No bookings found</h5>
                        <p>
                            {filter !== "ALL"
                                ? "Try adjusting your filter"
                                : "Book your first event to get started!"}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {filteredList.map((booking) => (
                        <div key={booking.id} className="col-md-6 col-lg-4">
                            <div
                                className="card h-100 shadow-sm border-0"
                                style={{
                                    transition: "all 0.3s ease",
                                }}
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
                                    className="card-header border-0 text-white"
                                    style={{
                                        background:
                                            booking.status === "CONFIRMED"
                                                ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                                                : booking.status === "CANCELLED"
                                                ? "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)"
                                                : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                        padding: "1.5rem",
                                    }}
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M4 4.85v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Z"/>
                                                    <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3h-13ZM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.05a2.5 2.5 0 0 0 0 4.9v1.05a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.05a2.5 2.5 0 0 0 0-4.9V4.5Z"/>
                                                </svg>
                                                <h6 className="mb-0 fw-bold">Booking #{booking.id}</h6>
                                            </div>
                                            <h5 className="card-title mb-0 fw-bold">{booking.eventTitle}</h5>
                                        </div>
                                        <span
                                            className={`badge ${
                                                booking.status === "CONFIRMED"
                                                    ? "bg-success"
                                                    : booking.status === "CANCELLED"
                                                    ? "bg-danger"
                                                    : "bg-secondary"
                                            }`}
                                            style={{ fontSize: "0.7rem" }}
                                        >
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-body">
                                    {/* Date */}
                                    <div className="mb-3">
                                        <div className="d-flex align-items-start gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-primary mt-1" viewBox="0 0 16 16">
                                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                                            </svg>
                                            <div className="small">
                                                <div className="text-muted mb-1">Booked on</div>
                                                <div className="fw-semibold text-dark">
                                                    {new Date(booking.createdAt).toLocaleDateString("en-US", {
                                                        weekday: "short",
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </div>
                                                <div className="text-muted">
                                                    {new Date(booking.createdAt).toLocaleTimeString("en-US", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex flex-wrap gap-2">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => setViewBooking(booking)}
                                        >
                                            View Details
                                        </button>

                                        {booking.status === "CONFIRMED" && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => openEdit(booking)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => cancel(booking.id)}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="card-footer bg-light border-0 small text-muted">
                                    <div className="d-flex justify-content-between">
                                        <span>ID: #{booking.id}</span>
                                        <span>
                                            {booking.status === "CONFIRMED" && (
                                                <span className="text-success">Active</span>
                                            )}
                                            {booking.status === "CANCELLED" && (
                                                <span className="text-danger">Inactive</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary Stats */}
            {list.length > 0 && (
                <div className="row g-3 mt-4">
                    <div className="col-md-4">
                        <div className="card border-0 bg-success bg-opacity-10">
                            <div className="card-body text-center">
                                <h3 className="text-success mb-0">
                                    {list.filter((b) => b.status === "CONFIRMED").length}
                                </h3>
                                <small className="text-muted">Confirmed Bookings</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 bg-danger bg-opacity-10">
                            <div className="card-body text-center">
                                <h3 className="text-danger mb-0">
                                    {list.filter((b) => b.status === "CANCELLED").length}
                                </h3>
                                <small className="text-muted">Cancelled Bookings</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 bg-primary bg-opacity-10">
                            <div className="card-body text-center">
                                <h3 className="text-primary mb-0">{list.length}</h3>
                                <small className="text-muted">Total Bookings</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW DETAILS MODAL */}
            {viewBooking && (
                <Modal
                    title={`Booking Details - #${viewBooking.id}`}
                    onClose={() => setViewBooking(null)}
                    footer={
                        <button className="btn btn-secondary" onClick={() => setViewBooking(null)}>
                            Close
                        </button>
                    }
                >
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="alert alert-info mb-3">
                                <strong>Event:</strong> {viewBooking.eventTitle}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="text-muted small mb-1">Booking ID</div>
                            <div className="fw-semibold">#{viewBooking.id}</div>
                        </div>
                        <div className="col-md-6">
                            <div className="text-muted small mb-1">Status</div>
                            <span
                                className={`badge ${
                                    viewBooking.status === "CONFIRMED"
                                        ? "bg-success"
                                        : "bg-danger"
                                }`}
                            >
                                {viewBooking.status}
                            </span>
                        </div>
                        <div className="col-12">
                            <div className="text-muted small mb-1">Booked On</div>
                            <div className="fw-semibold">
                                {new Date(viewBooking.createdAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* EDIT MODAL */}
            {editBooking && (
                <Modal
                    title={`Edit Booking - #${editBooking.id}`}
                    onClose={() => setEditBooking(null)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setEditBooking(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={submitEdit}>
                                Update Booking
                            </button>
                        </>
                    }
                >
                    <div className="mb-3">
                        <div className="alert alert-warning">
                            <strong>Note:</strong> You can only change the quantity. Ticket type cannot be changed.
                        </div>
                    </div>
                    <div className="mb-3">
                        <div className="text-muted small mb-1">Event</div>
                        <div className="fw-semibold">{editBooking.eventTitle}</div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            New Quantity <span className="text-danger">*</span>
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            min="1"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(Number(e.target.value))}
                            required
                        />
                        <small className="text-muted">
                            Enter the new number of tickets you want
                        </small>
                    </div>
                </Modal>
            )}
        </div>
    );
}
