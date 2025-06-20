"use client"

import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  steps: string[]
  currentStep: string
  className?: string
}

export function ProgressIndicator({ steps, currentStep, className }: ProgressIndicatorProps) {
  const currentIndex = steps.indexOf(currentStep)

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 relative",
                  index <= currentIndex
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-500",
                  index === currentIndex && "animate-pulse-glow",
                )}
              >
                {index < currentIndex ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium mt-2 capitalize transition-colors duration-300",
                  index <= currentIndex ? "text-purple-600" : "text-gray-400",
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-1 mx-4 rounded-full transition-all duration-500",
                  index < currentIndex ? "bg-gradient-to-r from-purple-600 to-blue-600" : "bg-gray-200",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
