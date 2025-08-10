"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = loadStripe(stripePublicKey);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!stripe || !elements) return;

    const amt = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amt) || amt <= 0) {
      setMessage("Enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, currency: "usd" }),
      });
      const data = await res.json();
      if (!res.ok || !data?.clientSecret) {
        throw new Error(data?.error || "Failed to create payment intent");
      }

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setMessage(result.error.message || "Payment failed");
      } else if (result.paymentIntent?.status === "succeeded") {
        setMessage("Payment successful!");
      } else {
        setMessage(
          "Payment status: " + (result.paymentIntent?.status || "unknown")
        );
      }
    } catch (err: any) {
      setMessage(err?.message || "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-4 bg-dark-400 p-4 rounded-lg"
    >
      <h1 className="text-xl font-semibold text-white">Payments</h1>
      <input
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (e.g., 49.99)"
        className="w-full px-3 py-2 rounded bg-dark-300 text-gray-200 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
      />
      <div className="p-3 rounded bg-dark-300 border border-dark-500 text-gray-200">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full rounded px-4 py-2 bg-dark-500 text-white hover:bg-dark-600 disabled:opacity-50"
      >
        {isLoading ? "Processing..." : "Pay"}
      </button>
      {message && <div className="text-sm text-gray-300">{message}</div>}
    </form>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-[60vh] flex items-start justify-center p-6">
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
