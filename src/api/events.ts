import api from "./axios";

export type Event = {
    id: number;
    name: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    status: string;
    createdAt: string;
    updatedAt: string;
};

export async function getAllEvents() {
    const res = await api.get("/api/events?page=0&size=20");
    return res.data;
}

export async function getMyEvents() {
    const res = await api.get("/api/events/mine?page=0&size=20");
    return res.data;
}

export async function createEvent(data: any) {
    const res = await api.post("/api/events", data);
    return res.data;
}

export async function updateEvent(id: number, data: any) {
    const res = await api.put(`/api/events/${id}`, data);
    return res.data;
}

export async function publishEvent(id: number) {
    const res = await api.patch(`/api/events/${id}/publish`);
    return res.data;
}

export async function cancelEvent(id: number) {
    const res = await api.patch(`/api/events/${id}/cancel`);
    return res.data;
}

export async function deleteEvent(id: number) {
    await api.delete(`/api/events/${id}`);
}
