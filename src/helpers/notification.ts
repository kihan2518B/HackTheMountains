import { db } from '@/config/firebase';
import { getFirestore, collection, addDoc } from 'firebase/firestore';


export const sendNotification = async (recipientId: string, message: string) => {
    try {
        await addDoc(collection(db, 'notifications'), {
            recipientId,
            message,
            isRead: false,
            createdAt: new Date(),
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        // Optionally, handle the error (e.g., show a user-friendly message)
    }
};