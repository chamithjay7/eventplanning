import { useEffect, useState } from "react";
import api from "../api/axios";

type Payment = {
    id: number;
    bookingId: number;
    eventId: number;
    payerUsername: string;
    method: string;
    amount: number;
    status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
    reference?: string;
    createdAt: string;
    updatedAt: string;
};

export default function MyPayments() {
    const [list, setList] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get<Payment[]>("/api/payments/me");
            setList(res.data);
        } catch {
            setErr("Failed to load your payments");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="section-title">My Payments</h2>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={load}
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>

            {msg && <div className="alert alert-success">{msg}</div>}
            {err && <div className="alert alert-danger">{err}</div>}

            <div className="card p-0">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                    <tr>
                        <th style={{ width: 70 }}>ID</th>
                        <th>Event</th>
                        <th>Booking</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Reference</th>
                        <th>Created</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.length === 0 && (
                        <tr>
                            <td colSpan={8} className="text-center py-4 text-muted">
                                No payments yet
                            </td>
                        </tr>
                    )}
                    {list.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>Event #{p.eventId}</td>
                            <td>Booking #{p.bookingId}</td>
                            <td>Rs. {p.amount.toFixed(2)}</td>
                            <td>{p.method}</td>
                            <td>
                  <span
                      className={`badge ${
                          p.status === "SUCCESS"
                              ? "bg-success"
                              : p.status === "FAILED"
                                  ? "bg-danger"
                                  : p.status === "REFUNDED"
                                      ? "bg-warning"
                                      : "bg-secondary"
                      }`}
                  >
                    {p.status}
                  </span>
                            </td>
                            <td>{p.reference || "-"}</td>
                            <td>{new Date(p.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
