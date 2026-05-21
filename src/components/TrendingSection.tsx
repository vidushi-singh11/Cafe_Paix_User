"use client";

import { Zap } from "lucide-react";
import Image from "next/image";
import type { DisplayMenuItem } from "@/app/menu/page";
import { motion } from "framer-motion";

export function TrendingSection({
  items,
  onSelectItem,
}: {
  items: DisplayMenuItem[];
  onSelectItem: (item: DisplayMenuItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-2 px-2">
        <Zap className="w-5 h-5 text-brown-500 fill-brown-500" />
        <h2 className="font-serif text-[28px] text-cafe-text">Trending Now</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pt-4 pb-8 no-scrollbar -mx-4 px-4">
        {items.map((item) => (
          <motion.div
            key={item.id}
            onClick={() => onSelectItem(item)}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group flex-shrink-0 w-64 bg-cafe-bg-dark border border-cafe-border hover:border-cafe-border-light rounded-[16px] overflow-hidden cursor-pointer"
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
              <div className="absolute top-2 left-2 bg-brown-300 text-cafe-bg text-[12px] font-sans px-2 py-1 rounded-full font-bold">
                Trending
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-sans text-[16px] font-semibold text-cafe-text truncate">{item.name}</h3>
              <p className="text-[14px] text-cafe-text-secondary line-clamp-1 mt-1">{item.description}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="font-sans text-[16px] font-bold text-brown-600">${item.price.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
