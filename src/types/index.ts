import { ObjectId } from "mongoose";

 interface Notification {
    id: string;
    message: string;
    isRead: boolean;
}

interface Provider {
    _id: ObjectId;
    name: string;
    email: string;
    imageUrl: string;
    category: string;
    speciality: string;
    location: string;
}

interface Slot {
    time: string;
    isBooked: boolean
}

interface Availability {
    date: string; 
    slots: Slot[]
}

export type { Provider, Availability, Slot, Notification }