"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type React from "react"

interface ModernButtonProps {
  children: React.ReactNode
  variant?: "default" | "gradient" | "glass" | "outline"
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
}

export function ModernButton({
  children,
  variant = "default",
  size = "md",
  className,
  onClick,
  disabled,
  type = "button",
}: ModernButtonProps) {
  const variants = {
    default: "bg-white text-gray-900 hover:bg-gray-50 shadow-lg hover:shadow-xl",
    gradient:
      "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl",
    glass: "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30",
    outline: "border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white",
  }

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95",
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
