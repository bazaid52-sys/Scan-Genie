import { useState } from "react";
import { Layout } from "@/components/layout";
import { Scanner } from "@/components/scanner";
import { ScanResultCard } from "@/components/scan-result-card";
import { useCreateScan, useScans } from "@/hooks/use-scans";
import { formatDistanceToNow } from "date-fns";
import { QrCode, Clock } from "lucide-react";
import { Card } from "@/components/ui-elements";

export default function Home() {
  const [currentScan, setCurrentScan] = useState<{ content: string; format: string } | null>(null);
  const createScan = useCreateScan();
  const { data: scans } = useScans();

  const handleScan = (content: string, format: string) => {
    // Prevent duplicate exact scans immediately
    if (currentScan?.content === content) return;
    
    setCurrentScan({ content, format });
    createScan.mutate({ content, format });
  };

  const recentScans = scans?.slice(0, 3) || [];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-3xl font-bold font-display text-foreground">Scanner</h2>
          <p className="text-muted-foreground text-lg">Point your camera at a code or upload an image.</p>
        </div>

        <Scanner onScan={handleScan} />

        {currentScan && (
          <ScanResultCard 
            content={currentScan.content} 
            format={currentScan.format}
            onClose={() => setCurrentScan(null)}
          />
        )}

        {/* Quick Recent History */}
        <div className="pt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-display flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              Recent Scans
            </h3>
          </div>
          
          {recentScans.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentScans.map((scan) => (
                <Card key={scan.id} className="p-4 flex flex-col justify-between group cursor-pointer hover:-translate-y-1" onClick={() => setCurrentScan({ content: scan.content, format: scan.format })}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground uppercase tracking-wider">
                      {scan.format.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2 leading-relaxed">
                    {scan.content}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed bg-transparent shadow-none">
              <div className="flex flex-col items-center justify-center opacity-50">
                <QrCode className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">No recent scans</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
