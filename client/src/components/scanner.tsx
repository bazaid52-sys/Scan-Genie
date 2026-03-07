import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Flashlight, Image as ImageIcon, Camera, ScanLine, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "./ui-elements";

interface ScannerProps {
  onScan: (content: string, format: string) => void;
}

export function Scanner({ onScan }: ScannerProps) {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize scanner
    const html5QrCode = new Html5Qrcode("qr-reader", { verbose: false });
    setScanner(html5QrCode);

    return () => {
      // Cleanup on unmount
      if (html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
      } else {
        html5QrCode.clear();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!scanner) return;
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        // Find the best camera (usually "environment" for rear camera)
        await scanner.start(
          { facingMode: "environment" },
          { 
            fps: 15, // Increased FPS for smoother zoom updates
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0 
          },
          (decodedText, result) => {
            setTimeout(() => {
              onScan(decodedText, result?.result?.format?.formatName || 'QR_CODE');
              if (navigator.vibrate) navigator.vibrate([200]);
            }, 300);
          },
          () => {} 
        );
        setIsScanning(true);
        setHasCamera(true);

        // Wait a bit for the track to be fully initialized before getting capabilities
        setTimeout(async () => {
          try {
            const track = scanner.getRunningTrack();
            if (track) {
              const capabilities = track.getCapabilities() as any;
              console.log("Camera capabilities:", capabilities);
              if (capabilities.zoom) {
                setMinZoom(capabilities.zoom.min);
                setMaxZoom(capabilities.zoom.max);
                setZoomLevel(capabilities.zoom.min);
              } else {
                // Fallback or explicit "not supported" state
                console.log("Zoom not supported by this camera hardware/driver");
              }
            }
          } catch (e) {
            console.warn("Error getting zoom capabilities", e);
          }
        }, 1000);
      } else {
        setHasCamera(false);
      }
    } catch (err) {
      console.error("Failed to start camera", err);
      setHasCamera(false);
    }
  };

  const stopScanning = async () => {
    if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
      await scanner.stop();
      setIsScanning(false);
      setTorchOn(false);
    }
  };

  const toggleTorch = async () => {
    if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
      const newTorchState = !torchOn;
      try {
        await scanner.applyVideoConstraints({ advanced: [{ torch: newTorchState }] });
        setTorchOn(newTorchState);
      } catch (err) {
        console.warn("Torch not supported on this device", err);
      }
    }
  };

  const handleZoom = async (newZoom: number) => {
    if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
      const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
      try {
        await scanner.applyVideoConstraints({ advanced: [{ zoom: clampedZoom }] as any });
        setZoomLevel(clampedZoom);
      } catch (err) {
        console.warn("Zoom update failed", err);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && scanner) {
      try {
        if (isScanning) await stopScanning();
        const file = e.target.files[0];
        const result = await scanner.scanFileV2(file, true);
        onScan(result.decodedText, result.format?.formatName || 'QR_CODE');
      } catch (err) {
        alert("Could not detect a QR or Barcode in this image. Please try another.");
      }
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Start scanning automatically if camera is available
  useEffect(() => {
    if (scanner && !isScanning && hasCamera) {
      const timer = setTimeout(() => {
        startScanning();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [scanner, isScanning, hasCamera]);

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-[2.5rem] bg-black shadow-2xl shadow-primary/20 aspect-[3/4] flex flex-col justify-center items-center border-4 border-gray-900">
      
      {/* The actual video feed container */}
      <div id="qr-reader" className="w-full h-full object-cover z-0" />

      {/* Decorative overlay when scanning */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          
          {/* Target Box */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/10 rounded-2xl overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
            {/* Animated Laser Line */}
            <div className="w-full h-0.5 bg-primary shadow-[0_0_15px_3px_rgba(var(--primary))] animate-scan-line" />
            
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
          </div>
        </div>
      )}

      {/* Fallback state when camera fails */}
      {!isScanning && !hasCamera && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card p-6 text-center">
          <Camera className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold font-display text-foreground mb-2">Camera Unavailable</h3>
          <p className="text-muted-foreground mb-6 text-balance">
            We couldn't access your camera. Please check your browser permissions or use an image from your gallery instead.
          </p>
          <Button onClick={startScanning} variant="outline" className="w-full max-w-xs">
            Retry Camera
          </Button>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-4 px-6">
        {/* Zoom Controls */}
        {isScanning && (
          <div className="flex items-center gap-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleZoom(zoomLevel - 0.5)}
              className="h-8 w-8 text-white hover:bg-white/10"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-white text-xs font-medium w-8 text-center">
              {zoomLevel.toFixed(1)}x
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleZoom(zoomLevel + 0.5)}
              className="h-8 w-8 text-white hover:bg-white/10"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button 
            variant={torchOn ? "default" : "glass"} 
            size="icon" 
            onClick={toggleTorch}
            disabled={!isScanning}
            className="rounded-full w-14 h-14"
            aria-label="Toggle Flashlight"
          >
            <Flashlight className="w-6 h-6" />
          </Button>
          
          <div className="relative">
            <Button 
              variant="glass" 
              size="icon"
              className="rounded-full w-14 h-14 overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload Image"
            >
              <ImageIcon className="w-6 h-6" />
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
