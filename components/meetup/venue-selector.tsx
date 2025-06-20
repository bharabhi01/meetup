"use client"

import { useState, useEffect } from "react"
import { CoralButton } from "@/components/ui/coral-button"
import { TravelCard } from "@/components/ui/travel-card"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Clock, Plus, Check, ArrowRight, X } from "lucide-react"
import { searchVenues, calculateDistance } from "@/lib/utils/location"
import type { Coordinates, Venue, Experience } from "@/lib/types"
import Image from "next/image"

interface VenueSelectorProps {
  midpoint: Coordinates
  user1Location: Coordinates
  user2Location: Coordinates
  activities: string[]
  onExperiencesSelected: (experiences: Experience[]) => void
  selectedExperiences: Experience[]
}

export function VenueSelector({
  midpoint,
  user1Location,
  user2Location,
  activities,
  onExperiencesSelected,
  selectedExperiences
}: VenueSelectorProps) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadVenues = async () => {
      setIsLoading(true)
      try {
        const foundVenues = await searchVenues(midpoint, activities, 10, user1Location, user2Location)
        setVenues(foundVenues)
      } catch (error) {
        console.error("Error loading venues:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVenues()
  }, [midpoint, activities])

  const addExperience = (venue: Venue) => {
    const newExperience: Experience = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      venue,
      selectedActivities: activities,
      order: selectedExperiences.length + 1,
      estimatedDuration: 120 // Default 2 hours
    }

    const updatedExperiences = [...selectedExperiences, newExperience]
    onExperiencesSelected(updatedExperiences)
  }

  const removeExperience = (experienceId: string) => {
    const updatedExperiences = selectedExperiences
      .filter(exp => exp.id !== experienceId)
      .map((exp, index) => ({ ...exp, order: index + 1 }))
    onExperiencesSelected(updatedExperiences)
  }

  const isVenueSelected = (venueId: string): boolean => {
    return selectedExperiences.some(exp => exp.venue.id === venueId)
  }

  const handleContinue = () => {
    if (selectedExperiences.length > 0) {
      // Already handled by the parent component
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <TravelCard>
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Finding perfect meeting spots with AI recommendations...</p>
          </CardContent>
        </TravelCard>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <TravelCard>
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-coral rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Choose Your Experiences</CardTitle>
          <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select multiple venues for your perfect meetup journey. You can pick as many as you like and arrange them in order!
          </CardDescription>
          <div className="bg-coral/10 border border-coral/20 rounded-xl p-4 mt-4 max-w-2xl mx-auto">
            <p className="text-sm text-coral font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-coral rounded-full animate-pulse"></span>
              AI-powered recommendations based on your locations and preferences
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-8">
          {/* Selected Experiences */}
          {selectedExperiences.length > 0 && (
            <div className="bg-coral/5 rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <Check className="h-6 w-6 text-coral" />
                Selected Experiences ({selectedExperiences.length})
              </h4>
              <div className="space-y-3">
                {selectedExperiences.map((experience, index) => (
                  <div
                    key={experience.id}
                    className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm"
                  >
                    <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{experience.venue.name}</h5>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {experience.venue.address}
                      </p>
                    </div>
                    <button
                      onClick={() => removeExperience(experience.id)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Venues */}
          <div className="space-y-6">
            <h4 className="font-bold text-xl text-gray-900">Available Venues</h4>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {venues.map((venue) => {
                const isSelected = isVenueSelected(venue.id)
                return (
                  <TravelCard
                    key={venue.id}
                    className={`h-full transition-all duration-300 ${isSelected ? "ring-2 ring-coral bg-coral/5 opacity-60" : "hover:shadow-lg cursor-pointer"
                      }`}
                    hover={!isSelected}
                  >
                    <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                      <Image
                        src={venue.image_url || "/placeholder.svg?height=200&width=300"}
                        alt={venue.name}
                        fill
                        className="object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-coral/20 flex items-center justify-center">
                          <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-gray-900">{venue.name}</h3>

                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{venue.address}</span>
                        </div>

                        {venue.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{venue.rating}</span>
                          </div>
                        )}

                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>
                              {venue.distanceFromUser1
                                ? `${venue.distanceFromUser1.toFixed(1)} km from you`
                                : `${Math.round(calculateDistance(user1Location, venue.coordinates))} km from you`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>
                              {venue.distanceFromUser2
                                ? `${venue.distanceFromUser2.toFixed(1)} km from friend`
                                : `${Math.round(calculateDistance(user2Location, venue.coordinates))} km from friend`
                              }
                            </span>
                          </div>
                          {venue.googleMapsLink && (
                            <div className="flex items-center gap-1 text-coral">
                              <MapPin className="h-3 w-3" />
                              <a
                                href={venue.googleMapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-coral hover:text-coral/80 transition-colors text-sm font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Open in Google Maps
                              </a>
                            </div>
                          )}
                        </div>

                        {venue.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{venue.description}</p>
                        )}

                        <Badge variant="secondary" className="capitalize">
                          {venue.type}
                        </Badge>
                      </div>

                      <div className="pt-2">
                        {isSelected ? (
                          <div className="flex items-center justify-center gap-2 text-coral font-medium">
                            <Check className="h-4 w-4" />
                            Added to your experience
                          </div>
                        ) : (
                          <CoralButton
                            onClick={() => addExperience(venue)}
                            size="sm"
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Experience
                          </CoralButton>
                        )}
                      </div>
                    </CardContent>
                  </TravelCard>
                )
              })}
            </div>

            {venues.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg font-medium mb-2">No venues found</p>
                <p className="text-gray-500">
                  No venues found for your selected activities. Try selecting different activities.
                </p>
              </div>
            )}
          </div>

          {/* Continue Button */}
          {selectedExperiences.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <CoralButton
                size="lg"
                className="w-full"
                onClick={handleContinue}
              >
                <div className="flex items-center gap-3">
                  Continue to Itinerary ({selectedExperiences.length} experience{selectedExperiences.length !== 1 ? 's' : ''})
                  <ArrowRight className="h-5 w-5" />
                </div>
              </CoralButton>
            </div>
          )}
        </CardContent>
      </TravelCard>
    </div>
  )
}
