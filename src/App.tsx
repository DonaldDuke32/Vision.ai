import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudUploadIcon as _CloudUploadIcon, 
  Settings01Icon as _Settings01Icon, 
  MagicWand01Icon as _MagicWand01Icon, 
  Download01Icon as _Download01Icon, 
  Tick01Icon as _Tick01Icon,
  RefreshIcon as _RefreshIcon,
  Eraser01Icon as _Eraser01Icon,
  ViewIcon as _ViewIcon
} from 'hugeicons-react';

const CloudUploadIcon = _CloudUploadIcon as any;
const Settings01Icon = _Settings01Icon as any;
const MagicWand01Icon = _MagicWand01Icon as any;
const Download01Icon = _Download01Icon as any;
const Tick01Icon = _Tick01Icon as any;
const RefreshIcon = _RefreshIcon as any;
const Eraser01Icon = _Eraser01Icon as any;
const ViewIcon = _ViewIcon as any;

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from './lib/utils';
import { processImageLocal } from './imageProcessor';

type AppState = 'IDLE' | 'OPTIONS' | 'PROCESSING' | 'RESULT';
type Resolution = '2K' | '3K' | '4K';

export default function App() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [filesToProcess, setFilesToProcess] = useState<File[]>([]);
  const [enhancedImages, setEnhancedImages] = useState<string[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  
  // Options state
  const [resolution, setResolution] = useState<Resolution>('4K');
  const [removeWatermark, setRemoveWatermark] = useState(true);
  const [enhanceDetails, setEnhanceDetails] = useState(true);
  
  // Processing state
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('INITAI...');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const urls = acceptedFiles.map(file => URL.createObjectURL(file));
      setFilesToProcess(acceptedFiles);
      setOriginalImages(urls);
      setAppState('OPTIONS');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 10
  } as any);

  const startProcessing = async () => {
    if (filesToProcess.length === 0) return;
    
    setAppState('PROCESSING');
    setProgress(0);
    setEnhancedImages([]);
    
    // Start interval to simulate progress up to 90%
    const steps = [
      { progress: 15, text: 'SYS_ANALYSIS_RUN...' },
      { progress: 40, text: removeWatermark ? 'OBFUSCATION_REMOVAL...' : 'ENHANCE_CONTRAST...' },
      { progress: 70, text: `UPSCALE_TARGET_${resolution}...` },
      { progress: 90, text: enhanceDetails ? 'DETAIL_RECONSTRUCTION...' : 'FINALIZE_OUTPUT...' },
    ];

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].progress);
        setProcessingStep(steps[currentStep].text);
        currentStep++;
      }
    }, 500); // Speed up progress for local processing

    try {
      const results = [];
      for (const file of filesToProcess) {
        setProcessingStep(`PROCESSING_FILE_${results.length + 1}_OF_${filesToProcess.length}`);
        const processedObjectUrl = await processImageLocal(file, {
          resolution,
          removeWatermark,
          enhanceDetails
        });
        results.push(processedObjectUrl);
      }

      clearInterval(progressInterval);
      setProgress(100);
      setProcessingStep('OP_COMPLETE');
      
      setIsDemoMode(false);
      setEnhancedImages(results);
      
      setTimeout(() => setAppState('RESULT'), 800);
    } catch (error) {
      clearInterval(progressInterval);
      console.error(error);
      alert("Error during local processing.");
      setAppState('OPTIONS');
    }
  };

  const resetAll = () => {
    setAppState('IDLE');
    setOriginalImages([]);
    setFilesToProcess([]);
    setEnhancedImages([]);
    setCurrentFileIndex(0);
    setIsDemoMode(false);
    setProgress(0);
  };

  const downloadEnhancedImages = async () => {
    if (enhancedImages.length === 0) return;
    
    if (enhancedImages.length === 1) {
      const a = document.createElement('a');
      a.href = enhancedImages[0];
      const originalName = filesToProcess[0]?.name || 'image';
      a.download = `enhanced_${resolution}_${originalName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    try {
      const zip = new JSZip();
      
      const promises = enhancedImages.map(async (imgUrl, index) => {
         const originalName = filesToProcess[index]?.name || `image_${index}.png`;
         const fileName = `enhanced_${resolution}_${originalName.split('.')[0]}.png`;
         
         const response = await fetch(imgUrl);
         const blob = await response.blob();
         zip.file(fileName, blob);
      });
      
      await Promise.all(promises);
      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(zipContent, `vision_ai_batch_${resolution}.zip`);
    } catch (e) {
      console.error("Failed to generate zip", e);
      alert("Failed to download zip file.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 font-sans selection:bg-[#FF4500]/30 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] mix-blend-screen opacity-50" />
      
      {/* Top Bar - Minimal */}
      <header className="absolute top-0 w-full h-16 border-b border-white/10 flex items-center justify-between px-6 z-50 mix-blend-difference">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-[#FF4500] rounded-sm" />
          <span className="font-heading font-extrabold tracking-tighter text-xl uppercase">Vision.ai</span>
        </div>
        <div className="flex items-center gap-6 font-mono text-xs text-white/50">
          <span className="hidden md:inline-block">v4.0.0.9 // SYS_ACTIVE</span>
          <span className="text-[#FF4500] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4500] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4500]"></span>
            </span>
            ONLINE
          </span>
        </div>
      </header>

      <main className="min-h-screen flex items-center justify-center pt-16 px-4 md:px-8 relative z-10 w-full overflow-hidden">
        
        <AnimatePresence mode="wait">
          {appState === 'IDLE' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-center"
            >
              <div className="flex-1 space-y-6 lg:pr-12">
                <div className="space-y-4">
                  <div className="font-mono text-[#FF4500] text-sm uppercase tracking-widest">[ Protocol 04_ ]</div>
                  <h1 className="font-heading text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter">
                    Absolute<br/>Clarity.
                  </h1>
                </div>
                <p className="text-zinc-400 max-w-md leading-relaxed">
                  Industrial-grade watermark scrubbing & aggressive structural upscaling. Restores image fidelity up to 4K resolution using raw neural synthesis. 
                </p>
                
                <div className="flex gap-6 pt-4">
                   <div className="flex flex-col gap-2 border-l-2 border-[#FF4500] pl-4">
                      <span className="font-mono text-3xl font-light">4K</span>
                      <span className="text-xs text-zinc-500 font-mono uppercase">Max Resolution</span>
                   </div>
                   <div className="flex flex-col gap-2 border-l-2 border-white/20 pl-4">
                      <span className="font-mono text-3xl font-light">0.2s</span>
                      <span className="text-xs text-zinc-500 font-mono uppercase">Avg Latency</span>
                   </div>
                </div>
              </div>

              <div className="flex-1 w-full max-w-xl">
                 <div 
                  {...getRootProps()} 
                  className={cn(
                    "w-full aspect-[4/3] bg-zinc-900/40 backdrop-blur-md border border-white/10 hover:border-[#FF4500]/50 transition-all flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden",
                    isDragActive && "border-[#FF4500] bg-[#FF4500]/5"
                  )}
                >
                  <input {...getInputProps()} />
                  
                  {/* Scanner line effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF4500]/10 to-transparent top-[-100%] group-hover:animate-scan z-0 pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center text-center p-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-black/50 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-[#FF4500]/50 transition-all duration-300">
                      <CloudUploadIcon className="w-8 h-8 text-white group-hover:text-[#FF4500]" />
                    </div>
                    <div>
                      <div className="font-heading text-2xl font-bold uppercase tracking-tight mb-1">Engage Upload</div>
                      <div className="font-mono text-xs text-zinc-500">Drop asset here or initialize browser</div>
                    </div>
                  </div>

                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/30" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/30" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30" />
                </div>
              </div>
            </motion.div>
          )}

          {appState === 'OPTIONS' && (
            <motion.div 
              key="options"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_minmax(320px,400px)] gap-1 px-1 h-[calc(100vh-8rem)] pt-8"
            >
              {/* Left Panel: Preview */}
              <div className="bg-[#050505] border border-white/10 relative overflow-hidden flex items-center justify-center p-4">
                {/* Decorative brackets */}
                <div className="absolute top-4 left-4 font-mono text-[10px] text-white/30">[ PREVIEW_BUFFER : {filesToProcess.length} FILE(S) ]</div>
                
                {originalImages.length > 0 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img 
                      src={originalImages[currentFileIndex]} 
                      alt="Original Upload" 
                      className="max-w-full max-h-full object-contain filter grayscale border border-white/5 mx-auto" 
                    />
                    {originalImages.length > 1 && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                        <button 
                          onClick={() => setCurrentFileIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentFileIndex === 0}
                          className="px-3 py-1 bg-black/80 border border-white/20 text-white disabled:opacity-50 font-mono text-xs"
                        >
                          &lt; PREV
                        </button>
                        <span className="px-3 py-1 bg-black/80 border border-white/20 text-white font-mono text-xs">
                          {currentFileIndex + 1} / {originalImages.length}
                        </span>
                        <button 
                          onClick={() => setCurrentFileIndex(prev => Math.min(originalImages.length - 1, prev + 1))}
                          disabled={currentFileIndex === originalImages.length - 1}
                          className="px-3 py-1 bg-black/80 border border-white/20 text-white disabled:opacity-50 font-mono text-xs"
                        >
                          NEXT &gt;
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 m-8" />
              </div>

              {/* Right Panel: Controls */}
              <div className="bg-[#0A0A0A] border border-white/10 flex flex-col shrink-0">
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                   <span className="font-mono text-xs uppercase text-zinc-500">Parameters</span>
                   <button onClick={resetAll} className="text-white/50 hover:text-white transition-colors">
                     <RefreshIcon className="w-4 h-4" />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-12">
                  
                  {/* Res Selection */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold uppercase tracking-widest text-sm">Target Matrix</span>
                      <span className="font-mono text-xs text-[#FF4500]">{resolution}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                       {(['2K', '3K', '4K'] as Resolution[]).map((res) => (
                          <button
                            key={res}
                            onClick={() => setResolution(res)}
                            className={cn(
                              "py-4 border text-sm font-mono transition-all duration-200 relative overflow-hidden",
                              resolution === res 
                                ? "border-[#FF4500] bg-[#FF4500]/10 text-white" 
                                : "border-white/10 bg-transparent text-white/40 hover:border-white/30"
                            )}
                          >
                            {resolution === res && (
                              <motion.div 
                                layoutId="activeRes"
                                className="absolute bottom-0 left-0 h-1 w-full bg-[#FF4500]"
                              />
                            )}
                            {res}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/10" />

                  {/* Modules */}
                  <div className="space-y-6">
                     <span className="font-heading font-bold uppercase tracking-widest text-sm">Active Modules</span>
                     
                     <div 
                        className="group cursor-pointer"
                        onClick={() => setRemoveWatermark(!removeWatermark)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className={cn(
                              "w-10 h-10 flex items-center justify-center border transition-colors",
                              removeWatermark ? "border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500]" : "border-white/10 text-white/30"
                            )}>
                              <Eraser01Icon className="w-5 h-5" />
                            </div>
                            <div>
                               <div className={cn("font-mono text-sm uppercase", removeWatermark ? "text-white" : "text-white/40")}>DWM_Scrubbing</div>
                               <div className="font-mono text-[10px] text-white/30 mt-1">Deep Watermark Removal Auth</div>
                            </div>
                          </div>
                          <div className={cn("w-4 h-4 border mt-1", removeWatermark ? "bg-[#FF4500] border-[#FF4500]" : "border-white/20")} />
                        </div>
                     </div>

                     <div 
                        className="group cursor-pointer"
                        onClick={() => setEnhanceDetails(!enhanceDetails)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className={cn(
                              "w-10 h-10 flex items-center justify-center border transition-colors",
                              enhanceDetails ? "border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500]" : "border-white/10 text-white/30"
                            )}>
                              <MagicWand01Icon className="w-5 h-5" />
                            </div>
                            <div>
                               <div className={cn("font-mono text-sm uppercase", enhanceDetails ? "text-white" : "text-white/40")}>CTX_Enhancement</div>
                               <div className="font-mono text-[10px] text-white/30 mt-1">Micro-detail contrast boosting</div>
                            </div>
                          </div>
                          <div className={cn("w-4 h-4 border mt-1", enhanceDetails ? "bg-[#FF4500] border-[#FF4500]" : "border-white/20")} />
                        </div>
                     </div>
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-black/40">
                  <button 
                    onClick={startProcessing}
                    className="w-full h-14 bg-white text-black font-heading font-black uppercase tracking-widest hover:bg-[#FF4500] hover:text-white transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Execute Sequence</span>
                    <div className="absolute inset-0 bg-black/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {appState === 'PROCESSING' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl w-full mx-auto"
            >
              <div className="font-mono text-xs text-[#FF4500] uppercase tracking-widest mb-8 border border-[#FF4500]/30 px-3 py-1 bg-[#FF4500]/5">
                 [ Processing Sequence Initiated ]
              </div>
              
              <div className="font-heading text-5xl md:text-7xl font-black text-white/20 tracking-tighter mb-12 tabular-nums">
                {progress.toString().padStart(3, '0')}<span className="text-2xl">%</span>
              </div>
              
              <div className="w-full space-y-4">
                <div className="flex justify-between font-mono text-xs uppercase">
                  <span className="text-white/60">{processingStep}</span>
                  <span className="text-white/40">MEM: {(progress * 0.42).toFixed(1)}GB</span>
                </div>
                
                <div className="h-1 w-full bg-white/5 border border-white/10 overflow-hidden relative">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-[#FF4500]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                  {/* Scanline overlay on progress */}
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-20 animate-[progress-scan_1s_infinite_linear]" />
                </div>

                <div className="flex font-mono text-[10px] text-zinc-600 gap-4 mt-2">
                   <span>ID: 0x8F9A2C</span>
                   <span>TGT: {resolution}</span>
                </div>
              </div>
            </motion.div>
          )}

          {appState === 'RESULT' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className="w-full max-w-7xl flex flex-col space-y-6 pt-6"
            >
              {/* Header metrics */}
              <div className="flex items-end justify-between border-b border-white/10 pb-4">
                 <div>
                    <h2 className="font-heading text-3xl md:text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                      <Tick01Icon className="w-8 h-8 text-[#FF4500]" />
                      Output Compiled
                    </h2>
                 </div>
                 <div className="flex gap-3">
                   <button 
                      onClick={resetAll}
                      className="px-6 py-3 border border-white/20 font-mono text-xs uppercase hover:bg-white/5 transition-colors"
                    >
                      Restart
                    </button>
                    <button 
                      className="px-6 py-3 bg-white text-black font-heading font-bold uppercase tracking-widest hover:bg-[#FF4500] hover:text-white transition-colors flex items-center gap-2"
                      onClick={downloadEnhancedImages}
                    >
                      <Download01Icon className="w-4 h-4" />
                      {enhancedImages.length > 1 ? `Save All (${enhancedImages.length})` : 'Save Artifact'}
                    </button>
                 </div>
              </div>

              {/* Data / Viewer */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                 {/* Sidebar Stats */}
                 <div className="col-span-1 space-y-6">
                    <div className="p-4 border border-white/10 bg-black/40 space-y-4">
                       <span className="font-mono text-xs uppercase text-zinc-500 block mb-2">Metrics</span>
                       
                       <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                          <span className="font-mono text-xs text-white/50">Res</span>
                          <span className="font-mono text-sm text-white">{resolution} Upscale</span>
                       </div>
                       <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                          <span className="font-mono text-xs text-white/50">DWM</span>
                          <span className={cn("font-mono text-sm", isDemoMode ? "text-[#FFB347]" : "text-[#32CD32]")}>
                            {removeWatermark ? (isDemoMode ? "Simulated(No API)" : "Success") : "Bypassed"}
                          </span>
                       </div>
                       <div className="flex justify-between items-baseline">
                          <span className="font-mono text-xs text-white/50">Files</span>
                          <span className="font-mono text-sm text-white">{enhancedImages.length}</span>
                       </div>
                    </div>

                    <div className="p-4 border border-[#FF4500]/20 bg-[#FF4500]/5 text-[#FF4500] font-mono text-xs uppercase leading-relaxed">
                       {enhancedImages.length} subject(s) enhanced gracefully. Watermark artifact arrays destroyed. Contextual depth mapping applied.
                    </div>
                 </div>

                 {/* Viewer area */}
                 <div className="col-span-1 lg:col-span-3 border border-white/10 bg-[#050505] relative rounded-sm h-[60vh] min-h-[400px] flex group overflow-hidden">
                    <CompareSlider 
                      original={originalImages[currentFileIndex]} 
                      enhanced={enhancedImages[currentFileIndex]} 
                      demoMode={isDemoMode} 
                    />
                    
                    {enhancedImages.length > 1 && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
                        <button 
                          onClick={() => setCurrentFileIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentFileIndex === 0}
                          className="px-3 py-1 bg-black/80 border border-white/20 text-white disabled:opacity-50 font-mono text-xs"
                        >
                          &lt; PREV
                        </button>
                        <span className="px-3 py-1 bg-black/80 border border-white/20 text-white font-mono text-xs">
                          {currentFileIndex + 1} / {enhancedImages.length}
                        </span>
                        <button 
                          onClick={() => setCurrentFileIndex(prev => Math.min(enhancedImages.length - 1, prev + 1))}
                          disabled={currentFileIndex === enhancedImages.length - 1}
                          className="px-3 py-1 bg-black/80 border border-white/20 text-white disabled:opacity-50 font-mono text-xs"
                        >
                          NEXT &gt;
                        </button>
                      </div>
                    )}

                    {/* Corner marks */}
                    <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-white/50 pointer-events-none z-10" />
                    <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/50 pointer-events-none z-10" />
                    <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/50 pointer-events-none z-10" />
                    <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-white/50 pointer-events-none z-10" />
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: -100%; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        @keyframes progress-scan {
          0% { left: -100px; }
          100% { left: 100%; }
        }
      `}} />
    </div>
  );
}

// CompareSlider component - rugged industrial aesthetic
function CompareSlider({ original, enhanced, demoMode = false }: { original: string, enhanced: string, demoMode?: boolean }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback((event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return;
    
    let clientX;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
    } else {
      clientX = (event as React.MouseEvent).clientX;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    
    setSliderPosition(percent);
  }, []);

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    const handleMoveGlobal = (e: MouseEvent | TouchEvent) => {
      if (isDragging) handleMove(e);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMoveGlobal);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMoveGlobal, { passive: false });
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMoveGlobal);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMoveGlobal);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full select-none cursor-ew-resize touch-none"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* Before */}
      <div className="absolute inset-0 w-full h-full bg-zinc-900 overflow-hidden flex items-center justify-center">
         <img src={original} alt="Raw" className="w-full h-full object-contain filter grayscale border border-white/5" draggable={false} />
         <div className="absolute top-4 left-4 bg-black border border-white/10 px-2 py-1 font-mono text-[10px] text-white/50 pointer-events-none uppercase tracking-widest">
           RAW_INPUT []
         </div>
      </div>

      {/* After */}
      <div 
        className="absolute inset-0 z-10 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }} 
      >
         <div className="absolute inset-0 w-full h-full flex items-center justify-center p-0 m-0">
          <img 
            src={enhanced} 
            alt="Processed" 
            className={cn(
              "w-full h-full object-contain",
              demoMode && "brightness-110 contrast-125 saturate-150"
            )} 
            draggable={false} 
          />
         </div>
        
        <div className="absolute top-4 right-4 bg-[#FF4500] text-black px-2 py-1 font-heading text-[10px] font-bold pointer-events-none uppercase tracking-widest z-20 shadow-[0_0_20px_rgba(255,69,0,0.3)]">
           PROCESSED [AI]
         </div>
      </div>

      {/* Handle */}
      <div 
        className="absolute inset-y-0 z-20 w-px bg-[#FF4500] pointer-events-none flex items-center justify-center"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-6 h-12 bg-[#FF4500] flex flex-col items-center justify-center gap-1">
           <div className="w-0.5 h-1 bg-black" />
           <div className="w-0.5 h-1 bg-black" />
           <div className="w-0.5 h-1 bg-black" />
        </div>
      </div>
    </div>
  );
}
