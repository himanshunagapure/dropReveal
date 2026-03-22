import { useState } from "react";
import { X, Sparkles, EyeOff, Copy, Check, ShoppingBag, ExternalLink } from "lucide-react";
import type { Reel } from "@/data/mockReels";

interface ReelModalProps {
  reel: Reel | null;
  onClose: () => void;
}

const ReelModal = ({ reel, onClose }: ReelModalProps) => {
  const [promptVisible, setPromptVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!reel) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reel.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" style={{ animation: 'fade-in 0.2s ease-out' }} />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 flex items-center justify-center transition-all active:scale-90"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Image */}
        <div className="relative aspect-[9/14] max-h-[55vh] overflow-hidden rounded-t-2xl">
          <img
            src={reel.thumbnail}
            alt={reel.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          
          {/* Play overlay */}
          <a
            href={reel.reel_link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center group/play"
          >
            <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 transition-transform duration-200 group-hover/play:scale-110 group-active/play:scale-95">
              <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1" />
            </div>
          </a>
        </div>

        {/* Details */}
        <div className="p-5 space-y-4 -mt-8 relative">
          <h2
            className="text-xl font-bold text-foreground text-balance leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {reel.title}
          </h2>

          {/* Reveal Prompt */}
          <button
            onClick={() => setPromptVisible(!promptVisible)}
            className={`w-full h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97] ${
              promptVisible
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {promptVisible ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Prompt
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Reveal Prompt
              </>
            )}
          </button>

          {/* Prompt */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              promptVisible ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="relative p-4 rounded-xl bg-secondary/60 border border-border/40">
              <p className="text-sm leading-relaxed text-secondary-foreground pr-10" style={{ fontFamily: 'var(--font-body)' }}>
                {reel.prompt}
              </p>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 h-8 px-3 rounded-lg bg-background/60 hover:bg-background flex items-center gap-1.5 text-xs transition-all duration-200 active:scale-90"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span className="text-primary">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Shop */}
          {reel.clothes_link && (
            <a
              href={reel.clothes_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/40 hover:bg-secondary border border-border/40 transition-all duration-200 active:scale-[0.97]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <ShoppingBag className="w-4 h-4" />
              Shop This Look
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReelModal;
