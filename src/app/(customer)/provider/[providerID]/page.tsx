"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

import ProviderProfile from "@/components/provider/ProviderProfile";
import CalendarSection from "@/components/provider/CalendarSection";
import ProviderAvailabilitySlot from "@/components/customer/ProviderAvailabilitySlot";

import { Provider, Slot, Availability } from "@/types";
import { formatDate } from "@/helpers/formateDate";

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
        if (slot.status === 'ADDED') {
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
                    // setTimeout(() => {
                    //     window.location.reload();
                    // }, 1000);
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
        <div className="p-6 bg-BGTwo min-h-screen">
            {provider ? (
                <div className="max-w-[95vw] mx-auto flex bg-white shadow-lg rounded-lg overflow-hidden">
                    <ProviderProfile provider={provider} />
                    <CalendarSection selectedDate={selectedDate} handleDateChange={handleDateChange} />
                    <ProviderAvailabilitySlot
                        Loading={loading}
                        selectedSlot={selectedSlot}
                        handleSlotClick={handleSlotClick}
                        handleBookAppointment={handleBookAppointment}
                        selectedDate={selectedDate}
                        slotsForSelectedDate={slotsForSelectedDate}
                    />
                </div>
            ) : (
                <div className="p-4 text-ColorThree">Loading provider details...</div>
            )}
        </div>
    );
};

export default page;