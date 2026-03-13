import { useTheme, COLOR_THEMES, type ColorTheme, type AppearanceMode } from "@/hooks/use-theme";
import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Sun, Moon, Monitor, Check, Palette, Info } from "lucide-react";

const APPEARANCE_OPTIONS: { key: AppearanceMode; label: string; icon: React.ReactNode }[] = [
  { key: "light",  label: "Light",  icon: <Sun className="w-5 h-5" />   },
  { key: "dark",   label: "Dark",   icon: <Moon className="w-5 h-5" />  },
  { key: "system", label: "System", icon: <Monitor className="w-5 h-5" /> },
];

export default function SettingsPage() {
  const { settings, setColorTheme, setAppearance } = useTheme();

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Customize your ScanFlow experience</p>
        </div>

        {/* Appearance */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h3>
          </div>
          <Card className="p-1 flex gap-1" data-testid="appearance-selector">
            {APPEARANCE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setAppearance(opt.key)}
                data-testid={`appearance-${opt.key}`}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl font-medium text-sm transition-all ${
                  settings.appearance === opt.key
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}>
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </Card>
        </section>

        {/* Color Theme */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Color Theme</h3>
          </div>
          <Card className="p-4" data-testid="color-theme-selector">
            <div className="grid grid-cols-3 gap-3">
              {COLOR_THEMES.map(theme => {
                const selected = settings.colorTheme === theme.key;
                const [h, s, l] = theme.primary.split(" ");
                const hsl = `hsl(${h}, ${s}, ${l})`;
                return (
                  <button
                    key={theme.key}
                    onClick={() => setColorTheme(theme.key as ColorTheme)}
                    data-testid={`theme-${theme.key}`}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 bg-card"
                    }`}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                      style={{ backgroundColor: hsl }}>
                      {selected && <Check className="w-5 h-5 text-white" />}
                    </div>
                    <span className="text-xs font-semibold text-foreground">{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </section>

        {/* About */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
          </div>
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">App name</span>
              <span className="text-sm font-semibold text-foreground">ScanFlow</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-semibold text-foreground">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sign-in required</span>
              <span className="text-sm font-semibold text-green-500">No</span>
            </div>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
