// API Route: /api/payment/schedule-transfer
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const POST = async (req: Request) => {
  try {
    const { paymentIntentId, appointmentDateTime } = await req.json();

    // Logic to schedule the payment transfer. This may involve using a task scheduler or cron job
    // Ensure the payment transfer is handled securely

    // Example: Initiating a transfer (this should be a background job or cloud function)
    // await stripe.transfers.create({
    //   amount, // Amount to transfer
    //   currency: 'inr',
    //   destination: providerAccountId,
    //   description: 'Payment for confirmed appointment',
    // });

    return new NextResponse(JSON.stringify({ message: 'Transfer scheduled.' }), { status: 200 });
  } catch (error) {
    console.error('Error scheduling payment transfer:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to schedule payment transfer.' }), { status: 500 });
  }
};
