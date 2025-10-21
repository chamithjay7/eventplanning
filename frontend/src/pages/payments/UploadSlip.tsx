import { useState } from "react";
import api from "../../api/axios";

type Props = {
    bookingId: number;
};

export default function UploadSlip({ bookingId }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const upload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setMessage("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            setMessage("Uploading...");
            const res = await api.post(`/api/payments/bookings/${bookingId}/bank-transfer`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage(`✅ Uploaded successfully! Payment ID: ${res.data.id}`);
            setFile(null);
        } catch (err: any) {
            console.error(err);
            setMessage(err?.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card p-3 shadow-sm">
            <h5 className="mb-3">Upload Bank-Transfer Slip</h5>
            <form onSubmit={upload} className="d-flex flex-column gap-3">
                <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFile}
                    className="form-control"
                />
                <button type="submit" className="btn btn-primary" disabled={!file || uploading}>
                    {uploading ? "Uploading…" : "Upload"}
                </button>
            </form>
            {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>
    );
}
