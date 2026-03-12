import { Link, useLocation } from "wouter";
import { Scan, History, QrCode } from "lucide-react";
import { cn } from "./ui-elements";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Scan", icon: Scan },
    { href: "/generate", label: "Generate", icon: QrCode },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-border/50 sticky top-0 h-screen z-40">
        <div className="p-6">
          <h1 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            ScanFlow
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group",
                location === item.href 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", location === item.href ? "text-primary-foreground" : "text-muted-foreground")} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border/50">
          <div className="px-4 py-3 text-xs text-muted-foreground text-center">
            ScanFlow v1.0
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-0 relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden glass-panel sticky top-0 z-40 px-4 py-4 flex items-center justify-between border-b border-border/50">
          <h1 className="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            ScanFlow
          </h1>
        </header>
        
        <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-border/50 z-50 px-6 py-3 flex items-center justify-around pb-safe">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300",
              location === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300",
              location === item.href ? "bg-primary/10 scale-110" : ""
            )}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
