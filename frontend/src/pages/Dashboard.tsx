import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

type DashboardStats = {
    totalEvents?: number;
    upcomingEvents?: number;
    totalBookings?: number;
    pendingTasks?: number;
    unreadNotifications?: number;
};

type Event = {
    id: number;
    name: string;
    startDate: string;
    status: string;
};

type Booking = {
    id: number;
    eventId: number;
    status: string;
    createdAt: string;
};

type Task = {
    id: number;
    title: string;
    status: string;
    dueDate?: string;
};

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({});
    const [recentEvents, setRecentEvents] = useState<Event[]>([]);
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
    const [role, setRole] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const r = localStorage.getItem("role") || "";
        setRole(r);
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load user info
            const userRes = await api.get<{ username: string }>("/api/users/me");
            setUsername(userRes.data.username);

            // Load stats
            const [eventsRes, bookingsRes, notifCountRes] = await Promise.all([
                api.get<{ content: Event[] }>("/api/events?size=100").catch(() => ({ data: { content: [] } })),
                api.get<Booking[]>("/api/bookings/mine").catch(() => ({ data: [] })),
                api.get<number>("/api/notifications/unread-count").catch(() => ({ data: 0 }))
            ]);

            const events = eventsRes.data.content || [];
            const bookings = bookingsRes.data || [];

            // Calculate stats
            const now = new Date();
            const upcomingEvents = events.filter(e =>
                new Date(e.startDate) > now && e.status === "PUBLISHED"
            ).length;

            setStats({
                totalEvents: events.length,
                upcomingEvents: upcomingEvents,
                totalBookings: bookings.length,
                unreadNotifications: notifCountRes.data
            });

            // Set recent data
            setRecentEvents(events.slice(0, 5));
            setRecentBookings(bookings.slice(0, 5));

        } catch (err) {
            console.error("Failed to load dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Welcome Header */}
            <div className="row mb-4">
                <div className="col">
                    <h2>Welcome back, {username}! 👋</h2>
                    <p className="text-muted">Here's what's happening with your events today.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #0d6efd" }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Total Events</p>
                                    <h3 className="mb-0">{stats.totalEvents || 0}</h3>
                                </div>
                                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                                    <span style={{ fontSize: "2rem" }}>📅</span>
                                </div>
                            </div>
                            <Link to="/events" className="btn btn-sm btn-link text-decoration-none p-0 mt-2">
                                View all events →
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #198754" }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Upcoming Events</p>
                                    <h3 className="mb-0">{stats.upcomingEvents || 0}</h3>
                                </div>
                                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                                    <span style={{ fontSize: "2rem" }}>🎉</span>
                                </div>
                            </div>
                            <Link to="/events" className="btn btn-sm btn-link text-decoration-none p-0 mt-2">
                                Browse events →
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #ffc107" }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">My Bookings</p>
                                    <h3 className="mb-0">{stats.totalBookings || 0}</h3>
                                </div>
                                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                                    <span style={{ fontSize: "2rem" }}>🎫</span>
                                </div>
                            </div>
                            <Link to="/bookings" className="btn btn-sm btn-link text-decoration-none p-0 mt-2">
                                View bookings →
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #dc3545" }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Notifications</p>
                                    <h3 className="mb-0">{stats.unreadNotifications || 0}</h3>
                                </div>
                                <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                                    <span style={{ fontSize: "2rem" }}>🔔</span>
                                </div>
                            </div>
                            <Link to="/notifications" className="btn btn-sm btn-link text-decoration-none p-0 mt-2">
                                View notifications →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="row mb-4">
                <div className="col">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title mb-3">Quick Actions</h5>
                            <div className="row g-2">
                                <div className="col-md-3">
                                    <Link to="/events" className="btn btn-outline-primary w-100">
                                        📅 Browse Events
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link to="/bookings" className="btn btn-outline-success w-100">
                                        🎫 My Bookings
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link to="/vendors" className="btn btn-outline-info w-100">
                                        🏪 Find Vendors
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link to="/venues" className="btn btn-outline-warning w-100">
                                        🏢 Find Venues
                                    </Link>
                                </div>
                            </div>

                            {role === "ORGANIZER" && (
                                <div className="row g-2 mt-2">
                                    <div className="col-md-4">
                                        <Link to="/my-events" className="btn btn-outline-primary w-100">
                                            📝 Manage My Events
                                        </Link>
                                    </div>
                                    <div className="col-md-4">
                                        <Link to="/ticket-types" className="btn btn-outline-secondary w-100">
                                            🎟️ Ticket Types
                                        </Link>
                                    </div>
                                    <div className="col-md-4">
                                        <Link to="/tasks" className="btn btn-outline-info w-100">
                                            ✅ Team Tasks
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {role === "ADMIN" && (
                                <div className="row g-2 mt-2">
                                    <div className="col-md-3">
                                        <Link to="/users" className="btn btn-outline-danger w-100">
                                            👥 Manage Users
                                        </Link>
                                    </div>
                                    <div className="col-md-3">
                                        <Link to="/admin/notifications" className="btn btn-outline-warning w-100">
                                            📡 Broadcast
                                        </Link>
                                    </div>
                                    <div className="col-md-3">
                                        <Link to="/tasks" className="btn btn-outline-info w-100">
                                            📋 All Tasks
                                        </Link>
                                    </div>
                                    <div className="col-md-3">
                                        <Link to="/events" className="btn btn-outline-success w-100">
                                            🎪 All Events
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Events & Bookings */}
            <div className="row g-3">
                {/* Recent Events */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">Recent Events</h5>
                        </div>
                        <div className="card-body">
                            {recentEvents.length === 0 ? (
                                <div className="text-center text-muted py-4">
                                    <p>No events yet</p>
                                    <Link to="/events" className="btn btn-sm btn-primary">
                                        Browse Events
                                    </Link>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {recentEvents.map((event) => (
                                        <div key={event.id} className="list-group-item px-0">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="mb-1">{event.name}</h6>
                                                    <small className="text-muted">
                                                        📅 {new Date(event.startDate).toLocaleDateString()}
                                                    </small>
                                                </div>
                                                <span className={`badge ${
                                                    event.status === "PUBLISHED" ? "bg-success" :
                                                    event.status === "DRAFT" ? "bg-secondary" :
                                                    "bg-danger"
                                                }`}>
                                                    {event.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="card-footer bg-white border-0 text-center">
                            <Link to="/events" className="btn btn-sm btn-link text-decoration-none">
                                View all events →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">My Recent Bookings</h5>
                        </div>
                        <div className="card-body">
                            {recentBookings.length === 0 ? (
                                <div className="text-center text-muted py-4">
                                    <p>No bookings yet</p>
                                    <Link to="/events" className="btn btn-sm btn-primary">
                                        Book an Event
                                    </Link>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {recentBookings.map((booking) => (
                                        <div key={booking.id} className="list-group-item px-0">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="mb-1">Booking #{booking.id}</h6>
                                                    <small className="text-muted">
                                                        🕒 {new Date(booking.createdAt).toLocaleDateString()}
                                                    </small>
                                                </div>
                                                <span className={`badge ${
                                                    booking.status === "CONFIRMED" ? "bg-success" :
                                                    booking.status === "PENDING" ? "bg-warning" :
                                                    "bg-danger"
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="card-footer bg-white border-0 text-center">
                            <Link to="/bookings" className="btn btn-sm btn-link text-decoration-none">
                                View all bookings →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
