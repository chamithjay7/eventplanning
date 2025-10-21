import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";

type Vendor = {
    id: number;
    name: string;
    category?: string;
    address?: string;
    email?: string;
    phone?: string;
    description?: string;
    approved: boolean;
    createdAt: string;
};

export default function Vendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [role, setRole] = useState<string>("");

    // Add modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [description, setDescription] = useState("");

    // Edit modal
    const [editVendor, setEditVendor] = useState<Vendor | null>(null);
    const [editName, setEditName] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editDescription, setEditDescription] = useState("");

    // View modal
    const [viewVendor, setViewVendor] = useState<Vendor | null>(null);

    useEffect(() => {
        const r = localStorage.getItem("role");
        setRole(r || "");
        loadVendors();
    }, []);

    const loadVendors = async (query?: string) => {
        try {
            setLoading(true);
            const url = query ? `/api/vendors?q=${encodeURIComponent(query)}` : "/api/vendors";
            const res = await api.get<Vendor[]>(url);
            setVendors(res.data);
        } catch (err) {
            console.error("Failed to load vendors:", err);
            setVendors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadVendors(searchQuery);
    };

    const openAddModal = () => {
        setName("");
        setCategory("");
        setAddress("");
        setEmail("");
        setPhone("");
        setDescription("");
        setShowAddModal(true);
    };

    const handleAddVendor = async () => {
        if (!name) {
            alert("Please enter vendor name");
            return;
        }

        try {
            await api.post("/api/vendors", {
                name,
                category: category || null,
                address: address || null,
                email: email || null,
                phone: phone || null,
                description: description || null
            });
            alert("Vendor added successfully!");
            setShowAddModal(false);
            await loadVendors();
        } catch (err: any) {
            console.error("Failed to add vendor:", err);
            alert(err.response?.data?.message || "Failed to add vendor");
        }
    };

    const openEditModal = (vendor: Vendor) => {
        setEditVendor(vendor);
        setEditName(vendor.name);
        setEditCategory(vendor.category || "");
        setEditAddress(vendor.address || "");
        setEditEmail(vendor.email || "");
        setEditPhone(vendor.phone || "");
        setEditDescription(vendor.description || "");
    };

    const handleUpdateVendor = async () => {
        if (!editVendor || !editName) return;

        try {
            await api.put(`/api/vendors/${editVendor.id}`, {
                name: editName,
                category: editCategory || null,
                address: editAddress || null,
                email: editEmail || null,
                phone: editPhone || null,
                description: editDescription || null
            });
            alert("Vendor updated successfully!");
            setEditVendor(null);
            await loadVendors();
        } catch (err: any) {
            console.error("Failed to update vendor:", err);
            alert(err.response?.data?.message || "Failed to update vendor");
        }
    };

    const handleApproveVendor = async (vendorId: number) => {
        if (!confirm("Are you sure you want to approve this vendor?")) return;

        try {
            await api.patch(`/api/vendors/${vendorId}/approve`);
            alert("Vendor approved successfully!");
            await loadVendors();
        } catch (err: any) {
            console.error("Failed to approve vendor:", err);
            alert(err.response?.data?.message || "Failed to approve vendor");
        }
    };

    const handleDeleteVendor = async (vendorId: number) => {
        if (!confirm("Are you sure you want to delete this vendor?")) return;

        try {
            await api.delete(`/api/vendors/${vendorId}`);
            alert("Vendor deleted successfully!");
            await loadVendors();
        } catch (err: any) {
            console.error("Failed to delete vendor:", err);
            alert(err.response?.data?.message || "Failed to delete vendor");
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
                    <h2>Vendors</h2>
                    <p className="text-muted">Browse and manage vendors</p>
                </div>
                {(role === "VENDOR" || role === "ADMIN") && (
                    <div className="col-auto">
                        <button className="btn btn-primary" onClick={openAddModal}>
                            + Add Vendor
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
                            placeholder="Search vendors by name, category..."
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
                                loadVendors();
                            }}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Vendors List */}
            <div className="row">
                <div className="col">
                    <h4 className="mb-3">
                        Vendors ({vendors.length})
                    </h4>
                    {vendors.length === 0 ? (
                        <div className="alert alert-secondary">
                            No vendors found. Be the first to add one!
                        </div>
                    ) : (
                        <div className="row g-3">
                            {vendors.map((vendor) => (
                                <div key={vendor.id} className="col-md-6 col-lg-4">
                                    <div className="card h-100 shadow-sm">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 className="card-title mb-0">
                                                    {vendor.name}
                                                </h5>
                                                {vendor.approved ? (
                                                    <span className="badge bg-success">Approved</span>
                                                ) : (
                                                    <span className="badge bg-warning">Pending</span>
                                                )}
                                            </div>

                                            {vendor.category && (
                                                <p className="text-muted small mb-1">
                                                    <strong>Category:</strong> {vendor.category}
                                                </p>
                                            )}

                                            {vendor.address && (
                                                <p className="text-muted small mb-1">
                                                    <strong>Address:</strong> {vendor.address}
                                                </p>
                                            )}

                                            {vendor.email && (
                                                <p className="text-muted small mb-1">
                                                    <strong>Email:</strong> {vendor.email}
                                                </p>
                                            )}

                                            {vendor.phone && (
                                                <p className="text-muted small mb-1">
                                                    <strong>Phone:</strong> {vendor.phone}
                                                </p>
                                            )}

                                            {vendor.description && (
                                                <p className="card-text text-muted small mt-2">
                                                    {vendor.description.length > 100
                                                        ? vendor.description.substring(0, 100) + "..."
                                                        : vendor.description}
                                                </p>
                                            )}

                                            <div className="d-flex gap-2 mt-3">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setViewVendor(vendor)}
                                                >
                                                    View
                                                </button>
                                                {(role === "VENDOR" || role === "ADMIN") && (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => openEditModal(vendor)}
                                                        >
                                                            Edit
                                                        </button>
                                                        {role === "ADMIN" && !vendor.approved && (
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handleApproveVendor(vendor.id)}
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDeleteVendor(vendor.id)}
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

            {/* Add Vendor Modal */}
            {showAddModal && (
                <Modal title="Add Vendor" onClose={() => setShowAddModal(false)}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Name *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Vendor name"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Category</label>
                        <input
                            type="text"
                            className="form-control"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g., Catering, Photography, Decoration"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Address</label>
                        <input
                            type="text"
                            className="form-control"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Business address"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contact@vendor.com"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Phone</label>
                        <input
                            type="tel"
                            className="form-control"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+94 XX XXX XXXX"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Description</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your services"
                        />
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" onClick={handleAddVendor}>
                            Add Vendor
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}

            {/* View Vendor Modal */}
            {viewVendor && (
                <Modal title="Vendor Details" onClose={() => setViewVendor(null)}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Name</label>
                        <p className="text-muted">{viewVendor.name}</p>
                    </div>

                    {viewVendor.category && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Category</label>
                            <p className="text-muted">{viewVendor.category}</p>
                        </div>
                    )}

                    {viewVendor.address && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Address</label>
                            <p className="text-muted">{viewVendor.address}</p>
                        </div>
                    )}

                    {viewVendor.email && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Email</label>
                            <p className="text-muted">{viewVendor.email}</p>
                        </div>
                    )}

                    {viewVendor.phone && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Phone</label>
                            <p className="text-muted">{viewVendor.phone}</p>
                        </div>
                    )}

                    {viewVendor.description && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Description</label>
                            <p className="text-muted">{viewVendor.description}</p>
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Status</label>
                        <p className="text-muted">
                            {viewVendor.approved ? (
                                <span className="badge bg-success">Approved</span>
                            ) : (
                                <span className="badge bg-warning">Pending Approval</span>
                            )}
                        </p>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Created On</label>
                        <p className="text-muted">{new Date(viewVendor.createdAt).toLocaleString()}</p>
                    </div>

                    <button className="btn btn-secondary" onClick={() => setViewVendor(null)}>
                        Close
                    </button>
                </Modal>
            )}

            {/* Edit Vendor Modal */}
            {editVendor && (
                <Modal title="Edit Vendor" onClose={() => setEditVendor(null)}>
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
                        <label className="form-label fw-semibold">Category</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
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
                        <label className="form-label fw-semibold">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Phone</label>
                        <input
                            type="tel"
                            className="form-control"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
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
                        <button className="btn btn-primary" onClick={handleUpdateVendor}>
                            Update Vendor
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditVendor(null)}>
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
