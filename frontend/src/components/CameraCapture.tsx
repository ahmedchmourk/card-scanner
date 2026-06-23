"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, Image as ImageIcon, Check, X, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CameraCapture() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [processingCounter, setProcessingCounter] = useState(1);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Mount check and Initial Splash Screen (3000ms fadeout)
  useEffect(() => {
    setHasMounted(true);
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Faked Progress Counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing && files.length > 0) {
      interval = setInterval(() => {
        setProcessingCounter((prev) => (prev < files.length ? prev + 1 : prev));
      }, 1500); 
    }
    return () => clearInterval(interval);
  }, [isProcessing, files.length]);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
      const newImageUrls = selectedFiles.map((f) => URL.createObjectURL(f));
      setImages((prev) => [...prev, ...newImageUrls]);
      setError(null);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const clearAll = () => {
    setFiles([]);
    setImages([]);
    setError(null);
    setProcessingCounter(1);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const processBatch = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProcessingCounter(1);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://gitex-ocr-backend-764253561754.europe-west1.run.app/process-card/";
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = "Batch processing failed";
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "octicode_contacts.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      clearAll();
      alert(`Successfully processed ${files.length} cards and synced Excel file.`);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred while communicating with the engine.";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!hasMounted) return null;

  // Preloader Splash Component (Octicode Style)
  if (isAppLoading) {
    return (
      <motion.div
        key="app-preloader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC]"
      >
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="flex flex-col items-center justify-center"
        >
          {/* Very Large Centerpiece Logo */}
          <div className="bg-transparent border-none mb-12 flex items-center justify-center">
             <img 
               src="/logo.png" 
               alt="Logo" 
               className="w-64 h-auto object-contain drop-shadow-xl scale-110" 
               onError={(e) => { 
                   e.currentTarget.style.display = 'none'; 
                   e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scan-face text-[#021CC8] opacity-80"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>'; 
               }} 
             />
          </div>
          {/* Breathing Octicode Blue 3-Dots */}
          <div className="flex gap-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                className="w-4 h-4 bg-[#021CC8] rounded-full shadow-sm"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Hidden Multi-file inputs */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        ref={cameraInputRef}
        onChange={handleImageCapture}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        multiple
        ref={galleryInputRef}
        onChange={handleImageCapture}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {images.length === 0 ? (
          <motion.div
            key="upload-buttons"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col gap-4 mt-4"
          >
             <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => cameraInputRef.current?.click()}
                className="group relative flex items-center justify-center gap-3 w-full bg-[#021CC8] text-white p-5 rounded-2xl shadow-[0_8px_20px_rgba(2,28,200,0.25)] hover:shadow-[0_8px_25px_rgba(2,28,200,0.35)] border border-transparent transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Camera size={26} className="relative z-10" />
                <span className="text-xl font-semibold tracking-wide relative z-10">Scan Cards</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => galleryInputRef.current?.click()}
                className="group flex items-center justify-center gap-3 w-full bg-white text-[#021CC8] p-4 rounded-2xl border border-[#021CC8] shadow-sm hover:shadow-md hover:bg-slate-50 transition-all"
              >
                <ImageIcon size={22} className="text-[#021CC8]" />
                <span className="text-lg font-medium">Upload from Gallery</span>
              </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="preview-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center relative"
          >
            {/* Vertical Multi-Grid (2 columns) */}
            <div className="w-full grid grid-cols-2 gap-4 py-2 mb-6">
              {images.map((imgSrc, index) => (
                <div key={index} className="relative flex flex-col items-center w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-white">
                  <img src={imgSrc} alt={`Card ${index}`} className="w-full h-full object-cover" />
                  
                  {/* Laser Scan Animation overlay applies to each card independently when processing */}
                  {isProcessing && (
                    <>
                      <motion.div
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "linear", delay: index * 0.1 }}
                        className="absolute left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#021CC8] to-transparent shadow-[0_0_15px_rgba(2,28,200,1)] z-20"
                      />
                      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-10" />
                    </>
                  )}

                  {!isProcessing && (
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-500 hover:text-red-500 hover:bg-white p-1.5 rounded-full shadow-sm border border-slate-100 transition z-20"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add More Button placed naturally in the grid flow */}
              {!isProcessing && (
                 <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-[#021CC8]/40 bg-[#021CC8]/5 hover:bg-[#021CC8]/10 hover:border-[#021CC8]/60 text-[#021CC8] transition-colors shadow-sm"
                 >
                    <Plus size={42} className="mb-2 opacity-80" />
                    <span className="font-semibold text-sm opacity-90">Add Card</span>
                 </motion.button>
              )}
            </div>

            {/* Dynamic Counter Display */}
            <AnimatePresence>
               {isProcessing && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full text-center mb-6 text-[#021CC8] font-bold tracking-wider text-sm flex items-center justify-center gap-3"
                 >
                    <Loader2 className="animate-spin" size={18} />
                    Processing Card {processingCounter} of {files.length}...
                 </motion.div>
               )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full p-4 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center shadow-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="w-full flex gap-3 pb-8">
                {!isProcessing && (
                   <motion.button
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={clearAll}
                     className="flex-1 p-4 rounded-2xl bg-white text-slate-600 font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-800 transition"
                   >
                     Clear All
                   </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                  whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                  onClick={processBatch}
                  disabled={isProcessing}
                  className={`flex-[2] relative flex items-center justify-center gap-3 p-4 rounded-2xl transition-all text-white text-lg font-semibold overflow-hidden shadow-md border border-transparent ${
                    isProcessing
                      ? "bg-[#021CC8]/50 cursor-not-allowed"
                      : "bg-[#021CC8] hover:bg-[#021CC8]/90 hover:shadow-lg"
                  }`}
                >
                  <Check size={22} className={isProcessing ? "opacity-50" : "text-white/90"} />
                  <span className={isProcessing ? "opacity-90 tracking-wide" : "tracking-wide"}>
                      {isProcessing ? "EXTRACTING..." : `Process ${files.length} Card${files.length > 1 ? "s" : ""}`}
                  </span>
                </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
