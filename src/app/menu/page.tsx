"use client";

import { useState } from "react";
import { useMenu } from "@/hooks/useMenu";
import { Pill } from "@/components/ui/Pill";
import { GlassButton } from "@/components/ui/GlassButton";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { ShoppingCart, Plus, ArrowLeft, LoaderCircle as Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CustomizationModal } from "@/components/CustomizationModal";
import { ReorderBanner } from "@/components/ReorderBanner";
import { TrendingSection } from "@/components/TrendingSection";
import type { MenuItemWithDetails } from "@/lib/database.types";

export interface DisplayMenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  _full: MenuItemWithDetails | null;
}

export default function MenuPage() {
  const { data: supabaseMenu, isLoading, error, refetch } = useMenu();
  
  const menuData = supabaseMenu && supabaseMenu.length > 0 ? supabaseMenu : [];
  const categories = menuData.map((cat) => ({ id: cat.id, name: cat.name }));

  const [activeCategory, setActiveCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState<DisplayMenuItem | null>(null);
  const [selectedMenuItemFull, setSelectedMenuItemFull] = useState<MenuItemWithDetails | null>(null);
  const { cart, getTotals } = useStore();
  const { total } = getTotals();

  if (categories.length > 0 && !activeCategory) {
    setActiveCategory(categories[0].id);
  }

  const handleSelectItem = (item: DisplayMenuItem, fullItem?: MenuItemWithDetails | null) => {
    setSelectedItem(item);
    setSelectedMenuItemFull(fullItem || null);
  };

  const allSections = menuData.map((cat) => ({
    id: cat.id,
    name: cat.name,
    items: (cat.menu_items || []).map((mi) => ({
      id: mi.id,
      name: mi.name,
      price: mi.base_price,
      description: mi.description || "",
      image: mi.image_url || "",
      _full: mi,
    })),
  }));
  const trendingItems = allSections.flatMap((section) => section.items).slice(0, 3);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-cafe-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-brown-500 animate-spin" />
          <p className="text-cafe-text-muted font-sans text-[16px]">Brewing your menu...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-cafe-bg flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-[28px] font-serif text-cafe-text">Something went wrong</h2>
          <p className="text-cafe-text-muted text-[14px]">We couldn&apos;t load the menu. Please check your connection and try again.</p>
          <GlassButton onClick={() => refetch()}>
            Retry
          </GlassButton>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cafe-bg pb-[100px]">
      <CustomizationModal
        isOpen={!!selectedItem}
        onClose={() => { setSelectedItem(null); setSelectedMenuItemFull(null); }}
        item={selectedItem}
        fullMenuItem={selectedMenuItemFull}
      />

      <div className="bg-cafe-bg-dark py-8 px-4 border-b border-cafe-border">
        <div className="max-w-7xl mx-auto space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-cafe-text-muted hover:text-cafe-text-secondary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[14px]">Back</span>
          </Link>
          <h1 className="font-serif text-[28px] text-cafe-text">Good Morning</h1>
          <p className="font-sans text-[14px] text-cafe-text-muted">What can we brew for you today?</p>
        </div>
      </div>

      <nav className="sticky top-0 z-20 bg-cafe-bg/90 backdrop-blur-[16px] py-4 overflow-x-auto no-scrollbar border-b border-cafe-border">
        <div className="max-w-7xl mx-auto px-4 flex gap-3">
          {categories.map((cat) => (
            <Pill
              key={cat.id}
              label={cat.name}
              active={activeCategory === cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                document.getElementById(cat.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          ))}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-12">
        <ReorderBanner />
        <TrendingSection items={trendingItems} onSelectItem={(item: DisplayMenuItem) => handleSelectItem(item)} />
        
        {allSections.map((cat) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-[100px]">
            <h2 className="font-serif text-[28px] mb-6 text-cafe-text">
              {cat.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-[12px]">
              {cat.items.map((item) => (
                <motion.div
                  key={item.id}
                  onClick={() => handleSelectItem(item, item._full)}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="group cursor-pointer bg-cafe-bg-dark border border-cafe-border hover:border-cafe-border-light rounded-[16px] overflow-hidden transition-colors duration-200"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-cafe-bg-mid" />
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <div>
                      <h3 className="font-sans text-[16px] font-semibold text-cafe-text">{item.name}</h3>
                      <p className="text-[14px] text-cafe-text-muted line-clamp-2 mt-1">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-sans text-[16px] font-semibold text-brown-600">${item.price.toFixed(2)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(item, item._full);
                        }}
                        className="w-[32px] h-[32px] flex items-center justify-center bg-brown-300 text-cafe-bg rounded-full hover:bg-brown-400 active:bg-brown-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-cafe-bg-mid border-t border-cafe-border p-4 pb-safe flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative bg-brown-300 w-12 h-12 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-cafe-bg" />
                <span className="absolute -top-1 -right-1 bg-cafe-bg-dark text-cafe-text text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-cafe-border">
                  {cart.length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] text-cafe-text-muted">Total</span>
                <span className="text-[20px] font-serif text-brown-700 font-semibold">${total.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout">
              <GlassButton className="h-[48px] px-8">
                View Cart
              </GlassButton>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
