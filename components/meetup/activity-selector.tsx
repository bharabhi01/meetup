"use client"

import { useState } from "react"
import { CoralButton } from "@/components/ui/coral-button"
import { TravelCard } from "@/components/ui/travel-card"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ACTIVITY_CATEGORIES } from "@/lib/types"
import { Heart, Check, ArrowRight } from "lucide-react"

interface ActivitySelectorProps {
  onActivitiesSelected: (activities: string[]) => void
  selectedActivities?: string[]
}

export function ActivitySelector({ onActivitiesSelected, selectedActivities: initialSelectedActivities = [] }: ActivitySelectorProps) {
  const [selectedActivities, setSelectedActivities] = useState<string[]>(initialSelectedActivities)

  const toggleActivity = (activityId: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId],
    )
  }

  const handleContinue = () => {
    if (selectedActivities.length > 0) {
      onActivitiesSelected(selectedActivities)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <TravelCard>
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-coral rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">What's Your Vibe?</CardTitle>
          <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the activities and experiences you're both excited about. Choose as many as you like!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ACTIVITY_CATEGORIES.map((category) => {
              const isSelected = selectedActivities.includes(category.id)
              return (
                <div
                  key={category.id}
                  className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${isSelected ? "scale-105" : ""
                    }`}
                  onClick={() => toggleActivity(category.id)}
                >
                  <TravelCard
                    className={`h-full transition-all duration-300 ${isSelected ? "ring-2 ring-coral bg-coral/5 shadow-xl" : "hover:shadow-lg"
                      }`}
                    hover={false}
                  >
                    <CardContent className="p-8 text-center space-y-4">
                      <div className="text-5xl mb-4">{category.icon}</div>
                      <h3 className="font-bold text-lg text-gray-900">{category.label}</h3>
                      {isSelected && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-coral rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </CardContent>
                  </TravelCard>
                </div>
              )
            })}
          </div>

          {selectedActivities.length > 0 && (
            <div className="bg-coral/5 rounded-2xl p-8 space-y-4">
              <h4 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <Heart className="h-6 w-6 text-coral" />
                Selected Activities ({selectedActivities.length})
              </h4>
              <div className="flex flex-wrap gap-3">
                {selectedActivities.map((activityId) => {
                  const category = ACTIVITY_CATEGORIES.find((c) => c.id === activityId)
                  return (
                    <Badge
                      key={activityId}
                      className="bg-white text-gray-700 hover:bg-white px-6 py-3 text-base font-medium rounded-2xl border-2 border-gray-100 shadow-sm"
                    >
                      {category?.icon} {category?.label}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          <div className="pt-4">
            <CoralButton
              onClick={handleContinue}
              size="lg"
              className="w-full"
              disabled={selectedActivities.length === 0}
            >
              <div className="flex items-center gap-3">
                Find Perfect Spots ({selectedActivities.length} selected)
                <ArrowRight className="h-5 w-5" />
              </div>
            </CoralButton>
          </div>
        </CardContent>
      </TravelCard>
    </div>
  )
}
