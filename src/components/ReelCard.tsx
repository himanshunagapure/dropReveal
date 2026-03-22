import { useState } from "react";
import { Sparkles, EyeOff, Copy, Check, ExternalLink, ShoppingBag } from "lucide-react";
import type { Reel } from "@/data/mockReels";

interface ReelCardProps {
  reel: Reel;
  index: number;
  onOpenModal: (reel: Reel) => void;
}

const ReelCard = ({ reel, index, onOpenModal }: ReelCardProps) => {
  const [promptVisible, setPromptVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(reel.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPromptVisible(!promptVisible);
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-card border border-border/40 transition-all duration-500 hover:border-primary/20"
      style={{
        animationDelay: `${index * 80}ms`,
        animation: 'fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-[9/14] cursor-pointer overflow-hidden"
        onClick={() => onOpenModal(reel)}
      >
        <img
          src={reel.thumbnail}
          alt={reel.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        
        {/* Play hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <div className="w-0 h-0 border-l-[14px] border-l-white border-y-[8px] border-y-transparent ml-1" />
          </div>
        </div>

        {/* Title on image */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3
            className="text-white font-semibold text-base leading-snug line-clamp-2"
            style={{ fontFamily: 'var(--font-display)', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
          >
            {reel.title}
          </h3>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        {/* Reveal Prompt Button */}
        <button
          onClick={togglePrompt}
          className={`w-full h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97] ${
            promptVisible
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {promptVisible ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              Hide Prompt
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Reveal Prompt
            </>
          )}
        </button>

        {/* Prompt Content */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            promptVisible ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="relative p-3 rounded-xl bg-secondary/60 border border-border/40">
            <p className="text-xs leading-relaxed text-secondary-foreground pr-8" style={{ fontFamily: 'var(--font-body)' }}>
              {reel.prompt}
            </p>
            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-background/60 hover:bg-background flex items-center justify-center transition-all duration-200 active:scale-90"
              title="Copy prompt"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Shop Link */}
        {reel.clothes_link && (
          <a
            href={reel.clothes_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/40 hover:bg-secondary border border-transparent hover:border-border/40 transition-all duration-200 active:scale-[0.97]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Shop This Look
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
        )}
      </div>
    </div>
  );
};

export default ReelCard;
