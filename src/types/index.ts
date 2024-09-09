 interface Notification {
    id: string;
    message: string;
    isRead: boolean;
}

interface Provider {
    _id: string;
    name: string;
    email: string;
    imageUrl: string;
    category: string;
    speciality: string;
    location: string;
}

interface Slot {
    time: string;
}

interface Availability {
    date: string; 
    slots: Slot[]
}

export type { Provider, Availability, Slot, Notification }