import { useState } from "react";
import type { Reel } from "@/types/reel";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

interface RestoreAccessProps {
  reel: Reel;
  onRestored: (dropToken: string) => void;
}

export function RestoreAccess({ reel, onRestored }: RestoreAccessProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "not_found">("idle");

  const handleRestore = async () => {
    if (!email.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch(`${BACKEND_URL}/restore-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reel_id: reel.id, email: email.trim() }),
      });

      const result = (await res.json()) as {
        unlocked: boolean;
        drop_token?: string;
      };

      if (result.unlocked && result.drop_token) {
        localStorage.setItem(`unlocked_${reel.id}`, result.drop_token);
        onRestored(result.drop_token);
      } else {
        setStatus("not_found");
      }
    } catch {
      setStatus("not_found");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-center text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors py-1"
      >
        Already paid? Restore your access
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 space-y-3">
      <p className="text-sm font-medium text-foreground">Restore access</p>
      <p className="text-xs text-muted-foreground">
        Enter the email address you used when you paid.
      </p>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "not_found") setStatus("idle");
        }}
        onKeyDown={(e) => e.key === "Enter" && handleRestore()}
        className="w-full h-9 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
      <button
        onClick={handleRestore}
        disabled={status === "loading" || !email.trim()}
        className="w-full h-9 rounded-lg text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Checking…" : "Restore Access"}
      </button>
      {status === "not_found" && (
        <p className="text-xs text-destructive">
          No purchase found for this email. Try a different address or{" "}
          <a
            href="mailto:support@dropreveal.com"
            className="underline underline-offset-2"
          >
            contact support
          </a>
          .
        </p>
      )}
    </div>
  );
}
