"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type React from "react"

interface CoralButtonProps {
  children: React.ReactNode
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
  variant?: "default" | "outline"
}

export function CoralButton({
  children,
  size = "md",
  className,
  onClick,
  disabled,
  type = "button",
  variant = "default",
}: CoralButtonProps) {
  const variants = {
    default: "bg-coral hover:bg-coral/90 text-white shadow-lg",
    outline: "border-2 border-coral text-coral hover:bg-coral hover:text-white bg-white",
  }

  const sizes = {
    sm: "px-6 py-3 text-sm",
    md: "px-8 py-4 text-base",
    lg: "px-10 py-5 text-lg",
  }

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        className,
      )}
    >
      {children}
    </Button>
  )
}
