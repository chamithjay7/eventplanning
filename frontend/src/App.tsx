import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactElement } from "react";

// --- Public pages ---
import Login from "./pages/Login";
import Register from "./pages/Register";

// --- Dashboard pages ---
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// --- User Management ---
import AdminUsers from "./pages/AdminUsers"; // ✅ this is our new Admin user-management page

// --- Events / Bookings / Payments / Tickets ---
import Events from "./pages/Events";
import MyEvents from "./pages/MyEvents";
import MyBookings from "./pages/MyBookings";
import OrganizerBookings from "./pages/OrganizerBookings";
import Payments from "./pages/Payments";          // Admin/all payments
import MyPayments from "./pages/MyPayments";      // User payments
import TicketTypes from "./pages/TicketTypes";
import Tasks from "./pages/Tasks";
import MyTasks from "./pages/MyTasks";
import Reviews from "./pages/Reviews";
import Vendors from "./pages/Vendors";
import Venues from "./pages/Venues";
import Notifications from "./pages/Notifications";
import AdminNotifications from "./pages/AdminNotifications";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// --- Layout ---
import DashboardLayout from "./layouts/DashboardLayout";

// --- Bank Transfer related ---
import UploadSlip from "./pages/payments/UploadSlip";
import AdminPayments from "./pages/payments/AdminPayments";

export default function App(): ReactElement {
    return (
        <Routes>
            {/* ---------- Public routes ---------- */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ---------- Protected routes inside DashboardLayout ---------- */}

            {/* Dashboard (home) */}
            <Route
                path="/"
                element={
                    <DashboardLayout>
                        <Dashboard />
                    </DashboardLayout>
                }
            />

            <Route
                path="/dashboard"
                element={
                    <DashboardLayout>
                        <Dashboard />
                    </DashboardLayout>
                }
            />

            {/* Profile */}
            <Route
                path="/profile"
                element={
                    <DashboardLayout>
                        <Profile />
                    </DashboardLayout>
                }
            />

            {/* --- Admin: Manage Users --- */}
            <Route
                path="/users"
                element={
                    <DashboardLayout>
                        <AdminUsers />
                    </DashboardLayout>
                }
            />

            {/* --- Events --- */}
            <Route
                path="/events"
                element={
                    <DashboardLayout>
                        <Events />
                    </DashboardLayout>
                }
            />

            <Route
                path="/events/mine"
                element={
                    <DashboardLayout>
                        <MyEvents />
                    </DashboardLayout>
                }
            />

            {/* --- Bookings --- */}
            <Route
                path="/bookings"
                element={
                    <DashboardLayout>
                        <MyBookings />
                    </DashboardLayout>
                }
            />

            <Route
                path="/organizer/bookings"
                element={
                    <DashboardLayout>
                        <OrganizerBookings />
                    </DashboardLayout>
                }
            />

            {/* --- Payments --- */}
            <Route
                path="/payments"
                element={
                    <DashboardLayout>
                        <Payments />
                    </DashboardLayout>
                }
            />

            <Route
                path="/mypayments"
                element={
                    <DashboardLayout>
                        <MyPayments />
                    </DashboardLayout>
                }
            />

            {/* --- Ticket Types --- */}
            <Route
                path="/ticket-types"
                element={
                    <DashboardLayout>
                        <TicketTypes />
                    </DashboardLayout>
                }
            />

            {/* --- Tasks --- */}
            <Route
                path="/tasks"
                element={
                    <DashboardLayout>
                        <Tasks />
                    </DashboardLayout>
                }
            />

            {/* --- My Assigned Tasks --- */}
            <Route
                path="/my-tasks"
                element={
                    <DashboardLayout>
                        <MyTasks />
                    </DashboardLayout>
                }
            />

            {/* --- Reviews --- */}
            <Route
                path="/reviews"
                element={
                    <DashboardLayout>
                        <Reviews />
                    </DashboardLayout>
                }
            />

            {/* --- Vendors --- */}
            <Route
                path="/vendors"
                element={
                    <DashboardLayout>
                        <Vendors />
                    </DashboardLayout>
                }
            />

            {/* --- Venues --- */}
            <Route
                path="/venues"
                element={
                    <DashboardLayout>
                        <Venues />
                    </DashboardLayout>
                }
            />

            {/* --- Notifications --- */}
            <Route
                path="/notifications"
                element={
                    <DashboardLayout>
                        <Notifications />
                    </DashboardLayout>
                }
            />

            {/* --- Admin Notifications --- */}
            <Route
                path="/admin/notifications"
                element={
                    <DashboardLayout>
                        <AdminNotifications />
                    </DashboardLayout>
                }
            />

            {/* --- Bank Transfer Upload (user) --- */}
            <Route
                path="/upload-slip/:bookingId"
                element={
                    <DashboardLayout>
                        <UploadSlip bookingId={0} />
                    </DashboardLayout>
                }
            />

            {/* --- Bank Transfer Review (admin) --- */}

            <Route
                path="/admin/payments"
                element={
                    <DashboardLayout>
                        <AdminPayments />
                    </DashboardLayout>
                }
            />

            {/* --- My Events (Organizer) --- */}
            <Route
                path="/my-events"
                element={
                    <DashboardLayout>
                        <MyEvents />
                    </DashboardLayout>
                }
            />

            {/* ---------- Catch-all redirect ---------- */}
            <Route path="*" element={<Navigate to="/login" replace />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
    );
}
