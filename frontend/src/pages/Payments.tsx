import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";

/** ---------- Types ---------- */
type Payment = {
    id: number;
    bookingId: number;
    eventId: number;
    payerUsername: string;
    method: "CARD" | "CASH" | "BANK";
    amount: number;
    status: "PENDING" | "SUCCESS" | "FAILED";
    reference?: string;
    createdAt: string;
    updatedAt: string;
};

type MyBooking = {
    id: number;
    eventId?: number;
    eventName?: string;      // we’ll try to read this if backend returns it
    quantity?: number;
    total?: number;
};

type NewPaymentForm = {
    bookingId: number | "";
    method: "CARD" | "CASH" | "BANK";
    amount: string;          // keep as string for inputs, convert to number on submit
    reference: string;
};

/** ---------- Component ---------- */
export default function Payments() {
    const [list, setList] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [msg, setMsg] = useState("");
    const role = localStorage.getItem("role");

    // modal state
    const [showNew, setShowNew] = useState(false);
    const [creating, setCreating] = useState(false);
    const [bookings, setBookings] = useState<MyBooking[] | null>(null);
    const [form, setForm] = useState<NewPaymentForm>({
        bookingId: "",
        method: "CARD",
        amount: "",
        reference: "",
    });

    /** -------- Loaders -------- */
    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const url = role === "ADMIN" ? "/api/payments" : "/api/payments/me";
            const res = await api.get<Payment[]>(url);
            setList(res.data);
        } catch (e: any) {
            setError("Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    // Try load “my bookings” for dropdown (fallback to manual booking id)
    const loadMyBookings = async () => {
        try {
            const res = await api.get<MyBooking[]>("/api/bookings/me"); // if you already have this endpoint
            setBookings(res.data);
        } catch {
            setBookings([]); // empty => fallback UI
        }
    };

    useEffect(() => {
        load();
    }, []);

    /** -------- Admin actions -------- */
    const markSuccess = async (id: number) => {
        if (!confirm("Mark as paid?")) return;
        try {
            await api.patch(`/api/payments/${id}/success`);
            setMsg("✅ Payment marked as success");
            await load();
        } catch {
            setError("Failed to update");
        }
    };

    const markFail = async (id: number) => {
        if (!confirm("Mark as failed?")) return;
        try {
            await api.patch(`/api/payments/${id}/fail`);
            setMsg("❌ Payment marked as failed");
            await load();
        } catch {
            setError("Failed to update");
        }
    };

    const remove = async (id: number) => {
        if (!confirm("Delete this payment?")) return;
        try {
            await api.delete(`/api/payments/${id}`);
            setMsg("🗑️ Payment deleted");
            await load();
        } catch {
            setError("Delete failed");
        }
    };

    /** -------- Create Payment (user) -------- */
    const openNew = async () => {
        setForm({ bookingId: "", method: "CARD", amount: "", reference: "" });
        setShowNew(true);
        await loadMyBookings();
    };

    const createPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg("");
        setError("");
        if (!form.bookingId) {
            setError("Please select (or enter) a booking");
            return;
        }
        const amountNum = Number(form.amount);
        if (!Number.isFinite(amountNum) || amountNum < 0) {
            setError("Amount must be a valid non-negative number");
            return;
        }
        try {
            setCreating(true);
            const payload = {
                bookingId: Number(form.bookingId),
                method: form.method,
                amount: amountNum,
                reference: form.reference?.trim() || undefined,
            };
            await api.post("/api/payments", payload);
            setMsg("💳 Payment submitted");
            setShowNew(false);
            await load();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Create payment failed");
        } finally {
            setCreating(false);
        }
    };

    /** -------- Render helpers -------- */
    const headerRight = useMemo(
        () => (
            <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm" onClick={load} disabled={loading}>
                    Refresh
                </button>

                {/* Only non-admins create new payments */}
                {role !== "ADMIN" && (
                    <button className="btn btn-primary btn-sm" onClick={openNew}>
                        + New Payment
                    </button>
                )}
            </div>
        ),
        [loading, role]
    );

    if (loading)
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" />
            </div>
        );

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="section-title">Payments</h2>
                {headerRight}
            </div>

            {msg && <div className="alert alert-success">{msg}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card p-0">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                    <tr>
                        <th style={{ width: 70 }}>ID</th>
                        <th>Booking</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Reference</th>
                        <th style={{ width: 220 }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center py-4 text-muted">
                                No payments found
                            </td>
                        </tr>
                    )}
                    {list.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>
                                <div className="fw-semibold">#{p.bookingId}</div>
                                <div className="small text-muted">Event {p.eventId}</div>
                                <div className="small text-muted">{p.payerUsername}</div>
                            </td>
                            <td>Rs. {p.amount.toFixed(2)}</td>
                            <td>{p.method}</td>
                            <td>
                  <span
                      className={`badge ${
                          p.status === "SUCCESS"
                              ? "bg-success"
                              : p.status === "FAILED"
                                  ? "bg-danger"
                                  : "bg-secondary"
                      }`}
                  >
                    {p.status}
                  </span>
                            </td>
                            <td>{p.reference || "-"}</td>
                            <td className="d-flex flex-wrap gap-2">
                                {role === "ADMIN" && (
                                    <>
                                        {p.status !== "SUCCESS" && (
                                            <button
                                                className="btn btn-outline-success btn-sm"
                                                onClick={() => markSuccess(p.id)}
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {p.status !== "FAILED" && (
                                            <button
                                                className="btn btn-outline-warning btn-sm"
                                                onClick={() => markFail(p.id)}
                                            >
                                                Fail
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => remove(p.id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* -------- New Payment Modal -------- */}
            {showNew && (
                <Modal
                    title="New Payment"
                    onClose={() => setShowNew(false)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setShowNew(false)} disabled={creating}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" form="paymentForm" disabled={creating}>
                                {creating ? "Saving…" : "Pay"}
                            </button>
                        </>
                    }
                >
                    <form id="paymentForm" className="row g-3" onSubmit={createPayment}>
                        {/* Booking selector */}
                        {bookings && bookings.length > 0 ? (
                            <div className="col-12">
                                <label className="form-label">Booking</label>
                                <select
                                    className="form-select"
                                    value={String(form.bookingId)}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, bookingId: e.target.value ? Number(e.target.value) : "" }))
                                    }
                                    required
                                >
                                    <option value="">Select a booking…</option>
                                    {bookings.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            #{b.id} {b.eventName ? `— ${b.eventName}` : ""}{" "}
                                            {b.total ? `— Rs.${b.total}` : ""}
                                        </option>
                                    ))}
                                </select>
                                <div className="form-text">
                                    Showing your bookings. If you don’t see it, you can type the booking ID below.
                                </div>
                            </div>
                        ) : (
                            <div className="col-12">
                                <label className="form-label">Booking ID</label>
                                <input
                                    className="form-control"
                                    placeholder="e.g. 42"
                                    value={form.bookingId}
                                    onChange={(e) => {
                                        const v = e.target.value.trim();
                                        setForm((f) => ({ ...f, bookingId: v === "" ? "" : Number(v) }));
                                    }}
                                    required
                                />
                                <div className="form-text">
                                    (Couldn’t load your bookings list — enter the Booking ID manually.)
                                </div>
                            </div>
                        )}

                        {/* Method */}
                        <div className="col-md-6">
                            <label className="form-label">Method</label>
                            <select
                                className="form-select"
                                value={form.method}
                                onChange={(e) => setForm((f) => ({ ...f, method: e.target.value as any }))}
                            >
                                <option value="CARD">CARD</option>
                                <option value="CASH">CASH</option>
                                <option value="BANK">BANK</option>
                            </select>
                        </div>

                        {/* Amount */}
                        <div className="col-md-6">
                            <label className="form-label">Amount (Rs.)</label>
                            <input
                                className="form-control"
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                                required
                            />
                        </div>

                        {/* Reference */}
                        <div className="col-12">
                            <label className="form-label">Reference (optional)</label>
                            <input
                                className="form-control"
                                placeholder="Transaction ID / Bank ref"
                                value={form.reference}
                                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                            />
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
