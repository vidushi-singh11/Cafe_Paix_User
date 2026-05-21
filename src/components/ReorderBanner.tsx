"use client";

import { GlassPanel } from "./ui/GlassPanel";
import { GlassButton } from "./ui/GlassButton";
import { useStore } from "@/store/useStore";
import { Coffee, RotateCcw } from "lucide-react";

export function ReorderBanner() {
  const addItem = useStore((state) => state.addItem);

  const handleReorder = () => {
    addItem({
      cartItemId: "a0000001-0000-0000-0000-000000000001-usual-medium-oat",
      itemId: "a0000001-0000-0000-0000-000000000001",
      name: "Oat Latte",
      basePrice: 5.5,
      unitPrice: 5.5,
      totalPrice: 5.5,
      quantity: 1,
      options: [{ optionName: "Size", valueName: "Medium", priceAdjustment: 0 }, { optionName: "Milk", valueName: "Oat", priceAdjustment: 0 }],
      addons: [],
    });
  };

  return (
    <GlassPanel className="bg-cafe-bg-mid border-cafe-border flex flex-col md:flex-row items-center justify-between gap-4 py-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="bg-cafe-bg-dark p-3 rounded-[12px] border border-cafe-border">
          <Coffee className="w-6 h-6 text-brown-500" />
        </div>
        <div>
          <h3 className="font-sans text-[16px] font-semibold text-cafe-text">Ready for your usual?</h3>
          <p className="font-sans text-[14px] text-cafe-text-muted">Medium Oat Latte + Butter Croissant</p>
        </div>
      </div>
      <GlassButton variant="primary" className="flex items-center gap-2 h-[48px] px-6 text-[14px]" onClick={handleReorder}>
        <RotateCcw className="w-4 h-4" />
        One-Tap Reorder
      </GlassButton>
    </GlassPanel>
  );
}