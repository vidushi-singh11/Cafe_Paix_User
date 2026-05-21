"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col justify-end p-6 bg-cafe-bg">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0D0B0A] via-[#0D0B0A]/80 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl w-full mx-auto pb-12">
        <div className="space-y-4 max-w-xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[40px] md:text-[48px] font-serif text-cafe-text leading-[1.1]"
          >
            Your coffee, <br />
            perfectly timed.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[16px] text-cafe-text-secondary font-sans leading-relaxed"
          >
            Artisanal brewing meets modern speed.
            Ready exactly when you are.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-8"
        >
          <Link href="/menu" className="w-full md:w-auto inline-block">
            <GlassButton className="w-full md:w-auto">
              Order Now
            </GlassButton>
          </Link>
        </motion.div>
      </div>

      {/* Ambient Info Pill */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute top-6 left-6 z-20"
      >
        <div className="bg-cafe-bg-dark border-[1.5px] border-cafe-border px-4 py-2 rounded-full flex items-center gap-2">
          <Clock className="w-4 h-4 text-brown-500" />
          <span className="text-[12px] font-sans text-cafe-text-muted">Open until 10 PM</span>
        </div>
      </motion.div>
    </main>
  );
}
