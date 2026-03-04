import { Button, Card } from "@/components/ui-elements";
import { ScanLine } from "lucide-react";

{/* Unsplash abstract liquid gradient background */}
export default function AuthPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Background Image / Gradient Effect */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop"
          alt="Abstract background"
          className="w-full h-full object-cover opacity-20 dark:opacity-10 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/90 to-primary/10" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 fade-in duration-500">
        <Card className="p-8 sm:p-10 backdrop-blur-xl bg-card/80 border-white/20 dark:border-white/10 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <ScanLine className="w-10 h-10 text-white" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-foreground">
                Welcome to ScanFlow
              </h1>
              <p className="text-lg text-muted-foreground text-balance">
                The fastest way to scan, save, and manage your QR codes and barcodes securely.
              </p>
            </div>

            <div className="w-full pt-4">
              <Button 
                onClick={() => window.location.href = "/api/login"}
                size="lg"
                className="w-full font-bold text-lg"
              >
                Sign In to Continue
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
