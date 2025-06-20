"use client"

import { useState, useEffect } from "react"
import { CoralButton } from "@/components/ui/coral-button"
import { TravelCard } from "@/components/ui/travel-card"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Car, Calendar, Star, Users, PartyPopper, Navigation, Route } from "lucide-react"
import { MapLibreMap } from "@/components/ui/maplibre-map"
import { calculateDistance } from "@/lib/utils/location"
import type { Coordinates, Experience, ItineraryItem, User } from "@/lib/types"

interface ItineraryPlannerProps {
  user1: User
  user2: User
  experiences: Experience[]
  midpoint: Coordinates | null
  onItineraryComplete: (itinerary: ItineraryItem[]) => void
}

interface EnhancedMapProps {
  user1: User
  user2: User
  experiences: Experience[]
  selectedExperience?: Experience
}

function EnhancedItineraryMap({ user1, user2, experiences, selectedExperience }: EnhancedMapProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-lg text-gray-900">Interactive Route Map</h4>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Route className="h-4 w-4" />
          Your complete journey
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border-2 border-gray-200">
        <MapLibreMap
          user1={user1}
          user2={user2}
          experiences={experiences}
          selectedExperience={selectedExperience}
          showRoutes={true}
          height="500px"
          className="w-full"
        />
      </div>

      {/* Map Legend */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h5 className="font-medium text-gray-900 mb-3">Map Legend</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-coral rounded-full"></div>
            <span>{user1.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
            <span>{user2.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Meeting Points</span>
          </div>
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-blue-500" />
            <span>Suggested Routes</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ItineraryPlanner({
  user1,
  user2,
  experiences,
  midpoint,
  onItineraryComplete,
}: ItineraryPlannerProps) {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([])
  const [selectedExperience, setSelectedExperience] = useState<Experience | undefined>(experiences[0])
  const [showMap, setShowMap] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    generateItinerary()
  }, [experiences, user1, user2])

  const generateItinerary = () => {
    if (experiences.length === 0) return

    const items: ItineraryItem[] = []
    let currentTime = new Date()
    currentTime.setMinutes(currentTime.getMinutes() + 30) // Start in 30 minutes

    // Departure
    items.push({
      id: "departure",
      time: formatTime(currentTime),
      activity: "Departure",
      location: "Your locations",
      duration: 0,
      description: `${user1.name} and ${user2.name} start their journey`,
      coordinates: midpoint || experiences[0].venue.coordinates
    })

    // Process each experience
    experiences.forEach((experience, index) => {
      const travelTime = Math.max(
        calculateTravelTime(user1.coordinates, experience.venue.coordinates),
        calculateTravelTime(user2.coordinates, experience.venue.coordinates)
      )

      // Travel to venue
      if (index === 0) {
        currentTime = addMinutes(currentTime, travelTime)
        items.push({
          id: `travel-${index}`,
          time: formatTime(currentTime),
          activity: "Arrival",
          location: experience.venue.name,
          duration: 15,
          description: `Meet at ${experience.venue.name}`,
          coordinates: experience.venue.coordinates,
          venue: experience.venue
        })
      }

      // Main activity
      currentTime = addMinutes(currentTime, index === 0 ? 15 : 30) // Meeting time or transition time
      items.push({
        id: `experience-${index}`,
        time: formatTime(currentTime),
        activity: getActivityName(experience.venue.type),
        location: experience.venue.name,
        duration: experience.estimatedDuration,
        description: `Experience ${index + 1}: ${experience.venue.description || `Enjoy your time at ${experience.venue.name}`}`,
        coordinates: experience.venue.coordinates,
        venue: experience.venue
      })

      currentTime = addMinutes(currentTime, experience.estimatedDuration)

      // Add transition if not the last experience
      if (index < experiences.length - 1) {
        const nextVenue = experiences[index + 1].venue
        const transitionTime = calculateTravelTime(experience.venue.coordinates, nextVenue.coordinates)

        items.push({
          id: `transition-${index}`,
          time: formatTime(currentTime),
          activity: "Travel",
          location: `To ${nextVenue.name}`,
          duration: transitionTime,
          description: `Travel from ${experience.venue.name} to ${nextVenue.name}`,
          coordinates: nextVenue.coordinates
        })
      }
    })

    // Wrap up and departure
    items.push({
      id: "wrap-up",
      time: formatTime(currentTime),
      activity: "Wrap Up",
      location: experiences[experiences.length - 1].venue.name,
      duration: 15,
      description: "Say goodbye and prepare for departure",
      coordinates: experiences[experiences.length - 1].venue.coordinates
    })

    currentTime = addMinutes(currentTime, 15)
    const returnTime = Math.max(
      calculateTravelTime(experiences[experiences.length - 1].venue.coordinates, user1.coordinates),
      calculateTravelTime(experiences[experiences.length - 1].venue.coordinates, user2.coordinates)
    )

    items.push({
      id: "return",
      time: formatTime(currentTime),
      activity: "Return Journey",
      location: "Back to your locations",
      duration: returnTime,
      description: `Travel back home (Est. ${returnTime} minutes)`,
      coordinates: midpoint || user1.coordinates
    })

    setItinerary(items)
  }

  const calculateTravelTime = (from: Coordinates, to: Coordinates): number => {
    const distance = calculateDistance(from, to)
    return Math.ceil((distance / 50) * 60) // Assuming 50 km/h average speed
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const addMinutes = (date: Date, minutes: number) => {
    const newDate = new Date(date)
    newDate.setMinutes(newDate.getMinutes() + minutes)
    return newDate
  }

  const getActivityName = (venueType: string) => {
    const activityNames: Record<string, string> = {
      dining: "Dining Experience",
      entertainment: "Entertainment",
      outdoor: "Outdoor Activity",
      cultural: "Cultural Experience",
      shopping: "Shopping",
      nightlife: "Nightlife",
      sports: "Sports Activity",
      wellness: "Wellness Activity",
    }
    return activityNames[venueType] || "Experience"
  }

  const handleConfirm = () => {
    onItineraryComplete(itinerary)
    setIsComplete(true)
  }

  const totalDuration = itinerary.reduce((sum, item) => sum + item.duration, 0)
  const totalDistance = experiences.reduce((sum, exp) => {
    return sum + Math.max(
      calculateDistance(user1.coordinates, exp.venue.coordinates),
      calculateDistance(user2.coordinates, exp.venue.coordinates)
    )
  }, 0)

  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto">
        <TravelCard>
          <CardContent className="text-center py-20">
            <div className="w-24 h-24 bg-coral rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <PartyPopper className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">🎉 Perfect Meetup Planned!</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              <strong>{user1.name}</strong> and <strong>{user2.name}</strong>, your amazing {experiences.length}-stop
              meetup journey is ready! Get ready for an unforgettable experience together.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
              <div className="bg-coral/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="font-bold text-2xl text-gray-900">{experiences.length}</div>
                <div className="text-sm text-gray-600">Experience{experiences.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="font-bold text-2xl text-gray-900">{Math.round(totalDuration / 60)}h</div>
                <div className="text-sm text-gray-600">Total Duration</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Navigation className="h-6 w-6 text-white" />
                </div>
                <div className="font-bold text-2xl text-gray-900">{Math.round(totalDistance)}km</div>
                <div className="text-sm text-gray-600">Max Distance</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CoralButton
                onClick={() => setIsComplete(false)}
                size="lg"
                variant="outline"
              >
                Review Itinerary
              </CoralButton>
              <CoralButton size="lg">
                Share Itinerary
              </CoralButton>
            </div>
          </CardContent>
        </TravelCard>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <TravelCard>
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-coral rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Your Complete Itinerary</CardTitle>
          <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
            Perfect meetup plan with {experiences.length} amazing experience{experiences.length !== 1 ? 's' : ''} and interactive map
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 p-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-coral/5 rounded-xl p-4 text-center">
              <div className="font-bold text-2xl text-coral">{experiences.length}</div>
              <div className="text-sm text-gray-600">Experience{experiences.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="font-bold text-2xl text-blue-600">{Math.round(totalDuration / 60)}h</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="font-bold text-2xl text-green-600">{Math.round(totalDistance)}km</div>
              <div className="text-sm text-gray-600">Max Travel</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="font-bold text-2xl text-yellow-600">{itinerary.length}</div>
              <div className="text-sm text-gray-600">Steps</div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Timeline */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl text-gray-900">Timeline</h3>
                <div className="text-sm text-gray-500">
                  {itinerary.length} steps planned
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {itinerary.map((item, index) => (
                  <TravelCard
                    key={item.id}
                    className={`transition-all duration-300 ${selectedExperience?.venue.id === item.venue?.id ? 'ring-2 ring-coral bg-coral/5' : 'hover:shadow-md'
                      }`}
                    hover={false}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${item.venue ? 'bg-coral text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {index + 1}
                          </div>
                          {index < itinerary.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900">{item.time}</span>
                                {item.duration > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.duration}min
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-semibold text-gray-800 mb-1">{item.activity}</h4>
                              {item.location && (
                                <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                                  <MapPin className="h-3 w-3" />
                                  {item.location}
                                </p>
                              )}
                              <p className="text-sm text-gray-700">{item.description}</p>

                              {item.venue && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="font-medium text-gray-900">{item.venue.name}</h5>
                                      <p className="text-xs text-gray-600">{item.venue.address}</p>
                                    </div>
                                    {item.venue.rating && (
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-medium">{item.venue.rating}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {item.venue && (
                              <button
                                onClick={() => setSelectedExperience(
                                  experiences.find(exp => exp.venue.id === item.venue!.id)
                                )}
                                className="text-coral hover:bg-coral hover:text-white p-2 rounded-lg transition-colors"
                              >
                                <MapPin className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </TravelCard>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl text-gray-900">Route Map</h3>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {showMap ? "Hide map" : "Show map"}
                </button>
              </div>

              {showMap && (
                <EnhancedItineraryMap
                  user1={user1}
                  user2={user2}
                  experiences={experiences}
                  selectedExperience={selectedExperience}
                />
              )}
            </div>
          </div>

          {/* Travel Summary */}
          <div className="grid gap-4 md:grid-cols-2 border-t pt-6">
            <TravelCard>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-coral rounded-full flex items-center justify-center">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{user1.name}'s Journey</h4>
                    <p className="text-sm text-gray-600">From: {user1.address}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="flex justify-between">
                      <span>To {exp.venue.name}:</span>
                      <span className="font-medium">
                        {Math.round(calculateDistance(user1.coordinates, exp.venue.coordinates))}km
                        ({calculateTravelTime(user1.coordinates, exp.venue.coordinates)}min)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </TravelCard>

            <TravelCard>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{user2.name}'s Journey</h4>
                    <p className="text-sm text-gray-600">From: {user2.address}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="flex justify-between">
                      <span>To {exp.venue.name}:</span>
                      <span className="font-medium">
                        {Math.round(calculateDistance(user2.coordinates, exp.venue.coordinates))}km
                        ({calculateTravelTime(user2.coordinates, exp.venue.coordinates)}min)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </TravelCard>
          </div>

          {/* Confirm Button */}
          <div className="pt-6 border-t border-gray-200">
            <CoralButton
              onClick={handleConfirm}
              size="lg"
              className="w-full"
            >
              <div className="flex items-center gap-3">
                <PartyPopper className="h-5 w-5" />
                Confirm Perfect Meetup Plan
              </div>
            </CoralButton>
          </div>
        </CardContent>
      </TravelCard>
    </div>
  )
}
