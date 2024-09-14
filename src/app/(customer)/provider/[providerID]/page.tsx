"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { collection, query, where, onSnapshot, updateDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

import ProviderProfile from "@/components/provider/ProviderProfile";
import CalendarSection from "@/components/provider/CalendarSection";
import ProviderAvailabilitySlot from "@/components/customer/ProviderAvailabilitySlot";
import CustomerBookedAppointments from "@/components/customer/CustomerBookedAppointments";

import { Provider, Slot, Availability, Appointment, TypeUser } from "@/types";
import { formatDate } from "@/helpers/formateDate";
import { getUserIdFromToken } from "@/utils/utils";

const page: React.FC = () => {

    const token = localStorage.getItem("token");
    const { providerID } = useParams();
    const [provider, setProvider] = useState<Provider | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // default placing today's date
    const [formattedDate, setFormattedDate] = useState<string>(formatDate(new Date()));

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [slotsForSelectedDate, setSlotsForSelectedDate] = useState<Slot[] | null>(null);

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [selectedAction, setSelectedAction] = useState<string>('');
    const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState<boolean>(false);

    const [users, setUsers] = useState<{ [key: string]: TypeUser }>({});


    useEffect(() => {
        if (providerID) {
            const fetchProviderDetails = async () => {
                try {
                    const res = await fetch(`/api/provider/getProvider?userID=${providerID}`);
                    if (!res.ok) {
                        throw new Error("Error while getting provider Details")
                    }
                    const data = await res.json();
                    const provider = data.user;
                    setProvider(provider);
                } catch (error) {
                    console.error(error);
                }
            }
            fetchProviderDetails();
        }
    }, [providerID]);

    // Fetch real-time availabilities from Firestore and merge with initial data
    useEffect(() => {
        if (providerID) {
            const schedulesRef = collection(db, "availabilities");
            const q = query(schedulesRef, where("providerID", "==", providerID));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const realTimeavailabilities: Availability[] = [];
                querySnapshot.forEach((doc) => {
                    realTimeavailabilities.push(doc.data() as Availability);
                });
                console.log("realTimeavailabilities: ", realTimeavailabilities[0].availability)
                // Merge initial availability with real-time data
                // const mergedAvailabilities = [...availabilities, ...realTimeavailabilities];
                setAvailabilities(realTimeavailabilities[0].availability);
            });
            // Cleanup on unmount
            return () => unsubscribe();
        }
    }, [providerID]);

    //When Date is selected filter the availability to get slots
    useEffect(() => {
        if (selectedDate) {
            const FilteredAvailability = availabilities.find((avail) => avail.date == formattedDate)
            console.log("FilteredAvailability: ", FilteredAvailability);
            if (FilteredAvailability) {
                setSlotsForSelectedDate(FilteredAvailability.slots);
            } else {
                setSlotsForSelectedDate(null)
            }
        }
    }, [selectedDate, availabilities])

    const handleSlotClick = (slot: Slot) => {
        if (slot.status === 'ADDED' || slot.status === 'CANCEL') {
            setSelectedSlot(slot)
        } else {
            toast.info("Selected slot is already booked")
        }
    };

    const handleBookAppointment = async () => {
        if (selectedSlot && formattedDate && providerID) {
            try {
                setLoading(true);
                setSelectedSlot(null)
                const response = await fetch("/api/appointment/book", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        providerID,
                        date: formattedDate,
                        slot: selectedSlot.time,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Appointment booked successfully:", data);
                    setLoading(false);
                    toast.success("Appointment booked successfully");
                } else {
                    const errorData = await response.json();
                    setError(errorData.message);
                    setLoading(false)
                }
            } catch (err) {
                console.error("Error booking appointment:", err);
                setError("Something went wrong while booking the appointment.");
            }
        } else {
            setError("Please select a time slot.");
        }
    };

    // Getting user details from appointments
    useEffect(() => {
        const fetchPatientDetails = async () => {
            const uniquePatientIDs = Array.from(new Set(appointments.map((appointment) => appointment.userID))
            );

            const patientDetails = await Promise.all(
                uniquePatientIDs.map(async (userID) => {
                    const response = await fetch(`/api/getUserByID?userID=${userID}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch user details");
                    }
                    const data = await response.json();
                    return {
                        [userID]: { name: data.user.name, email: data.user.email },
                    };
                })
            );

            setUsers((prevPatients) => ({
                ...prevPatients,
                ...Object.assign({}, ...patientDetails),
            }));
        };

        if (appointments.length > 0) {
            fetchPatientDetails();
        }
    }, [appointments]);

    // Function to get realtime appointments
    useEffect(() => {
        if (!token) return;
        const userID = getUserIdFromToken(token);
        console.log("userID", userID);
        const fetchAppointmentsAndSyncAvailability = async () => {
            setAppointmentsLoading(true)
            const appointmentsQuery = query(collection(db, "appointments"), where("userID", "==", userID));

            const unsubscribe = onSnapshot(appointmentsQuery, async (snapshot) => {
                const fetchedAppointments = snapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                })) as Appointment[];

                const sortedAppointments = fetchedAppointments.sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setAppointments(sortedAppointments);
                setAppointmentsLoading(false);

            });

            return () => unsubscribe();
        };

        fetchAppointmentsAndSyncAvailability();
    }, [token]);

    const handleAppointmentClick = (appointment: Appointment, action: "CONFIRM" | "CANCEL") => {
        if (appointment.status === action) {
            toast.info(`Selected Appointment is already ${action.toLowerCase()}`);
        } else {
            setSelectedAppointment(appointment);
            setSelectedAction(action);
            setShowStatusConfirmDialog(true);
        }
    };

    const handleAppointmentStatusUpdate = async () => {
        if (!selectedAppointment || !selectedAction) return; // Exit if no appointment or action is selected

        try {
            const { date, time } = selectedAppointment; // Extract date and time from the selected appointment

            // Query to find the appointment document by providerID, date, and time
            const appointmentsQuery = query(
                collection(db, "appointments"),
                where("providerID", "==", providerID),
                where("date", "==", date),
                where("time", "==", time)
            );

            const snapshot = await getDocs(appointmentsQuery); // Fetch appointment documents that match the query
            const docs = snapshot.docs; // Get the document snapshots

            if (selectedAction === "CANCEL") {
                // If the action is CANCEL, delete the appointment document(s)
                const deletePromises = docs.map((doc) => deleteDoc(doc.ref)); // Create an array of delete promises
                await Promise.all(deletePromises); // Execute all delete operations

                // Now, find the availability document for the same providerID
                const availabilitiesQuery = query(
                    collection(db, "availabilities"),
                    where("providerID", "==", providerID)
                );

                const availabilitySnapshot = await getDocs(availabilitiesQuery); // Fetch availability documents for the provider
                const availabilityDocs = availabilitySnapshot.docs; // Get the document snapshots

                if (availabilityDocs.length > 0) {
                    const availabilityDoc = availabilityDocs[0]; // Assume there's only one availability document per provider
                    const availabilityData = availabilityDoc.data(); // Get the data from the availability document

                    // Update the availability data with the new slot status
                    const updatedAvailability = availabilityData.availability.map((avail: any) => {
                        if (avail.date === date) { // Find the availability for the selected date
                            const updatedSlots = avail.slots.map((slot: any) =>
                                slot.time === time ? { ...slot, status: "ADDED" } : slot // Update the slot status to "ADDED"
                            );
                            return { ...avail, slots: updatedSlots }; // Return updated availability object
                        }
                        return avail; // Return the unmodified availability object
                    });

                    // Update the availability document in Firestore with the modified data
                    await updateDoc(availabilityDoc.ref, { availability: updatedAvailability });
                }

                toast.success("Appointment canceled and slot updated successfully."); // Notify user of successful cancellation
            } else {
                // For actions other than CANCEL (e.g., CONFIRM), update the appointment status
                const updatePromises = docs.map((doc) => updateDoc(doc.ref, { status: selectedAction })); // Create an array of update promises
                await Promise.all(updatePromises); // Execute all update operations

                toast.success(`Appointment status updated to ${selectedAction.toLowerCase()} successfully`); // Notify user of successful update
            }
        } catch (error) {
            console.error("Error updating appointment status:", error); // Log any errors
            toast.error("Something went wrong while updating the appointment."); // Notify user of an error
        }

        setShowStatusConfirmDialog(false); // Close the status confirmation dialog
        setSelectedAppointment(null); // Clear the selected appointment
        setSelectedAction(""); // Reset the selected action
    };

    const handleAppointmentStatusCancel = () => {
        setShowStatusConfirmDialog(false);
        setSelectedAppointment(null);
        setSelectedAction("");
    };


    // for changing the color of slot according to status
    const getSlotStatusColor = (status: string) => {
        switch (status) {
            case "ADDED":
                return "bg-blue-300";
            case "PENDING":
                return "bg-yellow-300";
            case "CONFIRM":
                return "bg-green-300";
            case "CANCEL":
                return "bg-red-300";
            default: return "bg-BGONE"
        }
    };

    if (error) return <div className="p-4 text-red-600">{error}</div>;


    // to manage the changing date by calender
    const handleDateChange = (date: Date | null) => {
        if (date) {
            console.log(formattedDate)
            setSelectedDate(date);
            setFormattedDate(formatDate(date));
            setSelectedSlot(null)
        }
    };
    return (
        <div className="p-2">
            {provider ? (
                <div className="flex flex-col justify-evenly gap-5 items-start">
                    <div className="w-full">
                        <ProviderProfile provider={provider} />
                    </div>
                    <div className="w-full flex gap-4 items-start justify-center sm:flex-row flex-col">
                        <div className="w-full">
                            <CalendarSection selectedDate={selectedDate} handleDateChange={handleDateChange} />
                        </div>
                        <div className="w-full">
                            <ProviderAvailabilitySlot
                                Loading={loading}
                                selectedSlot={selectedSlot}
                                handleSlotClick={handleSlotClick}
                                handleBookAppointment={handleBookAppointment}
                                selectedDate={selectedDate}
                                slotsForSelectedDate={slotsForSelectedDate}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 text-ColorThree">Loading provider details...</div>
            )}
            {appointments ? (
                <div className="mt-6">
                    <CustomerBookedAppointments
                        providerID={providerID}
                        loading={appointmentsLoading}
                        appointments={appointments}
                        users={users}
                        handleAppointmentClick={handleAppointmentClick}
                        showStatusConfirmDialog={showStatusConfirmDialog}
                        handleAppointmentStatusUpdate={handleAppointmentStatusUpdate}
                        handleAppointmentStatusCancel={handleAppointmentStatusCancel}
                        selectedAppointment={selectedAppointment}
                        selectedAction={selectedAction}
                        getSlotStatusColor={getSlotStatusColor}
                    />
                </div>
            ) :
                <>Loading Appointments...</>}
        </div>
    );
};

export default page;