import { useState } from "react";
import type { Reel } from "@/types/reel";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

interface UnlockButtonProps {
  reel: Reel;
  onUnlocked: (dropToken: string) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

export function UnlockButton({ reel, onUnlocked }: UnlockButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commissionRate = reel.creator_is_pro ? 0.10 : 0.20;
  const priceInr = reel.unlock_price_inr ?? 0;

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1 — Create Razorpay order via FastAPI
      const orderRes = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(priceInr * 100), // paise
          currency: "INR",
          reel_id: reel.id,
          creator_id: reel.creator_id,
          commission_rate: commissionRate,
        }),
      });

      if (!orderRes.ok) {
        throw new Error("Could not create payment order. Please try again.");
      }

      const { order_id, amount, key_id } = (await orderRes.json()) as {
        order_id: string;
        amount: number;
        key_id: string;
      };

      // Step 2 — Open Razorpay checkout
      // Razorpay collects email + phone automatically — used for cross-device recovery
      const options: Record<string, unknown> = {
        key: key_id,
        amount,
        currency: "INR",
        name: "DropReveal",
        description: `Unlock: ${reel.title}`,
        order_id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // Step 3 — Verify payment via FastAPI
          const verifyRes = await fetch(`${BACKEND_URL}/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const result = (await verifyRes.json()) as {
            success: boolean;
            drop_token?: string;
          };

          if (result.success && result.drop_token) {
            localStorage.setItem(`unlocked_${reel.id}`, result.drop_token);
            onUnlocked(result.drop_token);
          } else {
            setError("Payment verified but unlock failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        theme: { color: "#534AB7" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
            Processing…
          </>
        ) : (
          `Unlock for ₹${priceInr}`
        )}
      </button>
      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
