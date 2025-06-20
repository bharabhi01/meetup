"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type React from "react"

interface ModernCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export function ModernCard({ children, className, hover = true, glow = false }: ModernCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-lg",
        hover && "transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
        glow && "ring-1 ring-purple-500/20",
        className,
      )}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
      {children}
    </Card>
  )
}

interface GradientCardProps {
  children: React.ReactNode
  gradient?: "primary" | "secondary" | "accent"
  className?: string
}

export function GradientCard({ children, gradient = "primary", className }: GradientCardProps) {
  const gradients = {
    primary: "bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700",
    secondary: "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500",
    accent: "bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600",
  }

  return (
    <div className={cn("rounded-xl p-[1px]", gradients[gradient])}>
      <Card className={cn("bg-white/95 backdrop-blur-sm", className)}>{children}</Card>
    </div>
  )
}
