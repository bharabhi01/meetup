"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type React from "react"

interface TravelCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function TravelCard({ children, className, hover = true }: TravelCardProps) {
  return (
    <Card
      className={cn(
        "bg-white rounded-3xl border-0 card-shadow transition-all duration-300",
        hover && "hover:card-shadow-hover hover:-translate-y-1",
        className,
      )}
    >
      {children}
    </Card>
  )
}
