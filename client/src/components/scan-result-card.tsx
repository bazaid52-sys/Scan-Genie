import { Copy, ExternalLink, CheckCircle2, X, Share2 } from "lucide-react";
import { Card } from "./ui-elements";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ScanResultCardProps {
  content: string;
  format: string;
  onClose: () => void;
}

function detectUrl(text: string): string | null {
  const trimmed = text.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^ftp:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/|$)/.test(trimmed) && !trimmed.includes(' ') && !trimmed.includes('\n')) {
    return `https://${trimmed}`;
  }
  return null;
}

function openUrl(url: string) {
  try {
    const win = (window.top ?? window).open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = url;
    }
  } catch {
    window.location.href = url;
  }
}

export function ScanResultCard({ content, format, onClose }: ScanResultCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const resolvedUrl = detectUrl(content);
  const isUrl = resolvedUrl !== null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ title: "Copied!", description: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Scanned Content',
          text: content,
          url: resolvedUrl ?? undefined,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="fixed bottom-24 md:bottom-6 left-6 right-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-md z-[9999] animate-in slide-in-from-bottom-8 fade-in duration-300 p-6 bg-card border-2 border-primary/20 shadow-2xl shadow-primary/10 pointer-events-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
        data-testid="button-close-result"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="pr-8">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary mb-3">
          {format.replace(/_/g, ' ')}
        </span>
        <h3 className="text-lg font-bold font-display text-foreground mb-4 break-words">
          {content}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6">
        <button
          onClick={handleCopy}
          className="flex flex-col items-center gap-1 px-2 py-2 text-[10px] rounded-md bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          data-testid="button-copy"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 px-2 py-2 text-[10px] rounded-md border border-input hover:bg-accent/10 text-foreground transition-colors"
          data-testid="button-share"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        <button
          onClick={() => resolvedUrl && openUrl(resolvedUrl)}
          disabled={!isUrl}
          className={`flex flex-col items-center gap-1 px-2 py-2 text-[10px] rounded-md transition-colors ${
            isUrl
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer'
              : 'bg-muted text-muted-foreground opacity-40 cursor-not-allowed'
          }`}
          data-testid="button-open-link"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open</span>
        </button>
      </div>
    </Card>
  );
}
