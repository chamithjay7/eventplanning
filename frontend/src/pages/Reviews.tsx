import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";

type Review = {
    id: number;
    eventId?: number;
    vendorId?: number;
    rating: number;
    comment?: string;
    authorUsername: string;
    createdAt: string;
};

type Event = {
    id: number;
    title?: string;  // Some endpoints use 'title'
    name?: string;   // Some endpoints use 'name'
};

export default function Reviews() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<number>(0);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Get current user
    const [currentUsername, setCurrentUsername] = useState("");

    // Add review modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    // Edit review modal
    const [editReview, setEditReview] = useState<Review | null>(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState("");

    // View review modal
    const [viewReview, setViewReview] = useState<Review | null>(null);

    useEffect(() => {
        loadCurrentUser();
        loadEvents();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const res = await api.get<{ username: string }>("/api/users/me");
            setCurrentUsername(res.data.username);
            console.log("Current user:", res.data.username);
        } catch (err) {
            console.error("Failed to load current user:", err);
        }
    };

    const loadEvents = async () => {
        try {
            setLoading(true);
            // Use paginated endpoint
            const res = await api.get<{content: Event[]}>("/api/events?size=100");
            console.log("API Response:", res.data);
            const eventsList = res.data.content || [];
            console.log("Events list:", eventsList);
            setEvents(eventsList);
            if (eventsList.length > 0) {
                setSelectedEvent(eventsList[0].id);
                await loadReviewsForEvent(eventsList[0].id);
            } else {
                console.warn("No events found");
            }
        } catch (err: any) {
            console.error("Failed to load events:", err);
            console.error("Error response:", err.response?.data);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const loadReviewsForEvent = async (eventId: number) => {
        try {
            const res = await api.get<Review[]>(`/api/reviews/event/${eventId}`);
            setReviews(res.data);
        } catch (err) {
            console.error("Failed to load reviews:", err);
            setReviews([]);
        }
    };

    const handleEventChange = async (eventId: number) => {
        setSelectedEvent(eventId);
        await loadReviewsForEvent(eventId);
    };

    const openAddModal = () => {
        if (events.length === 0) {
            alert("Please wait for events to load or add some events first");
            return;
        }
        // Ensure selectedEvent is valid
        if (!selectedEvent || selectedEvent === 0) {
            setSelectedEvent(events[0].id);
        }
        setRating(5);
        setComment("");
        setShowAddModal(true);
    };

    const handleAddReview = async () => {
        if (!selectedEvent) {
            alert("Please select an event");
            return;
        }

        try {
            await api.post("/api/reviews", {
                eventId: selectedEvent,
                rating: rating,
                comment: comment || null
            });
            alert("Review added successfully!");
            setShowAddModal(false);
            await loadReviewsForEvent(selectedEvent);
        } catch (err: any) {
            console.error("Failed to add review:", err);
            alert(err.response?.data?.message || "Failed to add review");
        }
    };

    const openEditModal = (review: Review) => {
        setEditReview(review);
        setEditRating(review.rating);
        setEditComment(review.comment || "");
    };

    const handleUpdateReview = async () => {
        if (!editReview) return;

        try {
            await api.put(`/api/reviews/${editReview.id}`, {
                eventId: editReview.eventId,
                rating: editRating,
                comment: editComment || null
            });
            alert("Review updated successfully!");
            setEditReview(null);
            await loadReviewsForEvent(selectedEvent);
        } catch (err: any) {
            console.error("Failed to update review:", err);
            alert(err.response?.data?.message || "Failed to update review");
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            await api.delete(`/api/reviews/${reviewId}`);
            alert("Review deleted successfully!");
            await loadReviewsForEvent(selectedEvent);
        } catch (err: any) {
            console.error("Failed to delete review:", err);
            alert(err.response?.data?.message || "Failed to delete review");
        }
    };

    const renderStars = (rating: number, interactive: boolean = false, onRate?: (r: number) => void) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    style={{
                        fontSize: interactive ? "2rem" : "1.2rem",
                        color: i <= rating ? "#ffc107" : "#e0e0e0",
                        cursor: interactive ? "pointer" : "default",
                        marginRight: "0.25rem"
                    }}
                    onClick={() => interactive && onRate && onRate(i)}
                >
                    ★
                </span>
            );
        }
        return <div>{stars}</div>;
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
                    <h2>Event Reviews</h2>
                    <p className="text-muted">View and add reviews for events</p>
                </div>
                <div className="col-auto">
                    <button className="btn btn-primary" onClick={openAddModal}>
                        + Add Review
                    </button>
                </div>
            </div>

            {/* Event Selector */}
            {events.length > 0 ? (
                <div className="card mb-4 p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label fw-semibold mb-0">Select Event</label>
                        <small className="text-muted">{events.length} events available</small>
                    </div>
                    <select
                        className="form-select"
                        value={selectedEvent || ""}
                        onChange={(e) => handleEventChange(Number(e.target.value))}
                    >
                        {selectedEvent === 0 && <option value="">-- Select an Event --</option>}
                        {events.map((event, index) => {
                            console.log(`Event ${index}:`, event);
                            return (
                                <option key={event.id} value={event.id}>
                                    {event.name || event.title || 'Unnamed Event'}
                                </option>
                            );
                        })}
                    </select>
                </div>
            ) : (
                <div className="alert alert-warning">
                    <strong>No events found!</strong>
                    <p className="mb-0 mt-2">
                        There are no events in the system yet. Please create some events first to add reviews.
                    </p>
                </div>
            )}

            {/* Reviews List */}
            <div className="row">
                <div className="col">
                    <h4 className="mb-3">Reviews ({reviews.length})</h4>
                    {reviews.length === 0 ? (
                        <div className="alert alert-secondary">
                            No reviews yet for this event. Be the first to add one!
                        </div>
                    ) : (
                        <div className="row g-3">
                            {reviews.map((review) => (
                                <div key={review.id} className="col-md-6 col-lg-4">
                                    <div className="card h-100 shadow-sm">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h6 className="card-subtitle mb-0 text-primary">
                                                    {review.authorUsername}
                                                </h6>
                                                <small className="text-muted">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </small>
                                            </div>

                                            <div className="mb-2">
                                                {renderStars(review.rating)}
                                            </div>

                                            {review.comment && (
                                                <p className="card-text text-muted small mb-2">
                                                    "{review.comment}"
                                                </p>
                                            )}

                                            <div className="d-flex gap-2 mt-3">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setViewReview(review)}
                                                >
                                                    👁️ View
                                                </button>
                                                {(() => {
                                                    const isOwner = review.authorUsername === currentUsername;
                                                    console.log(`Review ${review.id}: author="${review.authorUsername}", current="${currentUsername}", isOwner=${isOwner}`);
                                                    return isOwner;
                                                })() && (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => openEditModal(review)}
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDeleteReview(review.id)}
                                                        >
                                                            🗑️ Delete
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

            {/* Add Review Modal */}
            {showAddModal && (
                <Modal title="Add Review" onClose={() => setShowAddModal(false)}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Reviewing Event</label>
                        <div className="alert alert-primary mb-0">
                            <strong>
                                {events.find(e => e.id === selectedEvent)?.name ||
                                 events.find(e => e.id === selectedEvent)?.title ||
                                 events[0]?.name ||
                                 events[0]?.title ||
                                 "No event selected"}
                            </strong>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Rating *</label>
                        <div className="d-flex align-items-center gap-3">
                            {renderStars(rating, true, setRating)}
                            <span className="badge bg-primary">{rating} / 5</span>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Comment</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            placeholder="Share your experience (optional)"
                            maxLength={1000}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <small className="text-muted">{comment.length} / 1000 characters</small>
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" onClick={handleAddReview}>
                            Submit Review
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}

            {/* View Review Modal */}
            {viewReview && (
                <Modal title="Review Details" onClose={() => setViewReview(null)}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Reviewer</label>
                        <p className="text-muted">{viewReview.authorUsername}</p>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Rating</label>
                        <div>{renderStars(viewReview.rating)}</div>
                    </div>

                    {viewReview.comment && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Comment</label>
                            <p className="text-muted">"{viewReview.comment}"</p>
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Posted On</label>
                        <p className="text-muted">{new Date(viewReview.createdAt).toLocaleString()}</p>
                    </div>

                    <button className="btn btn-secondary" onClick={() => setViewReview(null)}>
                        Close
                    </button>
                </Modal>
            )}

            {/* Edit Review Modal */}
            {editReview && (
                <Modal title="Edit Review" onClose={() => setEditReview(null)}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Event</label>
                        <p className="text-muted">
                            {events.find(e => e.id === editReview.eventId)?.name ||
                             events.find(e => e.id === editReview.eventId)?.title ||
                             "Unknown Event"}
                        </p>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Rating *</label>
                        <div className="d-flex align-items-center gap-3">
                            {renderStars(editRating, true, setEditRating)}
                            <span className="badge bg-primary">{editRating} / 5</span>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Comment</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            placeholder="Share your experience (optional)"
                            maxLength={1000}
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                        />
                        <small className="text-muted">{editComment.length} / 1000 characters</small>
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" onClick={handleUpdateReview}>
                            Update Review
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditReview(null)}>
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
