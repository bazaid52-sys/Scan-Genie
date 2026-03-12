import { Copy, ExternalLink, CheckCircle2, X, Share2, Phone, Mail, Wifi, MessageSquare } from "lucide-react";
import { Card } from "./ui-elements";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ScanResultCardProps {
  content: string;
  format: string;
  onClose: () => void;
}

type ContentType = "url" | "phone" | "email" | "sms" | "wifi" | "text";

interface Resolved {
  type: ContentType;
  href: string | null;
  label: string;
  icon: React.ReactNode;
}

function resolve(raw: string): Resolved {
  const t = raw.trim();

  // Specific known schemes first
  if (/^tel:/i.test(t))    return { type: "phone", href: t, label: "Call",  icon: <Phone className="w-5 h-5" /> };
  if (/^mailto:/i.test(t)) return { type: "email", href: t, label: "Email", icon: <Mail className="w-5 h-5" /> };
  if (/^sms:/i.test(t))    return { type: "sms",   href: t, label: "Text",  icon: <MessageSquare className="w-5 h-5" /> };
  if (/^WIFI:/i.test(t))   return { type: "wifi",  href: null, label: "WiFi", icon: <Wifi className="w-5 h-5" /> };

  // Any scheme:// — covers http, https, ftp, exp, geo, maps, intent, etc.
  if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//i.test(t)) {
    return { type: "url", href: t, label: "Open", icon: <ExternalLink className="w-5 h-5" /> };
  }

  // www. prefix
  if (/^www\./i.test(t)) {
    return { type: "url", href: `https://${t}`, label: "Open", icon: <ExternalLink className="w-5 h-5" /> };
  }

  // Bare domain like "youtube.com" or "youtube.com/watch?v=..."
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/|$|\?)/.test(t) && !t.includes(' ') && !t.includes('\n')) {
    return { type: "url", href: `https://${t}`, label: "Open", icon: <ExternalLink className="w-5 h-5" /> };
  }

  // Bare phone number like "+1234567890" or "07712345678"
  if (/^\+?[\d\s\-().]{7,15}$/.test(t) && t.replace(/\D/g, '').length >= 7) {
    return { type: "phone", href: `tel:${t.replace(/\s/g, '')}`, label: "Call", icon: <Phone className="w-5 h-5" /> };
  }

  // Bare email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
    return { type: "email", href: `mailto:${t}`, label: "Email", icon: <Mail className="w-5 h-5" /> };
  }

  return { type: "text", href: null, label: "Open", icon: <ExternalLink className="w-5 h-5" /> };
}

export function ScanResultCard({ content, format, onClose }: ScanResultCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const resolved = resolve(content);
  const canOpen = resolved.href !== null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopied(true);
    toast({ title: "Copied!", description: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Scanned Content", text: content, url: resolved.type === "url" ? resolved.href ?? undefined : undefined });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
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

        {canOpen ? (
          <a
            href={resolved.href!}
            className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-[11px] font-medium transition-colors no-underline text-center"
            data-testid="button-open-link"
          >
            {resolved.icon}
            {resolved.label}
          </a>
        ) : (
          <div
            className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl bg-muted text-muted-foreground opacity-40 text-[11px] font-medium cursor-not-allowed"
            data-testid="button-open-link-disabled"
          >
            {resolved.icon}
            {resolved.label}
          </div>
        )}
      </div>

      {!canOpen && (
        <p className="text-[10px] text-muted-foreground text-center mt-3 opacity-60">
          No action available for plain text
        </p>
      )}
    </Card>
  );
}
