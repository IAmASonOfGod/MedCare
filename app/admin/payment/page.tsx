"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = loadStripe(stripePublicKey);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!stripe || !elements) return;

    const amt = 80000; // 800 ZAR fixed

    setIsLoading(true);
    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data?.clientSecret) {
        throw new Error(data?.error || "Failed to create payment intent");
      }

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
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
      className="w-full max-w-lg space-y-6 bg-dark-400 p-6 rounded-xl"
    >
      <h1 className="text-2xl font-semibold text-white">Payments</h1>
      <div className="w-full px-3 py-2 rounded bg-dark-300 text-white border border-dark-500">
        Subscription: R800.00 (ZAR)
      </div>
      <div className="space-y-4 p-4 rounded bg-dark-300 border border-dark-500 text-gray-200">
        <label className="block text-base mb-2 text-white">Card number</label>
        <div className="rounded bg-dark-400 p-4">
          <CardNumberElement
            options={{
              showIcon: true,
              style: {
                base: {
                  color: "#ffffff",
                  fontSize: "18px",
                  "::placeholder": { color: "#94a3b8" },
                  iconColor: "#94a3b8",
                },
                invalid: { color: "#ef4444" },
              },
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-base mb-2 text-white">Expiry</label>
            <div className="rounded bg-dark-400 p-4">
              <CardExpiryElement
                options={{
                  style: {
                    base: {
                      color: "#ffffff",
                      fontSize: "18px",
                      "::placeholder": { color: "#94a3b8" },
                    },
                    invalid: { color: "#ef4444" },
                  },
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-base mb-2 text-white">CVC</label>
            <div className="rounded bg-dark-400 p-4">
              <CardCvcElement
                options={{
                  style: {
                    base: {
                      color: "#ffffff",
                      fontSize: "18px",
                      "::placeholder": { color: "#94a3b8" },
                    },
                    invalid: { color: "#ef4444" },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full rounded-lg px-6 py-3 text-lg bg-dark-500 text-white hover:bg-dark-600 disabled:opacity-50"
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
