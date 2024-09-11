import { db } from "@/config/firebase";
import { addDoc, collection } from "firebase/firestore"

export const AddDataInFireStore = async (collectionName: string, data: Object) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        console.log("Data created with ID:", docRef.id);
        return docRef;
    } catch (error) {
        console.log("Error while adding document in firebase: ", error);
    }
}