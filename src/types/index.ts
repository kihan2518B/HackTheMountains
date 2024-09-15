import { ObjectId } from "mongoose";

 interface Notification {
    id: string;
    message: string;
    isRead: boolean;
}

interface Provider {
    _id: ObjectId;
    userID:ObjectId
    name: string;
    email: string;
    imageUrl: string;
    category: string;
    speciality: string;
    location: string;
    address: string;
    balance: number;
}

interface TypeUser {
    _id:ObjectId;
    name: string;
    email: string;
    role: "client"|"provider";
    password: string;
}

interface Slot {
    time: string;
    status: string;
}

interface Availability {
    date: string; 
    slots: Slot[]
    balance: number;
}

interface Appointment {
    id?: string;
    providerID: string;
    userID: string;
    date: string;
    time: string;
    status: string;
    paymentIntentId: string;
    isServiceCompleted: boolean;
}

export type { Provider, Availability, Slot, Notification, TypeUser, Appointment }