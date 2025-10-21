import { useEffect, useState } from "react";
import api from "../../api/axios";

type Payment = {
    id: number;
    status: string;
    amount: number;
    slipPath: string;
    event: { id: number; name: string };
    payer: { id: number; email: string };
    createdAt: string;
};

export default function AdminPayments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPending = async () => {
        try {
            setLoading(true);
            const res = await api.get<Payment[]>("/api/payments?status=PENDING");
            setPayments(res.data);
            setError("");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, action: "approve" | "reject") => {
        try {
            await api.post(`/api/payments/${id}/${action}`);
            setPayments(p => p.filter(pay => pay.id !== id));
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to update status");
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    if (loading) return <div className="alert alert-info">Loading pending payments…</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!payments.length) return <div className="alert alert-warning">No pending payments</div>;

    return (
        <div className="container mt-3">
            <h4>Pending Bank-Transfer Payments</h4>
            <table className="table table-striped mt-3">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Event</th>
                    <th>Payer</th>
                    <th>Amount</th>
                    <th>Slip</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {payments.map(p => (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.event?.name}</td>
                        <td>{p.payer?.email}</td>
                        <td>{p.amount?.toFixed(2)}</td>
                        <td>
                            {p.slipPath ? (
                                <a
                                    href={`http://localhost:8081${p.slipPath}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    View Slip
                                </a>
                            ) : (
                                "—"
                            )}
                        </td>
                        <td>
                            <button
                                className="btn btn-success btn-sm me-2"
                                onClick={() => updateStatus(p.id, "approve")}
                            >
                                Approve
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => updateStatus(p.id, "reject")}
                            >
                                Reject
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
