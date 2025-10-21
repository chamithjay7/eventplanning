import { useEffect, useState } from "react";
import api from "../api/axios";

type Event = {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    venue: string;
};

export default function MyEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formVisible, setFormVisible] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        venue: "",
    });

    const loadEvents = async () => {
        try {
            const res = await api.get<Event[]>("/api/events/mine");
            setEvents(res.data);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/api/events", form);
            setForm({
                title: "",
                description: "",
                startTime: "",
                endTime: "",
                venue: "",
            });
            setFormVisible(false);
            loadEvents();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to create event");
        }
    };

    if (loading) return <div className="container py-4">Loading...</div>;
    if (error) return <div className="container py-4 text-danger">{error}</div>;

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>My Events</h3>
                <button className="btn btn-success" onClick={() => setFormVisible(!formVisible)}>
                    {formVisible ? "Close Form" : "Create New Event"}
                </button>
            </div>

            {formVisible && (
                <form onSubmit={handleSubmit} className="card p-3 mb-4 shadow-sm">
                    <h5>Create Event</h5>
                    <div className="mb-2">
                        <label className="form-label">Title</label>
                        <input
                            className="form-control"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Start Time</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">End Time</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Venue</label>
                        <input
                            className="form-control"
                            name="venue"
                            value={form.venue}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button className="btn btn-primary">Save Event</button>
                </form>
            )}

            {events.length === 0 ? (
                <p>No events yet.</p>
            ) : (
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Venue</th>
                        <th>Start</th>
                        <th>End</th>
                    </tr>
                    </thead>
                    <tbody>
                    {events.map((e, i) => (
                        <tr key={e.id}>
                            <td>{i + 1}</td>
                            <td>{e.title}</td>
                            <td>{e.venue}</td>
                            <td>{new Date(e.startTime).toLocaleString()}</td>
                            <td>{new Date(e.endTime).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
