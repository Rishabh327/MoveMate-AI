
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraScannerProps {
  isScanning: boolean;
  onFrameCapture: (base64: string) => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ isScanning, onFrameCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // High-quality constraints optimized for mobile scanning
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // Always use rear camera on Android
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Unable to access camera. Please ensure you have granted camera permissions in your browser settings.");
        console.error("Camera access error:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    // We capture at video resolution for better AI accuracy
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    // Using slightly higher quality for better object detection
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.85).split(',')[1];
    onFrameCapture(base64);
  }, [isScanning, onFrameCapture]);

  useEffect(() => {
    let interval: any;
    if (isScanning) {
      // 4-second interval balances responsiveness with API usage on mobile data
      interval = setInterval(captureFrame, 4000);
    }
    return () => clearInterval(interval);
  }, [isScanning, captureFrame]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center">
      {error ? (
        <div className="text-white p-8 text-center max-w-sm">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-camera-slash text-2xl text-rose-500"></i>
          </div>
          <h3 className="font-bold text-lg mb-2">Camera Blocked</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm"
          >
            Retry Permission
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Animated HUD overlay for that high-tech feel */}
              <div className="w-full h-[2px] bg-blue-500/60 absolute top-0 animate-[scan_3s_infinite] shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              
              {/* Corner brackets */}
              <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-white/40 rounded-tl-lg"></div>
              <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-white/40 rounded-tr-lg"></div>
              <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-white/40 rounded-bl-lg"></div>
              <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-white/40 rounded-br-lg"></div>
              
              <div className="absolute top-6 left-6 md:top-auto md:bottom-28 md:left-auto md:right-6 bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest animate-pulse flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                RECORDING
              </div>
            </div>
          )}
        </>
      )}
      
      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CameraScanner;
