"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Coffee, Zap, Package, QrCode, ArrowLeft, LoaderCircle as Loader2, Clock, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useOrderTracking } from "@/hooks/useOrderTracking";

const STEPS = [
  { id: "pending", label: "Order Received", icon: Zap, description: "Your order is in the queue." },
  { id: "preparing", label: "Brewing", icon: Coffee, description: "Our baristas are crafting your drink." },
  { id: "ready", label: "Ready for Pickup", icon: Package, description: "Your order is waiting at the counter." },
  { id: "completed", label: "Completed", icon: ThumbsUp, description: "Enjoy your coffee!" },
];

function StatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const { order, loading, error } = useOrderTracking(orderId);

  if (!orderId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-cafe-bg text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-[28px] font-serif text-cafe-text">No Order Found</h2>
          <p className="text-cafe-text-muted text-[14px] font-sans">We couldn&apos;t find an order ID in the link.</p>
          <Link href="/menu" className="inline-block mt-4 bg-brown-300 text-cafe-bg px-6 py-3 rounded-full font-bold font-sans">
            Go to Menu
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cafe-bg">
        <Loader2 className="w-12 h-12 text-brown-500 animate-spin" />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-cafe-bg text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-[28px] font-serif text-cafe-text">Oops!</h2>
          <p className="text-cafe-text-muted text-[14px] font-sans">{error || "Could not load order details."}</p>
          <Link href="/menu" className="inline-block mt-4 bg-brown-300 text-cafe-bg px-6 py-3 rounded-full font-bold font-sans">
            Back to Menu
          </Link>
        </div>
      </main>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === order.status);
  const displayIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const isCompleted = order.status === 'completed';

  return (
    <main className="min-h-screen bg-cafe-bg text-cafe-text pb-20">
      <header className="p-4 flex items-center gap-4 max-w-lg mx-auto">
        <Link href="/menu" className="p-2 hover:bg-cafe-bg-mid rounded-full transition-colors text-cafe-text-secondary">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-serif text-[28px] text-cafe-text">Order Status</h1>
      </header>

      <div className="max-w-lg mx-auto px-6 mt-4 space-y-8">
        <div className="bg-cafe-bg-dark border border-cafe-border p-6 rounded-[20px] text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[24px] font-serif">Order #{order.order_number || order.id}</span>
            <span className={`px-3 py-1 rounded-full text-[12px] font-bold font-sans ${isCompleted ? 'bg-cafe-success/20 text-cafe-success' : 'bg-brown-100 text-cafe-warning'}`}>
              {order.status.toUpperCase()}
            </span>
          </div>

          {!isCompleted && (
            <div className="bg-cafe-bg-mid border border-cafe-border p-4 rounded-[16px] mt-4">
              <h3 className="text-brown-700 font-bold font-sans text-[16px] flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Ready in ~8 min
              </h3>
              <div className="h-2 bg-brown-100 rounded-full mt-3 overflow-hidden">
                <motion.div 
                  className="h-full bg-brown-300 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(displayIndex / (STEPS.length - 1)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-cafe-bg-dark border border-cafe-border p-6 rounded-[20px] relative">
          <div className="absolute left-[39px] top-[40px] bottom-[40px] w-0.5 bg-cafe-border" />
          
          <div className="space-y-8 relative">
            {STEPS.map((step, index) => {
              const isActive = index === displayIndex;
              const isPast = index < displayIndex;
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex gap-6 relative">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shrink-0 border-2 transition-colors duration-500
                      ${isPast ? 'bg-cafe-success border-cafe-success text-cafe-bg' : 
                        isActive ? 'bg-brown-300 border-brown-300 text-cafe-bg' : 
                        'bg-cafe-bg-dark border-cafe-border text-cafe-text-disabled'}`}
                  >
                    {isPast ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className={`pt-2 transition-opacity duration-500 ${isActive || isPast ? 'opacity-100' : 'opacity-40'}`}>
                    <h3 className={`font-semibold font-sans text-[16px] ${isActive ? 'text-cafe-text' : 'text-cafe-text-secondary'}`}>
                      {step.label}
                    </h3>
                    <p className="text-[14px] text-cafe-text-muted mt-1 font-sans">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {order.status === "ready" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cafe-bg-dark border border-cafe-border p-8 rounded-[20px] text-center space-y-4"
          >
            <div className="bg-white p-6 rounded-2xl inline-block shadow-lg mx-auto">
              <QrCode className="w-32 h-32 text-black" />
            </div>
            <p className="text-[14px] text-cafe-text-secondary font-sans font-medium">Show this at pickup</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cafe-bg">
        <Loader2 className="w-12 h-12 text-brown-500 animate-spin" />
      </div>
    }>
      <StatusContent />
    </Suspense>
  );
}
