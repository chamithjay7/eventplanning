import { useState, useEffect } from "react";
import api from "../../api/axios";

export type BookingFormValues = {
    ticketTypeId: number | "";
    quantity: number | "";
};

type TicketType = {
    id: number;
    name: string;
    price: number;
    capacity: number;
    sold: number;
};

type Props = {
    eventId: number;
    onClose: () => void;
    onBooked: () => void;
};

export default function BookingForm({ eventId, onClose, onBooked }: Props) {
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [form, setForm] = useState<BookingFormValues>({ ticketTypeId: "", quantity: 1 });
    const [loading, setLoading] = useState(false);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    useEffect(() => {
        loadTicketTypes();
    }, [eventId]);

    const loadTicketTypes = async () => {
        try {
            setLoadingTickets(true);
            const res = await api.get<TicketType[]>(`/api/events/${eventId}/ticket-types`);
            setTicketTypes(res.data);
            if (res.data.length === 0) {
                setErr("No ticket types available for this event");
            }
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Failed to load ticket types");
        } finally {
            setLoadingTickets(false);
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.ticketTypeId || !form.quantity) {
            setErr("Please fill in all fields");
            return;
        }

        const selectedTicket = ticketTypes.find((t) => t.id === form.ticketTypeId);
        if (!selectedTicket) {
            setErr("Invalid ticket type selected");
            return;
        }

        const available = selectedTicket.capacity - selectedTicket.sold;
        if (form.quantity > available) {
            setErr(`Only ${available} tickets available for this type`);
            return;
        }

        try {
            setLoading(true);
            setErr("");
            await api.post(`/api/bookings`, {
                eventId: eventId,
                ticketTypeId: form.ticketTypeId,
                quantity: form.quantity,
            });
            setMsg("Booking successful! Redirecting...");
            setTimeout(() => {
                onBooked();
                onClose();
            }, 1500);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Booking failed");
        } finally {
            setLoading(false);
        }
    };

    const selectedTicket = ticketTypes.find((t) => t.id === form.ticketTypeId);
    const totalPrice = selectedTicket && form.quantity ? selectedTicket.price * (form.quantity as number) : 0;

    if (loadingTickets) {
        return (
            <div className="card p-4">
                <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-2 text-muted">Loading ticket types...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="me-2"
                        viewBox="0 0 16 16"
                        style={{ marginTop: "-3px" }}
                    >
                        <path d="M4 4.85v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Z"/>
                        <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3h-13ZM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.05a2.5 2.5 0 0 0 0 4.9v1.05a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.05a2.5 2.5 0 0 0 0-4.9V4.5Z"/>
                    </svg>
                    Book Your Tickets
                </h5>
            </div>

            <div className="card-body p-4">
                {msg && (
                    <div className="alert alert-success d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                        </svg>
                        {msg}
                    </div>
                )}
                {err && (
                    <div className="alert alert-danger d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                        </svg>
                        {err}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="form-label fw-semibold">
                            Select Ticket Type
                            <span className="text-danger">*</span>
                        </label>
                        <select
                            className="form-select form-select-lg"
                            value={form.ticketTypeId}
                            onChange={(e) => setForm((f) => ({ ...f, ticketTypeId: Number(e.target.value) }))}
                            required
                            disabled={ticketTypes.length === 0}
                        >
                            <option value="">Choose a ticket type...</option>
                            {ticketTypes.map((t) => {
                                const available = t.capacity - t.sold;
                                return (
                                    <option key={t.id} value={t.id} disabled={available <= 0}>
                                        {t.name} — Rs. {t.price.toLocaleString()}
                                        {available > 0 ? ` (${available} available)` : " (SOLD OUT)"}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-semibold">
                            Quantity
                            <span className="text-danger">*</span>
                        </label>
                        <input
                            type="number"
                            className="form-control form-control-lg"
                            min={1}
                            max={selectedTicket ? selectedTicket.capacity - selectedTicket.sold : 10}
                            value={form.quantity}
                            onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                            required
                        />
                        {selectedTicket && (
                            <small className="text-muted">
                                Maximum: {selectedTicket.capacity - selectedTicket.sold} tickets
                            </small>
                        )}
                    </div>

                    {/* Price Summary */}
                    {totalPrice > 0 && (
                        <div className="alert alert-info mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-semibold">Total Amount:</span>
                                <span className="fs-4 fw-bold text-primary">
                                    Rs. {totalPrice.toLocaleString()}
                                </span>
                            </div>
                            {selectedTicket && (
                                <small className="text-muted">
                                    {form.quantity} × {selectedTicket.name} @ Rs. {selectedTicket.price.toLocaleString()}
                                </small>
                            )}
                        </div>
                    )}

                    <div className="d-flex gap-2">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg flex-grow-1"
                            disabled={loading || ticketTypes.length === 0}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16" style={{ marginTop: "-3px" }}>
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                    </svg>
                                    Confirm Booking
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-lg"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <div className="card-footer bg-light">
                <small className="text-muted d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                    </svg>
                    Your booking will be confirmed immediately after submission
                </small>
            </div>
        </div>
    );
}
