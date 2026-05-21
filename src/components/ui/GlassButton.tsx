"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function GlassButton({
  variant = "primary",
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 }}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center font-sans font-semibold transition-colors duration-200 rounded-full",
        isPrimary
          ? "bg-brown-300 text-cafe-bg h-[56px] px-8 hover:bg-brown-400 active:bg-brown-200 disabled:bg-brown-100 disabled:text-cafe-text-disabled"
          : "bg-transparent border-[1.5px] border-cafe-border text-cafe-text-secondary h-[48px] px-6 hover:border-cafe-border-light hover:bg-cafe-border/30 disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
