import { Scanner } from '@yudiel/react-qr-scanner';
import { X, Camera, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface LiveScannerProps {
    onScan: (data: string) => void;
    onClose: () => void;
}

export default function LiveScanner({ onScan, onClose }: LiveScannerProps) {

    const handleScan = (result: any[]) => {
        if (result && result.length > 0) {
            // Optional: Play beep sound here if desired
            onScan(result[0].rawValue);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">

            {/* Header / Close Button */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2 text-white/80">
                    <Camera className="w-5 h-5 text-blue-400 animate-pulse" />
                    <span className="font-mono text-sm tracking-widest">LIVE FEED_ACTIVE</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Scanner Container */}
            <div className="relative w-full h-full max-w-lg max-h-lg aspect-square flex items-center justify-center">

                <Scanner
                    onScan={handleScan}
                    formats={['qr_code']}
                    components={{
                        finder: false // We are building a custom finder
                    }}
                    styles={{
                        container: { width: '100%', height: '100%' },
                        video: { width: '100%', height: '100%', objectFit: 'cover' }
                    }}
                />

                {/* Custom Sci-Fi HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Outer frame */}
                    <div className="w-[280px] h-[280px] border-2 border-blue-500/30 rounded-3xl relative">

                        {/* Corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>

                        {/* Scanning Beam Animation */}
                        <motion.div
                            initial={{ top: "10%" }}
                            animate={{ top: "90%" }}
                            transition={{
                                repeat: Infinity,
                                repeatType: "reverse",
                                duration: 2,
                                ease: "linear"
                            }}
                            className="absolute left-[5%] w-[90%] h-0.5 bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.8)]"
                        />

                        {/* Central Target Icon */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <Zap className="w-12 h-12 text-blue-500" />
                        </div>
                    </div>

                    {/* Status Text at Bottom */}
                    <div className="absolute bottom-20 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-blue-500/20">
                        <p className="text-blue-400 text-xs font-mono animate-pulse">SEARCHING FOR COMPATIBLE QR...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
