import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const POST = async (req: Request) => {
  try {
    const { amount, providerID, slot, date } = await req.json();
    console.log("come to payment route")

    // Create PaymentIntent with the amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Pass the appointment amount
      currency: 'inr',  // Indian Rupees
      payment_method_types: ['card'],
      capture_method: 'manual', // Hold the payment
      description: `Booking appointment with provider ${providerID} on ${date} at ${slot}`,
    });

    console.log("end in payment route")

    return new NextResponse(JSON.stringify({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, }), { status: 200 });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new NextResponse(JSON.stringify({ error: 'Payment failed to initialize.' }), { status: 500 });
  }
};
