import { useState } from "react";

export type EventFormValues = {
    name: string;
    description: string;
    location: string;
    startTime: string; // ISO date-time local string
    endTime: string;   // ISO date-time local string
};

export default function EventForm({
                                      initial,
                                      submitting,
                                      onCancel,
                                      onSubmit,
                                      title = "Create Event",
                                  }: {
    initial: EventFormValues;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (v: EventFormValues) => void | Promise<void>;
    title?: string;
}) {
    const [form, setForm] = useState<EventFormValues>(initial);

    return (
        <div className="card p-3 mb-3">
            <h5 className="mb-3">{title}</h5>
            <form
                className="row g-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(form);
                }}
            >
                <div className="col-md-4">
                    <label className="form-label">Name</label>
                    <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-8">
                    <label className="form-label">Location</label>
                    <input
                        className="form-control"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        required
                    />
                </div>
                <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Start</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={form.startTime}
                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">End</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={form.endTime}
                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                        required
                    />
                </div>
                <div className="col-12 d-flex gap-2 mt-2">
                    <button className="btn btn-primary btn-sm" disabled={!!submitting}>
                        {submitting ? "Saving…" : "Save"}
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
