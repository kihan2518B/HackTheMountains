// In your server-side file (e.g., /api/payment/capture)

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const POST = async (req: Request) => {
    try {
        const { paymentIntentId } = await req.json();

        if (!paymentIntentId) {
            throw new Error("PaymentIntent ID is required");
        }

        // Capture the payment
        const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
        console.log("Captured Payment Intent:", paymentIntent);

        return new NextResponse(JSON.stringify({ paymentIntent }), { status: 200 });
    } catch (error) {
        console.error('Error capturing payment:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to capture payment.' }), { status: 500 });
    }
};
