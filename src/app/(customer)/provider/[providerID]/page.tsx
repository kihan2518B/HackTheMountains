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
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Provider, Slot, Availability } from "@/types";
import { formatDate } from "@/helpers/formateDate";
import { loadStripe } from "@stripe/stripe-js";

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

    const stripe = useStripe();
    const elements = useElements();
    const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    
    


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

    const handleConfirmAppointment = async () => {
        if (!stripe || !elements) { return; }
      
        setPaymentLoading(true);
        const cardElement = elements.getElement(CardElement);

        toast.info("starting payment")
        try {
            const res = await fetch("/api/payment/intent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: 5000, // Amount in paise (e.g., 5000 paise = 50 INR)
                providerID,
                slot: selectedSlot?.time,
                date: formattedDate,
              }),
            });
      
            const { clientSecret, paymentIntentId } = await res.json();
            console.log("clientSecret", clientSecret);
            console.log("paymentIntentId", paymentIntentId);
      
            // Confirm the payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                card: cardElement!,
                },
            });

            console.log("result", result)

            if (result.error) {
                setPaymentError(result.error.message || 'Payment failed');
                toast.error(result.error.message || 'Payment failed')
                setPaymentLoading(false);
                return;
            }

            console.log("result.paymentIntent?.status", result.paymentIntent?.status)

            if (result.paymentIntent?.status === 'succeeded' || result.paymentIntent?.status === 'requires_capture') {
                toast.success("Payment successful");
                handleBookAppointment(paymentIntentId);
            } 
          } catch (error) {
            setPaymentError("Payment failed. Please try again.");
            setPaymentLoading(false);
          }
        };

        const handleCapturePayment = async (paymentIntentId: string) => {
            try {
                const res = await fetch("/api/payment/capture", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentIntentId }),
                });
        
                const { paymentIntent } = await res.json();
                console.log("Payment captured:", paymentIntent);
        
                if (paymentIntent.status === 'succeeded') {
                    toast.success("Payment captured successfully");
                    handleBookAppointment(paymentIntentId);
                } else {
                    toast.error("Failed to capture payment");
                    setPaymentLoading(false);
                }
            } catch (error) {
                console.error("Error capturing payment:", error);
                setPaymentError("Failed to capture payment.");
                setPaymentLoading(false);
            }
        };


    const handleBookAppointment = async (paymentIntentId: string) => {
        if (selectedSlot && formattedDate && providerID && paymentIntentId) {
            toast.info("starting bokking confirmation")
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
                        paymentIntentId,
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
                        handleConfirmAppointment={handleConfirmAppointment}
                        selectedDate={selectedDate}
                        slotsForSelectedDate={slotsForSelectedDate}
                        paymentError = {paymentError}
                        paymentLoading = {paymentLoading}
                        stripe = {stripe}
                    />
                </div>
            ) : (
                <div className="p-4 text-ColorThree">Loading provider details...</div>
            )}
        </div>
    );
};

export default page;