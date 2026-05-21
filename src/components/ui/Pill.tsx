import { cn } from "@/lib/utils";

interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

export function Pill({ label, active, className, ...props }: PillProps) {
  return (
    <button
      className={cn(
        "px-6 py-2 rounded-full text-sm font-sans font-semibold transition-all duration-200 whitespace-nowrap",
        active
          ? "bg-brown-300 text-cafe-bg"
          : "bg-transparent border-[1.5px] border-cafe-border text-cafe-text-muted hover:border-cafe-border-light hover:text-cafe-text-secondary",
        className
      )}
      {...props}
    >
      {label}
    </button>
  );
}