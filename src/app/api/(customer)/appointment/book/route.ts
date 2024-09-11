//Booking an appointment by the customer

import { middleware } from "@/middleware/middleware";

import { NextResponse } from "next/server";

import { Provider } from "@/models/Provider";
import { Availability, Slot, TypeUser } from "@/types";

import { sendNotification } from "@/helpers/notification";

import { connectToDatabase } from "@/config/MongoConnect";
import { AddDataInFireStore } from "@/helpers/(firebase)/addData";
import { getAvailabilityFromFirestore } from "@/helpers/(firebase)/GetData";


export const POST = async (req: Request) => {
    try {
        const decodedUser = await middleware(req) as Omit<TypeUser, 'password'>;

        try {

            await connectToDatabase();

            //checking if provider is there
            const { providerID, date, slot } = await req.json();
            console.log("providerID,date,slot", providerID, date, slot)
            //If date and slot are not provided
            if (!date || !slot) {
                throw new Error("Date and Slot is required!!")
            }

            const provider = await Provider.findById(providerID);
            if (!provider) {
                return new NextResponse(JSON.stringify({ message: 'Provider not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Convert the date string to a Date object for comparison
            const selectedDate = new Date(date);
            if (isNaN(selectedDate.getTime())) {
                throw new Error("Invalid date format");
            }

            //finding availability using providerID and date
            const Provider_Availability = await getAvailabilityFromFirestore(providerID);
            const existingAvailability = Provider_Availability.find((availability: Availability) =>
                new Date(availability.date).toISOString() === selectedDate.toISOString()
            );
            // const existingAvailability = provider.availability.find((availability: Availability) =>
            //     new Date(availability.date).toISOString() === selectedDate.toISOString()
            // );

            //If provider is not available
            if (!existingAvailability) {
                return new NextResponse(JSON.stringify({ message: "Provider not available for selected date or time" }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                })
            }

            // Find the specific slot and mark it as booked
            const slotToBook = existingAvailability.slots.find((s: Slot) => s.time === slot && !s.isBooked);

            //Slot is already booked
            if (!slotToBook) {
                return new NextResponse(JSON.stringify({ message: "Slot not available or already booked" }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Mark the slot as booked
            slotToBook.isBooked = true;

            // Save the updated provider's availability
            await provider.save();

            const newAppointment = {
                userID: decodedUser._id,
                providerID: provider._id,
                date: new Date(date),
                time: slot,
            }

            await AddDataInFireStore("appointments", newAppointment);

            //Sending notification when appointment is booked
            await sendNotification(providerID, `You have a new booking on ${date.split("T")[0]} at ${slot}, appointment is from ${decodedUser.email}`)

            return new NextResponse(JSON.stringify({ message: "Appointment booked succesfully!!", appointment: newAppointment, provider }), {
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