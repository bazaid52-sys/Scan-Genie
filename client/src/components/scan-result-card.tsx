import { Copy, ExternalLink, CheckCircle2, X, Share2 } from "lucide-react";
import { Card } from "./ui-elements";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ScanResultCardProps {
  content: string;
  format: string;
  onClose: () => void;
}

function resolveUrl(text: string): string | null {
  const t = text.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (/^ftp:\/\//i.test(t)) return t;
  if (/^www\./i.test(t)) return `https://${t}`;
  // Looks like a domain (e.g. "youtube.com" or "youtube.com/watch?v=...")
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/|$|\?)/.test(t) && !t.includes(' ') && !t.includes('\n')) {
    return `https://${t}`;
  }
  return null;
}

export function ScanResultCard({ content, format, onClose }: ScanResultCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const url = resolveUrl(content);
  const isUrl = url !== null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopied(true);
    toast({ title: "Copied!", description: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Scanned Content", text: content, url: url ?? undefined });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleOpen = () => {
    if (!url) return;
    // Use location.href — works in every context: real browser, iframe, mobile
    window.location.href = url;
  };

  return (
    <Card className="fixed bottom-24 md:bottom-6 left-6 right-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-md z-[9999] animate-in slide-in-from-bottom-8 fade-in duration-300 p-6 bg-card border-2 border-primary/20 shadow-2xl shadow-primary/10">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
        data-testid="button-close-result"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="pr-8">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary mb-3">
          {format.replace(/_/g, " ")}
        </span>
        <p className="text-sm font-medium text-foreground break-all leading-relaxed mt-1">
          {content}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-5">
        <button
          onClick={handleCopy}
          className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl bg-secondary hover:bg-secondary/70 text-foreground text-[11px] font-medium transition-colors"
          data-testid="button-copy"
        >
          {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          {copied ? "Copied!" : "Copy"}
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl border border-border hover:bg-accent/10 text-foreground text-[11px] font-medium transition-colors"
          data-testid="button-share"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>

        <button
          onClick={handleOpen}
          className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-[11px] font-medium transition-colors ${
            isUrl
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground opacity-40 cursor-not-allowed"
          }`}
          data-testid="button-open-link"
        >
          <ExternalLink className="w-5 h-5" />
          Open
        </button>
      </div>

      {!isUrl && (
        <p className="text-[10px] text-muted-foreground text-center mt-3 opacity-60">
          Open is only available for links
        </p>
      )}
    </Card>
  );
}
