"use client"

import { useState } from "react"
import { LocationInput } from "./location-input"
import { ActivitySelector } from "./activity-selector"
import { VenueSelector } from "./venue-selector"
import { ItineraryPlanner } from "./itinerary-planner"
import { FloatingElements } from "@/components/ui/floating-elements"
import { calculateMidpoint } from "@/lib/utils/location"
import type { Coordinates, Experience, ItineraryItem, User } from "@/lib/types"
import { PartyPopper, ArrowLeft, MapPin, Users, Heart, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

type FlowStep = "location" | "activities" | "venues" | "itinerary"

interface StepInfo {
  step: FlowStep
  title: string
  subtitle: string
  icon: React.ReactNode
  completed: boolean
}

export function MeetupFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("location")
  const [user1Data, setUser1Data] = useState<User | null>(null)
  const [user2Data, setUser2Data] = useState<User | null>(null)
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [selectedExperiences, setSelectedExperiences] = useState<Experience[]>([])
  const [midpoint, setMidpoint] = useState<Coordinates | null>(null)

  const handleLocationsSet = (user1: User, user2: User) => {
    setUser1Data(user1)
    setUser2Data(user2)
    setMidpoint(calculateMidpoint(user1.coordinates, user2.coordinates))
    setCurrentStep("activities")
  }

  const handleActivitiesSelected = (activities: string[]) => {
    setSelectedActivities(activities)
    setCurrentStep("venues")
  }

  const handleExperiencesSelected = (experiences: Experience[]) => {
    setSelectedExperiences(experiences)
    setCurrentStep("itinerary")
  }

  const handleItineraryComplete = (itinerary: ItineraryItem[]) => {
    console.log("Meetup complete:", {
      user1Data,
      user2Data,
      selectedActivities,
      selectedExperiences,
      itinerary,
    })
  }

  const handleStepNavigation = (step: FlowStep) => {
    // Only allow navigation to completed steps or the next step
    const stepOrder: FlowStep[] = ["location", "activities", "venues", "itinerary"]
    const currentIndex = stepOrder.indexOf(currentStep)
    const targetIndex = stepOrder.indexOf(step)

    if (targetIndex <= currentIndex || isStepCompleted(step)) {
      setCurrentStep(step)
    }
  }

  const isStepCompleted = (step: FlowStep): boolean => {
    switch (step) {
      case "location":
        return !!(user1Data && user2Data && midpoint)
      case "activities":
        return selectedActivities.length > 0
      case "venues":
        return selectedExperiences.length > 0
      case "itinerary":
        return false // Final step
      default:
        return false
    }
  }

  const getStepInfo = (): StepInfo[] => [
    {
      step: "location",
      title: "Set Locations",
      subtitle: "Names and starting points",
      icon: <MapPin className="h-5 w-5" />,
      completed: isStepCompleted("location")
    },
    {
      step: "activities",
      title: "Choose Activities",
      subtitle: "What you want to do",
      icon: <Heart className="h-5 w-5" />,
      completed: isStepCompleted("activities")
    },
    {
      step: "venues",
      title: "Select Experiences",
      subtitle: "Pick your favorite spots",
      icon: <Users className="h-5 w-5" />,
      completed: isStepCompleted("venues")
    },
    {
      step: "itinerary",
      title: "Final Itinerary",
      subtitle: "Complete plan with map",
      icon: <Calendar className="h-5 w-5" />,
      completed: false
    }
  ]

  const canGoBack = (): boolean => {
    return currentStep !== "location"
  }

  const goBack = () => {
    const stepOrder: FlowStep[] = ["location", "activities", "venues", "itinerary"]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const renderStepNavigation = () => {
    const steps = getStepInfo()
    const currentIndex = steps.findIndex(s => s.step === currentStep)

    return (
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {canGoBack() && (
              <Button
                variant="outline"
                size="sm"
                onClick={goBack}
                className="rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div className="text-sm text-gray-500">
              Step {currentIndex + 1} of {steps.length}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {steps.map((step, index) => (
              <button
                key={step.step}
                onClick={() => handleStepNavigation(step.step)}
                disabled={index > currentIndex && !step.completed}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${step.step === currentStep
                  ? 'bg-coral text-white shadow-sm'
                  : step.completed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                    : index <= currentIndex
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {step.icon}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case "location":
        return <LocationInput onLocationsSet={handleLocationsSet} />

      case "activities":
        return (
          <ActivitySelector
            onActivitiesSelected={handleActivitiesSelected}
            selectedActivities={selectedActivities}
          />
        )

      case "venues":
        if (!midpoint || !user1Data || !user2Data) return null
        return (
          <VenueSelector
            midpoint={midpoint}
            user1Location={user1Data.coordinates}
            user2Location={user2Data.coordinates}
            activities={selectedActivities}
            onExperiencesSelected={handleExperiencesSelected}
            selectedExperiences={selectedExperiences}
          />
        )

      case "itinerary":
        if (!user1Data || !user2Data || selectedExperiences.length === 0) return null
        return (
          <ItineraryPlanner
            user1={user1Data}
            user2={user2Data}
            experiences={selectedExperiences}
            midpoint={midpoint}
            onItineraryComplete={handleItineraryComplete}
          />
        )

      default:
        return null
    }
  }

  const getCurrentStepInfo = () => {
    const steps = getStepInfo()
    return steps.find(s => s.step === currentStep)
  }

  const stepInfo = getCurrentStepInfo()

  return (
    <div className="min-h-screen bg-pink-soft relative overflow-hidden">
      <FloatingElements />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Plan Your Perfect
            <br />
            <span className="text-coral">Meetup Experience</span>
          </h1>
          {stepInfo && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {stepInfo.subtitle}
            </p>
          )}
        </div>

        {/* Step Navigation */}
        {renderStepNavigation()}

        {/* Current Step Content */}
        {renderStep()}
      </div>
    </div>
  )
}
