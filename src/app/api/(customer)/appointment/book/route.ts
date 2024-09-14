//Booking an appointment by the customer

import { middleware } from "@/middleware/middleware";

import { NextResponse } from "next/server";

import { Provider } from "@/models/Provider";
import { Availability, Slot, TypeUser } from "@/types";

import { sendNotification } from "@/helpers/notification";

import { connectToDatabase } from "@/config/MongoConnect";
import { AddDataInFireStore } from "@/helpers/(firebase)/addData";
import { getAvailabilityFromFirestore } from "@/helpers/(firebase)/GetData";

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export const POST = async (req: Request) => {
    try {
        const decodedUser = await middleware(req) as Omit<TypeUser, 'password'>;

        try {

            await connectToDatabase();

            //checking if provider is there
            const { providerID, date, slot, paymentIntentId } = await req.json();
            console.log("providerID,date,slot, paymentIntentId", providerID, date, slot, paymentIntentId)
            //If date and slot are not provided
            if (!date || !slot || !paymentIntentId) {
                throw new Error("Date, paymentIntentId and Slot is required!!")
            }

            const provider = await Provider.findOne({ userID: providerID });
            if (!provider) {
                return new NextResponse(JSON.stringify({ message: 'Provider not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

             // Capture the payment intent
             const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
             console.log("Captured Payment Intent:", paymentIntent);

            // Check payment intent status
            if (paymentIntent.status !== 'succeeded') {
                throw new Error("Payment not captured successfully.");
            }

            // Convert the date string to a Date object for comparison
            const selectedDate = new Date(date);
            console.log("selectedDate", selectedDate)
            if (isNaN(selectedDate.getTime())) {
                throw new Error("Invalid date format");
            }

            // //finding availability using providerID and date
            const { availability, docID } = await getAvailabilityFromFirestore(providerID);
            console.log("Provider_Availability: ", availability)

            const existingAvailability = availability.find((availability: Availability) =>
                new Date(availability.date).toISOString() === selectedDate.toISOString()
            );
            console.log("existingAvailability", existingAvailability)

            //If provider is not available
            if (!existingAvailability) {
                return new NextResponse(JSON.stringify({ message: "Provider not available for selected date or time" }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                })
            }

            // Find the specific slot and mark it as booked
            const slotToBook = existingAvailability.slots.find((s: Slot) => s.time === slot && s.status === 'ADDED');
            console.log("slotToBook: ", slotToBook)
            //Slot is already booked
            if (!slotToBook) {
                return new NextResponse(JSON.stringify({ message: "Slot not available or already booked" }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            const newAppointment = {
                userID: decodedUser._id,
                providerID,
                date: `${date}`,
                time: slot,
                status: "PENDING",
                paymentIntentId,
            };
            console.log("newAppointment:", newAppointment);

            await AddDataInFireStore("appointments", newAppointment);

            //Sending notification when appointment is booked
            await sendNotification(providerID, `You have a new booking on ${date.split("T")[0]} at ${slot}, appointment is from ${decodedUser.name}`)

            return new NextResponse(JSON.stringify({ message: "Appointment booked succesfully!!", appointment: newAppointment, provider, paymentIntent }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            })
        } catch (error) {
            console.log("Error while Booking an appointment: ", error);
            return new NextResponse(JSON.stringify({ message: "Error while Booking an appointment" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            })
        }
    } catch (error) {

        console.log("error: ", error)
        return new NextResponse(JSON.stringify({ message: 'Invalid or expired token' }), { status: 401 });
    }
}