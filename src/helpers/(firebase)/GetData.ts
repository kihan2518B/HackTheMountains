import { db } from "@/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ObjectId } from "mongodb";

export const GetDataFromFirestore = async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs;
}

export const getAvailabilityFromFirestore = async (providerID: ObjectId) => {
    try {
        console.log("providerID: ", providerID);
        const q = query(collection(db, "availabilities"), where("providerID", "==", providerID));
        // Find document
        const querySnapshot = await getDocs(q);

        // Check if a document exists
        if (!querySnapshot.empty) {
            // Return the ID of the first matching document
            return querySnapshot.docs[0].data;
        } else {
            // No matching document found
            return null;
        }
    } catch (error) {
        console.error("Error fetching document from firestore:", error);
        return null;
    }
}