import { db } from "@/config/firebase";
import { collection, getDocs, updateDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";

export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function getUserRoleFromToken(token: string): string {
  try {
    const { role } = JSON.parse(atob(token.split('.')[1])); // tacking role from the token
    return role;
  } catch {
    return '';
  }
}

export function getUserIdFromToken(token: string): string {
  try {
    const { _id } = JSON.parse(atob(token.split('.')[1])); // tacking id from the token
    return _id;
  } catch {
    return '';
  }
}

const handleAppointmentStatusUpdate = async (selectedAction,selectedAppointment,providerID) => {
  if (!selectedAppointment || !selectedAction) return;
  try {
    const { date, time } = selectedAppointment;
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("providerID", "==", providerID),
      where("date", "==", date),
      where("time", "==", time)
    );

    const snapshot = await getDocs(appointmentsQuery);
    const docs = snapshot.docs;
    const updatePromises = docs.map((doc) => updateDoc(doc.ref, { status: selectedAction }));
    await Promise.all(updatePromises);

  } catch (error) {
    console.error("something gone wrong:", error);
  }

}
