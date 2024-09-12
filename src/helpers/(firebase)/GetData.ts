import { db } from "@/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ObjectId } from "mongodb";

export const GetDataFromFirestore = async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs;
}



export const getAvailabilityFromFirestore = async (providerID: ObjectId)=> {
    try {
        console.log("providerID: ", providerID);
        const q = query(collection(db, "availabilities"), where("providerID", "==", providerID));
        // Find document
        const querySnapshot = await getDocs(q);

        // Check if a document exists
        if (!querySnapshot.empty) {
            // Return the ID of the first matching document
            const availability = querySnapshot.docs[0].data().availability
            const docID = querySnapshot.docs[0].id
            if (!docID || !availability) {
                throw new Error("Document not found")
            }
            return { availability, docID };
        }
        return null; // Return null if no documents are found
    } catch (error) {
        console.error("Error fetching document from firestore:", error);
        return null;
    }
}