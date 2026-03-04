import { Layout } from "@/components/layout";
import { useScans, useDeleteScan } from "@/hooks/use-scans";
import { format } from "date-fns";
import { Trash2, Search, ExternalLink, QrCode } from "lucide-react";
import { Button, Card } from "@/components/ui-elements";
import { useState } from "react";

export default function HistoryPage() {
  const { data: scans, isLoading } = useScans();
  const deleteScan = useDeleteScan();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredScans = scans?.filter(scan => 
    scan.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.format.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const isUrl = (text: string) => text.startsWith("http://") || text.startsWith("https://");

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-display text-foreground">Scan History</h2>
            <p className="text-muted-foreground text-lg">Your previously scanned QR codes and barcodes.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search scans..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border-2 border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-24 animate-pulse bg-secondary/50 border-none shadow-none" />
            ))}
          </div>
        ) : filteredScans.length > 0 ? (
          <div className="grid gap-4">
            {filteredScans.map((scan) => (
              <Card key={scan.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary uppercase tracking-wider">
                      {scan.format.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">
                      {format(new Date(scan.createdAt), "MMM d, yyyy • h:mm a")}
                    </span>
                  </div>
                  <p className="text-base font-medium text-foreground truncate" title={scan.content}>
                    {scan.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {isUrl(scan.content) && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => window.open(scan.content, "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" /> Open
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this scan?")) {
                        deleteScan.mutate(scan.id);
                      }
                    }}
                    disabled={deleteScan.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed bg-transparent shadow-none">
            <div className="flex flex-col items-center justify-center opacity-60">
              <QrCode className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold font-display text-foreground mb-2">No scans found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {searchTerm ? "No results match your search." : "You haven't scanned anything yet. Head to the scanner to get started!"}
              </p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
