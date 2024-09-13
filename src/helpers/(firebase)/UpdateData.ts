import { db } from "@/config/firebase";
import { Availability, Slot } from "@/types";
import { doc, getDoc, updateDoc } from "firebase/firestore"

export const UpdateAvailabilityInFirestore = async (providerID: string, date: string, updatedAvailability: Availability) => {
    const docRef = doc(db, "providerAvailability", providerID);

    // Assuming that providerAvailability documents have a date field for each provider
    await updateDoc(docRef, {
        [`dates.${date}`]: updatedAvailability
    });
};
export const updateSlotStatusInFirestore = async (providerID: string, date: string, slotTime: string) => {

    // Reference to the document
    const docRef = doc(db, "availabilities", providerID);

    // Fetch the document
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error("Provider availability not found");
    }

    // Get the data
    const data = docSnap.data();
    console.log("data", date)
    if (!data || !data) {
        throw new Error("Invalid data format");
    }

    // Find the availability for the given date
    const availabilityForDate = data.availability.find((avail: Availability) => avail.date === date);
    // console.log("availabilityForDate: ", availabilityForDate)

    if (!availabilityForDate) {
        throw new Error("Availability for the selected date not found");
    }

    // Find and update the slot
    const slotToUpdate = availabilityForDate.slots.find((slot: Slot) => slot.time === slotTime && !slot.isBooked);
    // console.log("slotToUpdate: ", slotToUpdate)

    if (!slotToUpdate) {
        throw new Error("Slot not available or already booked");
    }

    // Mark the slot as booked
    slotToUpdate.isBooked = true;

    // Save the updated availability back to Firestore
    await updateDoc(docRef, {
        availability: data.availability.map((avail: Availability) =>
            avail.date === date
                ? {
                    ...avail, slots: avail.slots.map((slot: Slot) =>
                        slot.time === slotTime ? { ...slot, isBooked: true } : slot
                    )
                }
                : avail
        )
    });
};
