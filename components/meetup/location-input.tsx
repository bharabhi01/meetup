"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CoralButton } from "@/components/ui/coral-button"
import { TravelCard } from "@/components/ui/travel-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Users, ArrowRight, User } from "lucide-react"
import { MapLibreMap } from "@/components/ui/maplibre-map"
import { FallbackMap } from "@/components/ui/fallback-map"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"
import { geocodeAddress, calculateMidpoint } from "@/lib/utils/location"
import type { Coordinates, User as UserType } from "@/lib/types"
import type { AddressResult } from "@/lib/utils/location"

interface LocationInputProps {
  onLocationsSet: (user1: UserType, user2: UserType) => void
}

export function LocationInput({ onLocationsSet }: LocationInputProps) {
  const [user1Name, setUser1Name] = useState("")
  const [user1Location, setUser1Location] = useState("")
  const [user2Name, setUser2Name] = useState("")
  const [user2Location, setUser2Location] = useState("")
  const [user1Coordinates, setUser1Coordinates] = useState<Coordinates | null>(null)
  const [user2Coordinates, setUser2Coordinates] = useState<Coordinates | null>(null)
  const [midpoint, setMidpoint] = useState<Coordinates | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [useMap, setUseMap] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const [coord1, coord2] = await Promise.all([geocodeAddress(user1Location), geocodeAddress(user2Location)])

      if (!coord1 || !coord2) {
        throw new Error("Could not find one or both locations. Please try different addresses.")
      }

      const user1Data: UserType = {
        name: user1Name,
        address: user1Location,
        coordinates: coord1
      }

      const user2Data: UserType = {
        name: user2Name,
        address: user2Location,
        coordinates: coord2
      }

      onLocationsSet(user1Data, user2Data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSearch = async (location: string, userNumber: 1 | 2) => {
    if (!location.trim()) {
      // Clear coordinates if location is empty
      if (userNumber === 1) {
        setUser1Coordinates(null)
      } else {
        setUser2Coordinates(null)
      }
      setMidpoint(null)
      return
    }

    try {
      const coordinates = await geocodeAddress(location)
      if (coordinates) {
        if (userNumber === 1) {
          setUser1Coordinates(coordinates)
        } else {
          setUser2Coordinates(coordinates)
        }

        // Calculate midpoint if both coordinates are available
        if (userNumber === 1 && user2Coordinates) {
          setMidpoint(calculateMidpoint(coordinates, user2Coordinates))
        } else if (userNumber === 2 && user1Coordinates) {
          setMidpoint(calculateMidpoint(user1Coordinates, coordinates))
        }
      }
    } catch (error) {
      console.error("Error searching location:", error)
    }
  }

  const handleAddressSelect = (address: AddressResult, userNumber: 1 | 2) => {
    // Make sure we have coordinates (should be filled by AddressAutocomplete)
    if (!address.lat || !address.lng) {
      console.warn('Address selected without coordinates:', address)
      return
    }

    const coordinates = { lat: address.lat, lng: address.lng }

    if (userNumber === 1) {
      setUser1Coordinates(coordinates)
      console.log('User 1 coordinates set:', coordinates)
    } else {
      setUser2Coordinates(coordinates)
      console.log('User 2 coordinates set:', coordinates)
    }

    // Calculate midpoint if both coordinates are available
    let newMidpoint: Coordinates | null = null
    if (userNumber === 1 && user2Coordinates) {
      newMidpoint = calculateMidpoint(coordinates, user2Coordinates)
      setMidpoint(newMidpoint)
    } else if (userNumber === 2 && user1Coordinates) {
      newMidpoint = calculateMidpoint(user1Coordinates, coordinates)
      setMidpoint(newMidpoint)
    }

    if (newMidpoint) {
      console.log('Midpoint calculated:', newMidpoint)
    }
  }

  const getCurrentLocation = async (userNumber: 1 | 2) => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const coordinates = { lat, lng }
        const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`

        if (userNumber === 1) {
          setUser1Location(address)
          setUser1Coordinates(coordinates)
        } else {
          setUser2Location(address)
          setUser2Coordinates(coordinates)
        }

        // Calculate midpoint if both coordinates are available
        if (userNumber === 1 && user2Coordinates) {
          setMidpoint(calculateMidpoint(coordinates, user2Coordinates))
        } else if (userNumber === 2 && user1Coordinates) {
          setMidpoint(calculateMidpoint(user1Coordinates, coordinates))
        }
      },
      (error) => {
        setError("Unable to retrieve your location.")
      },
    )
  }

  const mapUser1 = user1Coordinates && user1Name ? {
    name: user1Name,
    address: user1Location,
    coordinates: user1Coordinates
  } : undefined

  const mapUser2 = user2Coordinates && user2Name ? {
    name: user2Name,
    address: user2Location,
    coordinates: user2Coordinates
  } : undefined

  // Debug logging for map data
  useEffect(() => {
    console.log('Map data update:', {
      mapUser1,
      mapUser2,
      midpoint,
      user1Coordinates,
      user2Coordinates
    })
  }, [mapUser1, mapUser2, midpoint, user1Coordinates, user2Coordinates])

  return (
    <div className="max-w-6xl mx-auto">
      <TravelCard>
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-coral rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Set Your Starting Points</CardTitle>
          <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your names and locations. We'll show you both locations on the map and find the perfect meeting point!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Form Section */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  {/* User 1 Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-coral rounded-2xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <Label className="text-xl font-bold text-gray-800">Your Information</Label>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          value={user1Name}
                          onChange={(e) => setUser1Name(e.target.value)}
                          placeholder="Enter your name"
                          className="pl-12 h-14 text-lg rounded-2xl border-gray-200 focus:border-coral focus:ring-coral"
                          required
                        />
                      </div>

                      <AddressAutocomplete
                        value={user1Location}
                        onChange={(value) => {
                          setUser1Location(value)
                          // Clear coordinates when user starts typing new address
                          if (value.trim() === '') {
                            setUser1Coordinates(null)
                          }
                        }}
                        onSelect={(address) => handleAddressSelect(address, 1)}
                        placeholder="Enter your address or city"
                        disabled={isLoading}
                      />

                      <CoralButton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => getCurrentLocation(1)}
                        className="w-full"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Use Current Location
                      </CoralButton>
                    </div>
                  </div>

                  {/* User 2 Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <Label className="text-xl font-bold text-gray-800">Friend's Information</Label>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          value={user2Name}
                          onChange={(e) => setUser2Name(e.target.value)}
                          placeholder="Enter friend's name"
                          className="pl-12 h-14 text-lg rounded-2xl border-gray-200 focus:border-coral focus:ring-coral"
                          required
                        />
                      </div>

                      <AddressAutocomplete
                        value={user2Location}
                        onChange={(value) => {
                          setUser2Location(value)
                          // Clear coordinates when user starts typing new address
                          if (value.trim() === '') {
                            setUser2Coordinates(null)
                          }
                        }}
                        onSelect={(address) => handleAddressSelect(address, 2)}
                        placeholder="Enter friend's address or city"
                        disabled={isLoading}
                      />

                      <CoralButton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => getCurrentLocation(2)}
                        className="w-full"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Use Current Location
                      </CoralButton>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-sm font-bold">!</span>
                      </div>
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <CoralButton
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || !user1Name || !user1Location || !user2Name || !user2Location}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Finding locations...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        Continue to Activities
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    )}
                  </CoralButton>
                </div>
              </form>
            </div>

            {/* Map Section */}
            <div className="space-y-4 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <Label className="text-xl font-bold text-gray-800">Live Map View</Label>
                </div>
                <button
                  type="button"
                  onClick={() => setUseMap(!useMap)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {useMap ? "Show list view" : "Show map"}
                </button>
              </div>

              <div className="flex-1 min-h-0">
                {useMap ? (
                  <MapLibreMap
                    user1={mapUser1}
                    user2={mapUser2}
                    midpoint={midpoint || undefined}
                    height="500px"
                    className="w-full h-full"
                  />
                ) : (
                  <FallbackMap
                    user1={mapUser1}
                    user2={mapUser2}
                    midpoint={midpoint || undefined}
                    height="500px"
                    className="w-full h-full"
                  />
                )}
              </div>

              {midpoint && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-sm">📍</span>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-800">Meeting Point Found!</p>
                      <p className="text-sm text-yellow-700">
                        Perfect midpoint at coordinates: {midpoint.lat.toFixed(4)}, {midpoint.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </TravelCard>
    </div>
  )
}
