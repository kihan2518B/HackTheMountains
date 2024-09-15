
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { db } from '@/config/firebase'; // Firestore
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Provider } from '@/models/Provider';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/config/MongoConnect';

// Initialize the Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const POST = async (req: Request) => {

  console.log("req.method", req.method)
  if (req.method !== 'POST') {
    return new NextResponse(JSON.stringify({ message: "Method not allowed" }), { status: 405 })
  }

  try {
    // Extract data from the request body
    const { providerID, paymentIntentId, date, time, selectedAction } = await req.json();

    // Calculate current time and appointment time difference in minutes
    const appointmentTime = new Date(`${date}T${time}`);
    const currentTime = new Date();
    const timeDiffMinutes = (appointmentTime.getTime() - currentTime.getTime()) / (1000 * 60);

    // Query to find the appointment document by providerID, date, and time (Firestore)
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('providerID', '==', providerID),
      where('date', '==', date),
      where('time', '==', time)
    );
    const snapshot = await getDocs(appointmentsQuery);
    
    // If no matching appointment found
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Handle appointment cancelation and refund
    if (selectedAction === 'CANCEL') {
      if (timeDiffMinutes <= 20) {
        // Case 1: Cancel within 20 minutes - refund and apply penalty to provider
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
        });

        // Connect to MongoDB and penalize provider
        await connectToDatabase();

        const provider = await Provider.findOne({ userID: providerID }).exec(); // collecting one collection who have same value of email as email coming from the json
        // console.log("provider",provider);
  
        if (!provider) { return new NextResponse(JSON.stringify({ message: "Provider Not Found!!" }), { status: 404 }) };
  

        if (provider) {
          provider.balance -= 2; // Penalize the provider
          await provider.save();
        }

        console.log('Appointment canceled. Payment refunded and penalty applied to the provider.')
        return new NextResponse(JSON.stringify({ message: 'Appointment canceled. Payment refunded and penalty applied to the provider.' }), { status: 200 })

      } else {
        // Case 2: Cancel before 20 minutes - only refund
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
        });

        console.log('Appointment canceled. Payment refunded.')

        return new NextResponse(JSON.stringify({ message: 'Appointment canceled. Payment refunded' }), { status: 200 })

      }
    } else {
        return new NextResponse(JSON.stringify({ message: 'Invalid action' }), { status: 400 })

    }
  } catch (error) {
    console.error('Error in cancelAppointment API:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal server error' }), { status: 500 })

  }
}


