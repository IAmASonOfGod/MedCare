import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" as any });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const currency = (body?.currency || "usd").toLowerCase();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (e: any) {
    console.error("Create intent error:", e);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}