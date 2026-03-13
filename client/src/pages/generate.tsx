import { useState, useRef, useCallback } from "react";
import { Layout } from "@/components/layout";
import { QRCodeCanvas } from "qrcode.react";
import {
  Download, Palette, Sparkles, Wifi, MessageCircle, Instagram,
  PenLine, Upload, X, Eye, EyeOff, ChevronDown, ChevronUp
} from "lucide-react";
import { Card } from "@/components/ui-elements";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = "custom" | "templates";
type TemplateKey = "wifi" | "whatsapp" | "instagram";

const PRESETS = [
  { label: "Classic", fg: "#000000", bg: "#ffffff" },
  { label: "Ocean",   fg: "#1a4e8c", bg: "#e8f4fd" },
  { label: "Forest",  fg: "#1a5c2e", bg: "#edf7f0" },
  { label: "Sunset",  fg: "#c0392b", bg: "#fef5f4" },
  { label: "Violet",  fg: "#6c3483", bg: "#f5eef8" },
  { label: "Midnight",fg: "#1a1a2e", bg: "#e8e8f0" },
];

const TEMPLATES: { key: TemplateKey; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    key: "wifi",
    label: "WiFi",
    desc: "Share network credentials instantly",
    icon: <Wifi className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-400",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    desc: "Open a WhatsApp chat directly",
    icon: <MessageCircle className="w-6 h-6" />,
    color: "from-green-500 to-emerald-400",
  },
  {
    key: "instagram",
    label: "Instagram",
    desc: "Link straight to an Instagram profile",
    icon: <Instagram className="w-6 h-6" />,
    color: "from-pink-500 to-purple-500",
  },
];

// ─── Content builders ─────────────────────────────────────────────────────────
function buildWifi(ssid: string, pass: string, security: string): string {
  return `WIFI:T:${security};S:${ssid};P:${pass};;`;
}
function buildWhatsApp(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  const msg = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
  return `https://wa.me/${clean}${msg}`;
}
function buildInstagram(username: string): string {
  const clean = username.replace(/^@/, "");
  return `https://instagram.com/${clean}`;
}

// ─── Sub-forms ────────────────────────────────────────────────────────────────
function WifiForm({ onGenerate }: { onGenerate: (v: string) => void }) {
  const [ssid, setSsid] = useState("");
  const [pass, setPass] = useState("");
  const [security, setSecurity] = useState("WPA");
  const [showPass, setShowPass] = useState(false);
  const valid = ssid.trim().length > 0;
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Network Name (SSID)</label>
        <input value={ssid} onChange={e => setSsid(e.target.value)}
          placeholder="MyHomeNetwork"
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          data-testid="input-wifi-ssid" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
        <div className="relative">
          <input value={pass} onChange={e => setPass(e.target.value)}
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            data-testid="input-wifi-pass" />
          <button onClick={() => setShowPass(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security</label>
        <div className="flex gap-2">
          {["WPA", "WEP", "nopass"].map(s => (
            <button key={s} onClick={() => setSecurity(s)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                security === s ? "bg-primary text-primary-foreground border-primary" : "border-input text-muted-foreground hover:border-primary/40"
              }`}>
              {s === "nopass" ? "None" : s}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => valid && onGenerate(buildWifi(ssid, pass, security))}
        disabled={!valid}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
          valid ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20" : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
        }`} data-testid="button-generate-wifi">
        <Sparkles className="w-4 h-4" /> Generate WiFi QR
      </button>
    </div>
  );
}

function WhatsAppForm({ onGenerate }: { onGenerate: (v: string) => void }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const valid = phone.replace(/\D/g, "").length >= 7;
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
        <input value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="+1 234 567 8900"
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          data-testid="input-wa-phone" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pre-filled Message (optional)</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Hi! I'd like to connect with you…"
          rows={3}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          data-testid="input-wa-message" />
      </div>
      <button onClick={() => valid && onGenerate(buildWhatsApp(phone, message))}
        disabled={!valid}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
          valid ? "bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-500/20" : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
        }`} data-testid="button-generate-wa">
        <Sparkles className="w-4 h-4" /> Generate WhatsApp QR
      </button>
    </div>
  );
}

function InstagramForm({ onGenerate }: { onGenerate: (v: string) => void }) {
  const [username, setUsername] = useState("");
  const valid = username.replace(/^@/, "").trim().length > 0;
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Instagram Username</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">@</span>
          <input value={username} onChange={e => setUsername(e.target.value)}
            placeholder="username"
            className="w-full rounded-xl border border-input bg-background pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            data-testid="input-ig-username" />
        </div>
        {valid && (
          <p className="text-xs text-muted-foreground mt-1">
            → instagram.com/{username.replace(/^@/, "")}
          </p>
        )}
      </div>
      <button onClick={() => valid && onGenerate(buildInstagram(username))}
        disabled={!valid}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
          valid
            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 shadow-md shadow-pink-500/20"
            : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
        }`} data-testid="button-generate-ig">
        <Sparkles className="w-4 h-4" /> Generate Instagram QR
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Generate() {
  const [tab, setTab] = useState<Tab>("custom");
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey | null>(null);
  const [customText, setCustomText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [logo, setLogo] = useState<string | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleGenerate = (value: string) => {
    setGeneratedText(value);
    // Scroll to result
    setTimeout(() => document.getElementById("qr-result")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  };

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDownload = () => {
    const canvas = canvasWrapRef.current?.querySelector("canvas") as HTMLCanvasElement;
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
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold font-display text-foreground">Generate</h2>
          <p className="text-muted-foreground">Create custom QR codes with templates and styling.</p>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex rounded-2xl bg-secondary p-1 gap-1">
          {([["custom", PenLine, "Custom"], ["templates", Sparkles, "Templates"]] as const).map(([key, Icon, label]) => (
            <button key={key} onClick={() => setTab(key as Tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`} data-testid={`tab-${key}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* ── Custom tab ── */}
        {tab === "custom" && (
          <Card className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Content</label>
              <textarea value={customText} onChange={e => setCustomText(e.target.value)}
                placeholder="Enter a URL, text, phone number…" rows={4}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition"
                data-testid="input-qr-content" />
            </div>

            {/* Customization toggle */}
            <button onClick={() => setShowCustomize(p => !p)}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              <Palette className="w-4 h-4" />
              Customize style
              {showCustomize ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCustomize && <CustomizePanel fgColor={fgColor} setFgColor={setFgColor} bgColor={bgColor} setBgColor={setBgColor} logo={logo} setLogo={setLogo} logoInputRef={logoInputRef} handleLogoUpload={handleLogoUpload} />}

            <button onClick={() => customText.trim() && handleGenerate(customText.trim())}
              disabled={!customText.trim()}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                customText.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20" : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
              }`} data-testid="button-generate-qr">
              <Sparkles className="w-4 h-4" /> Generate QR Code
            </button>
          </Card>
        )}

        {/* ── Templates tab ── */}
        {tab === "templates" && (
          <div className="space-y-4">
            {/* Template picker cards */}
            <div className="grid grid-cols-3 gap-3">
              {TEMPLATES.map(t => (
                <button key={t.key} onClick={() => setActiveTemplate(activeTemplate === t.key ? null : t.key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all ${
                    activeTemplate === t.key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 bg-card"
                  }`} data-testid={`template-${t.key}`}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white shadow-md`}>
                    {t.icon}
                  </div>
                  <span className="text-xs font-bold text-foreground">{t.label}</span>
                </button>
              ))}
            </div>

            {/* ── Logo from gallery — always visible ── */}
            <Card className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Center Logo (optional)
              </p>
              {logo ? (
                <div className="flex items-center gap-4">
                  <img src={logo} alt="Logo" className="w-16 h-16 rounded-2xl object-contain border border-border bg-white p-1.5 shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Logo added</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Will appear in the center of your QR code</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/70 text-foreground text-xs font-medium transition-colors"
                      data-testid="button-change-logo">
                      <Upload className="w-3.5 h-3.5" /> Change
                    </button>
                    <button
                      onClick={() => { setLogo(null); if (logoInputRef.current) logoInputRef.current.value = ""; }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium transition-colors"
                      data-testid="button-remove-logo">
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  data-testid="button-upload-logo-gallery">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Add logo from gallery</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Pick an image from your phone — it appears in the center of the QR code</p>
                  </div>
                </button>
              )}
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                onChange={handleLogoUpload} data-testid="input-logo-file" />
            </Card>

            {/* Active template form */}
            {activeTemplate && (
              <Card className="p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">
                    {TEMPLATES.find(t => t.key === activeTemplate)?.label} QR Code
                  </h3>
                  <button onClick={() => setActiveTemplate(null)} className="p-1 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {activeTemplate === "wifi"      && <WifiForm onGenerate={handleGenerate} />}
                {activeTemplate === "whatsapp"  && <WhatsAppForm onGenerate={handleGenerate} />}
                {activeTemplate === "instagram" && <InstagramForm onGenerate={handleGenerate} />}

                {/* Customization toggle inside template */}
                <div className="border-t border-border/50 pt-4 space-y-3">
                  <button onClick={() => setShowCustomize(p => !p)}
                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    <Palette className="w-4 h-4" />
                    Customize colors
                    {showCustomize ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showCustomize && <CustomizePanel fgColor={fgColor} setFgColor={setFgColor} bgColor={bgColor} setBgColor={setBgColor} logo={logo} setLogo={setLogo} logoInputRef={logoInputRef} handleLogoUpload={handleLogoUpload} />}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── QR Result ── */}
        {generatedText && (
          <Card id="qr-result" className="p-6 flex flex-col items-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div ref={canvasWrapRef} className="rounded-2xl overflow-hidden shadow-xl border border-border/30 p-4"
              style={{ backgroundColor: bgColor }} data-testid="qr-preview">
              <QRCodeCanvas
                value={generatedText}
                size={240}
                fgColor={fgColor}
                bgColor={bgColor}
                level="H"
                includeMargin={false}
                imageSettings={logo ? {
                  src: logo,
                  height: 52,
                  width: 52,
                  excavate: true,
                } : undefined}
              />
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground break-all max-w-xs line-clamp-2">{generatedText}</p>
            </div>

            <button onClick={handleDownload}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
              data-testid="button-download-qr">
              <Download className="w-4 h-4" /> Download PNG
            </button>
          </Card>
        )}
      </div>
    </Layout>
  );
}

// ─── Customize Panel ──────────────────────────────────────────────────────────
function CustomizePanel({
  fgColor, setFgColor, bgColor, setBgColor,
  logo, setLogo, logoInputRef, handleLogoUpload
}: {
  fgColor: string; setFgColor: (c: string) => void;
  bgColor: string; setBgColor: (c: string) => void;
  logo: string | null; setLogo: (l: string | null) => void;
  logoInputRef: React.RefObject<HTMLInputElement>;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4 bg-secondary/40 rounded-2xl p-4">
      {/* Color presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color Theme</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => { setFgColor(p.fg); setBgColor(p.bg); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                fgColor === p.fg && bgColor === p.bg
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input bg-background text-muted-foreground hover:border-primary/50"
              }`}>
              <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: p.fg }} />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom colors */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
            className="w-9 h-9 rounded-lg border border-input cursor-pointer bg-transparent" data-testid="input-fg-color" />
          <span className="text-xs text-muted-foreground">Foreground</span>
        </div>
        <div className="flex items-center gap-2">
          <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
            className="w-9 h-9 rounded-lg border border-input cursor-pointer bg-transparent" data-testid="input-bg-color" />
          <span className="text-xs text-muted-foreground">Background</span>
        </div>
      </div>

      {/* Logo upload */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Center Logo (optional)</label>
        {logo ? (
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo preview" className="w-12 h-12 rounded-xl object-contain border border-border bg-white p-1" />
            <div className="flex-1">
              <p className="text-xs text-foreground font-medium">Logo uploaded</p>
              <p className="text-xs text-muted-foreground">Will appear in the center of the QR</p>
            </div>
            <button onClick={() => { setLogo(null); if (logoInputRef.current) logoInputRef.current.value = ""; }}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => logoInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary text-sm font-medium transition-all"
            data-testid="button-upload-logo">
            <Upload className="w-4 h-4" /> Upload Logo / Image
          </button>
        )}
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} data-testid="input-logo-file" />
      </div>
    </div>
  );
}
