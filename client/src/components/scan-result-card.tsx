import { Copy, ExternalLink, CheckCircle2, X, Share2 } from "lucide-react";
import { Button, Card } from "./ui-elements";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ScanResultCardProps {
  content: string;
  format: string;
  onClose: () => void;
}

export function ScanResultCard({ content, format, onClose }: ScanResultCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const isUrl = content.startsWith("http://") || content.startsWith("https://");

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLink = () => {
    if (isUrl) {
      window.open(content, "_blank", "noopener,noreferrer");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Scanned Content',
          text: content,
          url: isUrl ? content : undefined,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="fixed bottom-6 left-6 right-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-md z-50 animate-in slide-in-from-bottom-8 fade-in duration-300 p-6 bg-card border-2 border-primary/20 shadow-2xl shadow-primary/10">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="pr-8">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary mb-3">
          {format.replace(/_/g, ' ')}
        </span>
        
        <h3 className="text-xl font-bold font-display text-foreground mb-4 break-words">
          {content}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <Button onClick={handleCopy} variant="secondary" className="w-full">
          {copied ? (
            <span className="flex items-center gap-2 text-green-600 dark:text-green-500">
              <CheckCircle2 className="w-4 h-4" /> Copied
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Copy className="w-4 h-4" /> Copy
            </span>
          )}
        </Button>

        <Button onClick={handleShare} variant="outline" className="w-full">
          <span className="flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Share
          </span>
        </Button>
        
        {isUrl && (
          <Button onClick={handleOpenLink} className="col-span-2">
            <span className="flex items-center gap-2">
              Open Link <ExternalLink className="w-4 h-4" />
            </span>
          </Button>
        )}
      </div>
    </Card>
  );
}
