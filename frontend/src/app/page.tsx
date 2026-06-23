"use client";

import React, { useState, useEffect } from "react";
import CameraCapture from "@/components/CameraCapture";
import Link from "next/link";

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-[#F8FAFC] relative overflow-y-auto overflow-x-hidden text-slate-800 scroll-smooth font-sans">
      
      {/* Light decorative background blobs styled dynamically for Octicode */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[15%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#021CC8]/5 blur-[100px]" />
        <div className="absolute top-[60%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-[#021CC8]/5 blur-[120px]" />
      </div>

      <header className="z-10 pt-16 pb-6 text-center flex flex-col items-center w-full max-w-lg px-6">
        <div className="mb-6 bg-transparent border-none w-full flex justify-center">
          <img 
            src="/logo.png" 
            alt="Octicode Logo" 
            className="w-48 h-auto object-contain drop-shadow-sm scale-125" 
            onError={(e) => { 
                e.currentTarget.style.display = 'none'; 
                e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scan-text text-[#021CC8] opacity-80"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8h8"/><path d="M7 12h10"/><path d="M7 16h6"/></svg>'; 
            }} 
          />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
          Contact Scanner
        </h1>
        <p className="text-slate-500 text-sm font-medium px-4">
          Batch scan business cards and sync instantly to Excel.
        </p>
      </header>

      <div className="z-10 flex-1 flex flex-col justify-start items-center w-full px-4 sm:px-6 pb-4">
        <CameraCapture />
      </div>
      
      <footer className="z-10 w-full py-8 flex flex-col items-center gap-3 text-center text-xs text-slate-500 font-medium">
        <p>&copy; {new Date().getFullYear()} Octicode. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-[#021CC8] transition-colors underline-offset-4 hover:underline">Privacy Policy</Link>
          <Link href="#" className="hover:text-[#021CC8] transition-colors underline-offset-4 hover:underline">Terms of Service</Link>
        </div>
      </footer>
    </main>
  );
}
