import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#8E1616] text-white hover:bg-[#751111] shadow-sm shadow-[#8E1616]/20",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline:
          "border border-[#EFE7DE] bg-white text-[#190F0E] hover:bg-[#FAF7F2] hover:border-gray-300",
        secondary:
          "bg-[#F3EBE1] text-[#190F0E] hover:bg-[#EAE0D4]",
        ghost:
          "hover:bg-[#EFE7DE]/50 text-[#190F0E]",
        link:
          "text-[#8E1616] underline-offset-4 hover:underline",
        crimson:
          "bg-[#8E1616] text-white hover:bg-[#751111] shadow-md",
        emerald:
          "bg-emerald-700 text-white hover:bg-emerald-800 shadow-md",
        amber:
          "bg-amber-600 text-white hover:bg-amber-700 shadow-md",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-11 px-6 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
