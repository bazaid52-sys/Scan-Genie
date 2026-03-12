import { useState, useRef } from "react";
import { Layout } from "@/components/layout";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Download, QrCode, Palette } from "lucide-react";
import { Card } from "@/components/ui-elements";
import { useToast } from "@/hooks/use-toast";

const PRESETS = [
  { label: "Classic", fg: "#000000", bg: "#ffffff" },
  { label: "Ocean", fg: "#1a4e8c", bg: "#e8f4fd" },
  { label: "Forest", fg: "#1a5c2e", bg: "#edf7f0" },
  { label: "Sunset", fg: "#c0392b", bg: "#fef5f4" },
  { label: "Violet", fg: "#6c3483", bg: "#f5eef8" },
  { label: "Slate", fg: "#2c3e50", bg: "#f0f3f4" },
];

export default function Generate() {
  const [text, setText] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(256);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const hasContent = text.trim().length > 0;

  const handleDownload = () => {
    if (!hasContent) return;
    const canvas = canvasRef.current?.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
    toast({ title: "Downloaded!", description: "QR code saved as PNG." });
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-3xl font-bold font-display text-foreground">Generate</h2>
          <p className="text-muted-foreground text-lg">Create a custom QR code instantly.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Controls */}
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Content</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter a URL, text, phone number…"
                rows={4}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition"
                data-testid="input-qr-content"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Color Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { setFgColor(p.fg); setBgColor(p.bg); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      fgColor === p.fg && bgColor === p.bg
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-background text-muted-foreground hover:border-primary/50"
                    }`}
                    data-testid={`preset-${p.label.toLowerCase()}`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10"
                      style={{ backgroundColor: p.fg }}
                    />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Foreground
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-input cursor-pointer bg-transparent"
                    data-testid="input-fg-color"
                  />
                  <span className="text-sm font-mono text-muted-foreground">{fgColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Background
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-input cursor-pointer bg-transparent"
                    data-testid="input-bg-color"
                  />
                  <span className="text-sm font-mono text-muted-foreground">{bgColor}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Size — {size}px
              </label>
              <input
                type="range"
                min={128}
                max={512}
                step={64}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-primary"
                data-testid="input-qr-size"
              />
            </div>
          </Card>

          {/* Preview + Download */}
          <Card className="p-6 flex flex-col items-center justify-center gap-6">
            {hasContent ? (
              <>
                <div
                  ref={canvasRef}
                  className="rounded-2xl overflow-hidden shadow-xl border border-border/30 p-3"
                  style={{ backgroundColor: bgColor }}
                  data-testid="qr-preview"
                >
                  <QRCodeCanvas
                    value={text}
                    size={Math.min(size, 240)}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                  data-testid="button-download-qr"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center opacity-40 py-12 text-center">
                <QrCode className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">
                  Your QR code will appear here
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Type something on the left to start
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
