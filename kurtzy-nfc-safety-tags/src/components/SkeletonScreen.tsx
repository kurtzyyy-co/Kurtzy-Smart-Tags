import React from "react";
import { Shield, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface SkeletonScreenProps {
  isAdmin?: boolean;
}

export default function SkeletonScreen({ isAdmin = false }: SkeletonScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <div className="flex flex-col gap-12">
        {/* Dynamic Header Banner Skeleton */}
        <div className="text-center max-w-2xl mx-auto space-y-4 animate-pulse">
          <div className="h-4 w-28 bg-slate-800/80 rounded-full mx-auto" />
          <div className="h-9 sm:h-10 w-72 sm:w-96 bg-slate-800 rounded-xl mx-auto" />
          <div className="space-y-2 max-w-md mx-auto">
            <div className="h-3 w-full bg-slate-900/70 rounded" />
            <div className="h-3 w-5/6 bg-slate-900/70 rounded mx-auto" />
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: INTERACTIVE TAG PREVIEW & SUMMARY (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 animate-pulse">
            
            {/* Visual 3D acrylic NFC Tag Container Skeleton */}
            <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[360px] shadow-sm">
              <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[10px] text-slate-700 uppercase tracking-widest font-mono">
                <RefreshCw className="w-3 h-3 animate-spin text-slate-800" />
                <span>Simulating Layout...</span>
              </div>

              {/* Central RFID/NFC Tag Structure Loading representation */}
              <div className="relative w-52 h-52 flex items-center justify-center">
                {/* Physical Tag Ring Backdrop Glow simulation */}
                <div className="absolute inset-2 rounded-full bg-slate-900/30 border border-slate-800/40 blur-sm" />

                {/* Outer Resin Acrylic Dial */}
                <div className="w-44 h-44 rounded-full border-4 border-slate-800/50 p-1.5 flex items-center justify-center bg-slate-950/20">
                  {/* Central Core */}
                  <div className="w-full h-full rounded-full border-2 border-slate-800/30 bg-slate-950/60 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
                    <div className="absolute w-12 h-12 rounded-full border border-dashed border-slate-800/30 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-md bg-slate-900" />
                    </div>

                    <div className="h-2.5 w-14 bg-slate-800/60 rounded mt-3" />
                    <div className="h-4 w-24 bg-slate-800 rounded mt-4" />
                    <div className="h-2 w-16 bg-slate-900 rounded mt-3" />

                    <div className="absolute bottom-2 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                      <div className="h-1.5 w-12 bg-slate-850 rounded" />
                    </div>
                  </div>
                </div>

                {/* Silicone strap / Loop illustration */}
                <div className="absolute top-[-30px] w-8 h-20 bg-slate-900/60 rounded-2xl border-2 border-slate-850 shadow-md -z-10 flex flex-col items-center justify-start py-2">
                  <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-800" />
                </div>
              </div>

              {/* Tag parameters skeleton */}
              <div className="w-full mt-6 border-t border-slate-850/60 pt-4 flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-2 w-16 bg-slate-900 rounded" />
                  <div className="h-3.5 w-10 bg-slate-800 rounded" />
                </div>
                <div className="space-y-1.5 text-right flex flex-col items-end">
                  <div className="h-2 w-16 bg-slate-900 rounded" />
                  <div className="h-3.5 w-12 bg-slate-800 rounded" />
                </div>
              </div>
            </div>

            {/* Quick Profile Summary Box Skeleton */}
            <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 shadow-sm text-left space-y-4">
              <div className="h-4 w-32 bg-slate-800 rounded" />
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-850/60">
                  <div className="h-3 w-20 bg-slate-900 rounded" />
                  <div className="h-4 w-24 bg-slate-800 rounded" />
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-850/60">
                  <div className="h-3 w-24 bg-slate-900 rounded" />
                  <div className="h-3 w-16 bg-slate-850 rounded font-mono" />
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <div className="h-3 w-16 bg-slate-900 rounded" />
                  <div className="h-3 w-24 bg-slate-850 rounded" />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: EMERGENCY CONTACTS & WORKSPACE / ADVERTISING (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left animate-pulse">
            
            {isAdmin ? (
              /* ADMIN CUSTOMIZER WORKSPACE SKELETON */
              <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 shadow-xl space-y-6">
                {/* Switcher & Creator workspace */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-2 w-full sm:w-auto">
                    <div className="h-2.5 w-32 bg-slate-900 rounded" />
                    <div className="h-4 w-44 bg-slate-800 rounded" />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto">
                    <div className="h-8 w-28 bg-slate-850 rounded-lg flex-1 sm:flex-initial" />
                    <div className="h-8 w-24 bg-slate-850 rounded-lg" />
                  </div>
                </div>

                {/* Shareable Link Helper */}
                <div className="p-4 bg-slate-950/20 border border-slate-850/60 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-36 bg-slate-850 rounded" />
                    <div className="h-2 w-16 bg-slate-900 rounded" />
                  </div>
                  <div className="h-8 w-full bg-slate-950 rounded-lg" />
                </div>

                {/* Form fields section */}
                <div className="space-y-4 border-t border-slate-850/60 pt-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-2.5 w-16 bg-slate-900 rounded" />
                      <div className="h-10 w-full bg-slate-950/50 rounded-xl border border-slate-850/40" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 w-20 bg-slate-900 rounded" />
                      <div className="h-10 w-full bg-slate-950/50 rounded-xl border border-slate-850/40" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="h-2.5 w-24 bg-slate-900 rounded" />
                      <div className="h-10 w-full bg-slate-950/50 rounded-xl border border-slate-850/40" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 w-16 bg-slate-900 rounded" />
                      <div className="h-10 w-full bg-slate-950/50 rounded-xl border border-slate-850/40" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 w-16 bg-slate-900 rounded" />
                      <div className="h-10 w-full bg-slate-950/50 rounded-xl border border-slate-850/40" />
                    </div>
                  </div>
                </div>

                {/* Contacts Customizer */}
                <div className="space-y-4 border-t border-slate-850/60 pt-5">
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 w-28 bg-slate-800 rounded" />
                    <div className="h-6 w-24 bg-slate-850 rounded" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-950/30 p-3 rounded-xl border border-slate-850/40">
                      <div className="h-8 w-full sm:w-1/4 bg-slate-900 rounded-lg" />
                      <div className="h-8 w-full sm:w-2/5 bg-slate-900 rounded-lg" />
                      <div className="h-8 w-full sm:w-1/3 bg-slate-900 rounded-lg" />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-950/30 p-3 rounded-xl border border-slate-850/40">
                      <div className="h-8 w-full sm:w-1/4 bg-slate-900 rounded-lg" />
                      <div className="h-8 w-full sm:w-2/5 bg-slate-900 rounded-lg" />
                      <div className="h-8 w-full sm:w-1/3 bg-slate-900 rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* Save Bar */}
                <div className="border-t border-slate-850/60 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="h-3 w-32 bg-slate-900 rounded" />
                  <div className="h-10 w-44 bg-slate-800 rounded-xl" />
                </div>
              </div>
            ) : (
              /* OBSERVER PORTAL HUB SKELETON */
              <div className="space-y-8">
                
                {/* Emergency Deck card */}
                <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 shadow-xl space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-850/60 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-800" />
                      <div className="h-3.5 w-36 bg-slate-800 rounded" />
                    </div>
                    <div className="h-2.5 w-24 bg-slate-900 rounded" />
                  </div>

                  {/* Pledge Box */}
                  <div className="bg-slate-950/40 p-4 rounded-xl space-y-2 border border-slate-850/40">
                    <div className="h-2.5 w-28 bg-slate-850 rounded" />
                    <div className="space-y-1.5">
                      <div className="h-2 w-full bg-slate-900" />
                      <div className="h-2 w-5/6 bg-slate-900" />
                    </div>
                  </div>

                  {/* Verified Contacts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850/40 flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-3.5 w-12 bg-slate-900 rounded" />
                        <div className="h-4 w-28 bg-slate-800 rounded" />
                        <div className="h-2 w-20 bg-slate-900 rounded" />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-900" />
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850/40 flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-3.5 w-12 bg-slate-900 rounded" />
                        <div className="h-4 w-24 bg-slate-800 rounded" />
                        <div className="h-2 w-20 bg-slate-900 rounded" />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Marketing & Ordering Card */}
                <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-slate-800/50 rounded-2xl p-8 space-y-6 relative overflow-hidden">
                  <div className="h-3 w-28 bg-slate-850 rounded" />
                  
                  <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-slate-800 rounded" />
                    <div className="h-4 w-1/2 bg-slate-900 rounded" />
                  </div>

                  {/* Channels */}
                  <div className="border-l-2 border-slate-800/80 pl-6 space-y-4 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="h-3 w-28 bg-slate-900" />
                      <div className="h-5 w-36 bg-slate-850 rounded-lg" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="h-3 w-32 bg-slate-900" />
                      <div className="h-5 w-32 bg-slate-850 rounded-lg" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="h-3 w-28 bg-slate-900" />
                      <div className="h-5 w-24 bg-slate-850 rounded-lg" />
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="border-t border-slate-850/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="h-3.5 w-52 bg-slate-900" />
                    <div className="h-10 w-full sm:w-44 bg-slate-800 rounded-xl" />
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  );
}
