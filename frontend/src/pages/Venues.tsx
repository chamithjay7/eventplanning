import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";

type Venue = {
    id: number;
    name: string;
    address?: string;
    description?: string;
    capacity?: number;
    approved: boolean;
    createdAt: string;
};

export default function Venues() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [role, setRole] = useState<string>("");

    // Add modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [capacity, setCapacity] = useState("");

    // Edit modal
    const [editVenue, setEditVenue] = useState<Venue | null>(null);
    const [editName, setEditName] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editCapacity, setEditCapacity] = useState("");

    // View modal
    const [viewVenue, setViewVenue] = useState<Venue | null>(null);

    useEffect(() => {
        const r = localStorage.getItem("role");
        setRole(r || "");
        loadVenues();
    }, []);

    const loadVenues = async (query?: string) => {
        try {
            setLoading(true);
            const url = query ? `/api/venues?q=${encodeURIComponent(query)}` : "/api/venues";
            const res = await api.get<Venue[]>(url);
            setVenues(res.data);
        } catch (err) {
            console.error("Failed to load venues:", err);
            setVenues([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadVenues(searchQuery);
    };

    const openAddModal = () => {
        setName("");
        setAddress("");
        setDescription("");
        setCapacity("");
        setShowAddModal(true);
    };

    const handleAddVenue = async () => {
        if (!name) {
            alert("Please enter venue name");
            return;
        }

        try {
            await api.post("/api/venues", {
                name,
                address: address || null,
                description: description || null,
                capacity: capacity ? parseInt(capacity) : null
            });
            alert("Venue added successfully!");
            setShowAddModal(false);
            await loadVenues();
        } catch (err: any) {
            console.error("Failed to add venue:", err);
            alert(err.response?.data?.message || "Failed to add venue");
        }
    };

    const openEditModal = (venue: Venue) => {
        setEditVenue(venue);
        setEditName(venue.name);
        setEditAddress(venue.address || "");
        setEditDescription(venue.description || "");
        setEditCapacity(venue.capacity?.toString() || "");
    };

    const handleUpdateVenue = async () => {
        if (!editVenue || !editName) return;

        try {
            await api.put(`/api/venues/${editVenue.id}`, {
                name: editName,
                address: editAddress || null,
                description: editDescription || null,
                capacity: editCapacity ? parseInt(editCapacity) : null
            });
            alert("Venue updated successfully!");
            setEditVenue(null);
            await loadVenues();
        } catch (err: any) {
            console.error("Failed to update venue:", err);
            alert(err.response?.data?.message || "Failed to update venue");
        }
    };

    const handleApproveVenue = async (venueId: number) => {
        if (!confirm("Are you sure you want to approve this venue?")) return;

        try {
            await api.patch(`/api/venues/${venueId}/approve`);
            alert("Venue approved successfully!");
            await loadVenues();
        } catch (err: any) {
            console.error("Failed to approve venue:", err);
            alert(err.response?.data?.message || "Failed to approve venue");
        }
    };

    const handleDeleteVenue = async (venueId: number) => {
        if (!confirm("Are you sure you want to delete this venue?")) return;

        try {
            await api.delete(`/api/venues/${venueId}`);
            alert("Venue deleted successfully!");
            await loadVenues();
        } catch (err: any) {
            console.error("Failed to delete venue:", err);
            alert(err.response?.data?.message || "Failed to delete venue");
        }
    };

    if (loading) {
        return (
            <div className="container py-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col">
                    <h2>Venues</h2>
                    <p className="text-muted">Browse and manage event venues</p>
                </div>
                {role === "ADMIN" && (
                    <div className="col-auto">
                        <button className="btn btn-primary" onClick={openAddModal}>
                            + Add Venue
                        </button>
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="card mb-4 p-3">
                <div className="row g-2">
                    <div className="col">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search venues by name, address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-secondary" onClick={handleSearch}>
                            Search
                        </button>
                        <button
                            className="btn btn-outline-secondary ms-2"
                            onClick={() => {
                                setSearchQuery("");
                                loadVenues();
                            }}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Venues List */}
            <div className="row">
                <div className="col">
                    <h4 className="mb-3">
                        Venues ({venues.length})
                    </h4>
                    {venues.length === 0 ? (
                        <div className="alert alert-secondary">
                            No venues found. Be the first to add one!
                        </div>
                    ) : (
                        <div className="row g-3">
                            {venues.map((venue) => (
                                <div key={venue.id} className="col-md-6 col-lg-4">
                                    <div className="card h-100 shadow-sm">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 className="card-title mb-0">
                                                    {venue.name}
                                                </h5>
                                                {venue.approved ? (
                                                    <span className="badge bg-success">Approved</span>
                                                ) : (
                                                    <span className="badge bg-warning">Pending</span>
                                                )}
                                            </div>

                                            {venue.address && (
                                                <p className="text-muted small mb-1">
                                                    <strong>Address:</strong> {venue.address}
                                                </p>
                                            )}

                                            {venue.capacity && (
                                                <p className="text-muted small mb-1">
                                                    <strong>Capacity:</strong> {venue.capacity} people
                                                </p>
                                            )}

                                            {venue.description && (
                                                <p className="card-text text-muted small mt-2">
                                                    {venue.description.length > 100
                                                        ? venue.description.substring(0, 100) + "..."
                                                        : venue.description}
                                                </p>
                                            )}

                                            <div className="d-flex gap-2 mt-3">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setViewVenue(venue)}
                                                >
                                                    View
                                                </button>
                                                {role === "ADMIN" && (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => openEditModal(venue)}
                                                        >
                                                            Edit
                                                        </button>
                                                        {!venue.approved && (
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handleApproveVenue(venue.id)}
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDeleteVenue(venue.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Venue Modal */}
            {showAddModal && (
                <Modal title="Add Venue" onClose={() => setShowAddModal(false)}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Name *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Venue name"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Address</label>
                        <input
                            type="text"
                            className="form-control"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Venue address"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Capacity</label>
                        <input
                            type="number"
                            className="form-control"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            placeholder="Maximum number of people"
                            min="1"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Description</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the venue, facilities, etc."
                        />
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" onClick={handleAddVenue}>
                            Add Venue
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}

            {/* View Venue Modal */}
            {viewVenue && (
                <Modal title="Venue Details" onClose={() => setViewVenue(null)}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Name</label>
                        <p className="text-muted">{viewVenue.name}</p>
                    </div>

                    {viewVenue.address && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Address</label>
                            <p className="text-muted">{viewVenue.address}</p>
                        </div>
                    )}

                    {viewVenue.capacity && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Capacity</label>
                            <p className="text-muted">{viewVenue.capacity} people</p>
                        </div>
                    )}

                    {viewVenue.description && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Description</label>
                            <p className="text-muted">{viewVenue.description}</p>
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Status</label>
                        <p className="text-muted">
                            {viewVenue.approved ? (
                                <span className="badge bg-success">Approved</span>
                            ) : (
                                <span className="badge bg-warning">Pending Approval</span>
                            )}
                        </p>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Created On</label>
                        <p className="text-muted">{new Date(viewVenue.createdAt).toLocaleString()}</p>
                    </div>

                    <button className="btn btn-secondary" onClick={() => setViewVenue(null)}>
                        Close
                    </button>
                </Modal>
            )}

            {/* Edit Venue Modal */}
            {editVenue && (
                <Modal title="Edit Venue" onClose={() => setEditVenue(null)}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Name *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Address</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Capacity</label>
                        <input
                            type="number"
                            className="form-control"
                            value={editCapacity}
                            onChange={(e) => setEditCapacity(e.target.value)}
                            min="1"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Description</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                        />
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" onClick={handleUpdateVenue}>
                            Update Venue
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditVenue(null)}>
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
