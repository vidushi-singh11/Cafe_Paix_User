"use client";

import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { X, Plus, Minus, Check } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import type { MenuItemWithDetails } from "@/lib/database.types";
import { useStore } from "@/store/useStore";
import type { DisplayMenuItem } from "@/app/menu/page";
import { GlassButton } from "./ui/GlassButton";

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DisplayMenuItem | null;
  fullMenuItem?: MenuItemWithDetails | null;
}

export function CustomizationModal({ isOpen, onClose, item, fullMenuItem }: CustomizationModalProps) {
  const { addItem } = useStore();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { label: string; priceAdj: number; valId: string }>>({});
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  
  const controls = useAnimation();

  useEffect(() => {
    if (isOpen && fullMenuItem) {
      setQuantity(1);
      setSelectedAddons(new Set());
      
      const defaults: Record<string, { label: string; priceAdj: number; valId: string }> = {};
      fullMenuItem.menu_item_options?.forEach(opt => {
        if (opt.is_required && opt.option_values.length > 0) {
          const defVal = opt.option_values.find(v => v.is_default) || opt.option_values[0];
          defaults[opt.id] = { label: defVal.label, priceAdj: defVal.price_adjustment, valId: defVal.id };
        }
      });
      setSelectedOptions(defaults);
    }
  }, [isOpen, fullMenuItem]);

  const basePrice = fullMenuItem ? fullMenuItem.base_price : item?.price || 0;
  
  const unitPrice = useMemo(() => {
    const optSum = Object.values(selectedOptions).reduce((sum, val) => sum + val.priceAdj, 0);
    const addonSum = fullMenuItem?.menu_item_addons
      ?.filter(a => selectedAddons.has(a.id))
      .reduce((sum, a) => sum + a.price, 0) || 0;
    return basePrice + optSum + addonSum;
  }, [basePrice, selectedOptions, selectedAddons, fullMenuItem]);

  if (!item) return null;

  const handleAdd = () => {
    if (fullMenuItem) {
      const missingRequired = fullMenuItem.menu_item_options.find(
        opt => opt.is_required && !selectedOptions[opt.id]
      );
      if (missingRequired) {
        controls.start({
          x: [-10, 10, -10, 10, 0],
          transition: { duration: 0.4 }
        });
        return;
      }

      const optionsForCart = Object.entries(selectedOptions).map(([optId, val]) => {
        const opt = fullMenuItem.menu_item_options.find(o => o.id === optId)!;
        return {
          optionName: opt.name,
          valueName: val.label,
          priceAdjustment: val.priceAdj
        };
      });

      const addonsForCart = fullMenuItem.menu_item_addons
        .filter(a => selectedAddons.has(a.id))
        .map(a => ({
          addonName: a.name,
          price: a.price
        }));

      const optKey = optionsForCart.map(o => `${o.optionName}:${o.valueName}`).join('|');
      const addonKey = addonsForCart.map(a => a.addonName).join('|');
      const uniqueId = `${fullMenuItem.id}-${optKey}-${addonKey}`;

      addItem({
        cartItemId: uniqueId,
        itemId: fullMenuItem.id,
        name: fullMenuItem.name,
        basePrice: fullMenuItem.base_price,
        quantity,
        options: optionsForCart,
        addons: addonsForCart,
        unitPrice,
        totalPrice: unitPrice * quantity,
        image: fullMenuItem.image_url || item.image
      });
    }
    
    onClose();
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev);
      if (next.has(addonId)) next.delete(addonId);
      else next.add(addonId);
      return next;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#0D0B0A]/85 backdrop-blur-[16px]"
          />
          <motion.div
            initial={{ x: "-50%", y: "-30%", opacity: 0, scale: 0.95 }}
            animate={{ x: "-50%", y: "-50%", opacity: 1, scale: 1 }}
            exit={{ x: "-50%", y: "-30%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-32px)] md:max-w-lg md:max-h-[85vh] max-h-[90vh] flex flex-col shadow-2xl bg-cafe-bg-dark rounded-[20px]"
          >
            {/* Header Sticky */}
            <div className="flex justify-between items-start p-6 pb-2 shrink-0">
              <div className="pr-4">
                <h2 className="text-[28px] font-serif text-cafe-text leading-tight">
                  {item.name}
                </h2>
                <p className="text-[14px] mt-1 text-cafe-text-muted font-sans">{item.description}</p>
              </div>
              <button onClick={onClose} className="p-2 bg-cafe-bg-mid hover:bg-cafe-bg-light transition-colors rounded-full shrink-0">
                <X className="w-5 h-5 text-cafe-text" />
              </button>
            </div>

            {/* Scrollable Content */}
            <motion.div animate={controls} className="overflow-y-auto px-6 py-4 space-y-8 flex-1 no-scrollbar">
              {fullMenuItem?.menu_item_options?.map((opt) => (
                <div key={opt.id} className="space-y-3">
                  <h3 className="text-[14px] uppercase font-bold text-cafe-text-secondary tracking-[0.1em] font-sans">
                    {opt.name} {opt.is_required && <span className="text-cafe-danger">*</span>}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {opt.option_values.map(val => {
                      const isSelected = selectedOptions[opt.id]?.valId === val.id;
                      const priceText = val.price_adjustment > 0 ? `+$${val.price_adjustment.toFixed(2)}` : val.price_adjustment < 0 ? `-$${Math.abs(val.price_adjustment).toFixed(2)}` : '';
                      return (
                        <button
                          key={val.id}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.id]: { label: val.label, priceAdj: val.price_adjustment, valId: val.id } }))}
                          className={`px-6 py-2 rounded-full text-[14px] font-sans transition-all duration-200 ${
                            isSelected 
                              ? 'bg-brown-300 text-cafe-bg' 
                              : 'bg-transparent border-[1.5px] border-cafe-border text-cafe-text-muted hover:border-cafe-border-light hover:text-cafe-text-secondary'
                          }`}
                        >
                          {val.label} {priceText && <span className="opacity-80 text-[12px] ml-1">{priceText}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {fullMenuItem?.menu_item_addons && fullMenuItem.menu_item_addons.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[14px] uppercase font-bold text-cafe-text-secondary tracking-[0.1em] font-sans">
                    Add-ons
                  </h3>
                  <div className="space-y-0">
                    {fullMenuItem.menu_item_addons.map((addon, index) => {
                      const isSelected = selectedAddons.has(addon.id);
                      return (
                        <div key={addon.id} className={`flex items-center justify-between py-4 cursor-pointer hover:bg-cafe-bg-light/30 transition-colors ${index !== fullMenuItem.menu_item_addons.length - 1 ? 'border-b border-cafe-border' : ''}`} onClick={() => toggleAddon(addon.id)}>
                          <span className="text-[16px] text-cafe-text-secondary font-sans">{addon.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[16px] font-semibold text-brown-600 font-sans">+${addon.price.toFixed(2)}</span>
                            <div 
                              className="w-6 h-6 flex items-center justify-center rounded-[6px] transition-all duration-150"
                              style={{
                                backgroundColor: isSelected ? 'var(--brown-300)' : 'transparent',
                                border: isSelected ? 'none' : '1.5px solid var(--border)',
                              }}
                            >
                              {isSelected && <Check className="w-4 h-4 text-cafe-bg" strokeWidth={3} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Footer Sticky */}
            <div className="p-6 shrink-0 border-t border-cafe-border bg-cafe-bg-dark rounded-b-[20px]">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-between bg-cafe-bg-mid px-2 rounded-full h-[56px] w-[140px] border border-cafe-border">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-cafe-bg-light transition-colors"
                  >
                    <Minus className="w-5 h-5 text-cafe-text" />
                  </button>
                  <span className="font-bold text-cafe-text text-[18px] font-sans">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-cafe-bg-light transition-colors"
                  >
                    <Plus className="w-5 h-5 text-cafe-text" />
                  </button>
                </div>
                <div className="flex-1">
                  <GlassButton variant="primary" className="w-full" onClick={handleAdd}>
                    Add to Cart — ${(unitPrice * quantity).toFixed(2)}
                  </GlassButton>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}