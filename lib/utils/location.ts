import type { Coordinates } from "@/lib/types"

// Calculate midpoint between two coordinates
export function calculateMidpoint(coord1: Coordinates, coord2: Coordinates): Coordinates {
  const lat1 = (coord1.lat * Math.PI) / 180
  const lat2 = (coord2.lat * Math.PI) / 180
  const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180

  const bx = Math.cos(lat2) * Math.cos(deltaLng)
  const by = Math.cos(lat2) * Math.sin(deltaLng)

  const lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by),
  )
  const lng3 = (coord1.lng * Math.PI) / 180 + Math.atan2(by, Math.cos(lat1) + bx)

  return {
    lat: (lat3 * 180) / Math.PI,
    lng: (lng3 * 180) / Math.PI,
  }
}

// Calculate distance between two coordinates (in km)
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
    Math.cos((coord2.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Enhanced address search result interface for Mapbox
export interface AddressResult {
  display_name: string
  lat: number
  lng: number
  type: string
  importance: number
  mapbox_id?: string
  address?: string
  full_address?: string
  place_formatted?: string
  feature_type?: string
  poi_category?: string[]
  maki?: string
  distance?: number
}

// Generate a session token for Mapbox Search Box API billing
function generateSessionToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Search for addresses with autocomplete using Mapbox Search Box API (with Nominatim fallback)
export async function searchAddresses(query: string, limit: number = 5): Promise<AddressResult[]> {
  try {
    // Only use geocoding API on client side
    if (typeof window === 'undefined') {
      return getFallbackAddresses(query, limit)
    }

    // Don't search for very short queries
    if (query.trim().length < 2) {
      return []
    }

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

    // Try Mapbox first if token is available
    if (accessToken) {
      try {
        // Generate session token for billing (reuse for suggest/retrieve pairs)
        const sessionToken = generateSessionToken()

        // Use Mapbox Search Box API for high-quality autocomplete
        const encodedQuery = encodeURIComponent(query.trim())
        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodedQuery}&limit=${Math.min(limit, 10)}&language=en&session_token=${sessionToken}&access_token=${accessToken}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.ok) {
          const data = await response.json()

          if (data && data.suggestions && Array.isArray(data.suggestions)) {
            return data.suggestions.map((result: any) => ({
              display_name: result.full_address || result.name,
              lat: 0, // Will be filled when user selects
              lng: 0, // Will be filled when user selects
              type: result.feature_type || 'location',
              importance: calculateImportance(result),
              mapbox_id: result.mapbox_id,
              address: result.address,
              full_address: result.full_address,
              place_formatted: result.place_formatted,
              feature_type: result.feature_type,
              poi_category: result.poi_category,
              maki: result.maki,
              distance: result.distance
            })).sort((a: AddressResult, b: AddressResult) => b.importance - a.importance)
          }
        }
      } catch (mapboxError) {
        console.warn('Mapbox API failed, falling back to Nominatim:', mapboxError)
      }
    }

    // Fallback to Nominatim (OpenStreetMap) if Mapbox fails or no token
    console.log('Using Nominatim fallback for geocoding')
    const encodedQuery = encodeURIComponent(query.trim())
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${limit}&addressdetails=1&extratags=1`,
      {
        headers: {
          'User-Agent': 'MiddleMeetup/1.0 (contact@middlemeetup.com)' // Required for Nominatim
        }
      }
    )

    if (!response.ok) {
      throw new Error('Address search service unavailable')
    }

    const data = await response.json()

    if (data && Array.isArray(data)) {
      return data.map((result: any) => ({
        display_name: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        type: result.type || 'location',
        importance: parseFloat(result.importance || '0'),
        // No mapbox_id for Nominatim results
        mapbox_id: undefined,
        address: result.display_name,
        full_address: result.display_name,
        place_formatted: result.display_name,
        feature_type: result.type || 'location'
      })).sort((a: AddressResult, b: AddressResult) => b.importance - a.importance)
    }

    // Final fallback to mock data
    return getFallbackAddresses(query, limit)
  } catch (error) {
    console.error("Address search error:", error)
    return getFallbackAddresses(query, limit)
  }
}

// Calculate importance score for Mapbox results
function calculateImportance(result: any): number {
  let score = 0.5 // Base score

  // Higher score for more specific features
  const featureTypeScores: Record<string, number> = {
    'address': 1.0,
    'poi': 0.9,
    'place': 0.8,
    'locality': 0.7,
    'neighborhood': 0.6,
    'region': 0.4,
    'country': 0.2
  }

  score += featureTypeScores[result.feature_type] || 0.5

  // Boost POIs and popular places
  if (result.poi_category && result.poi_category.length > 0) {
    score += 0.2
  }

  // Boost if has distance (closer to user)
  if (result.distance !== undefined) {
    score += 0.1
  }

  return Math.min(score, 1.0)
}

// Retrieve detailed coordinates for a selected Mapbox suggestion
export async function retrieveMapboxLocation(mapboxId: string, sessionToken?: string): Promise<Coordinates | null> {
  try {
    if (typeof window === 'undefined') {
      return null
    }

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!accessToken) {
      return null
    }

    const token = sessionToken || generateSessionToken()
    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?session_token=${token}&access_token=${accessToken}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Mapbox retrieve error: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.features && data.features.length > 0) {
      const feature = data.features[0]
      const [lng, lat] = feature.geometry.coordinates
      return { lat, lng }
    }

    return null
  } catch (error) {
    console.error("Mapbox retrieve error:", error)
    return null
  }
}

// Enhanced geocoding using Mapbox Search Box API (with Nominatim fallback) for single address lookup
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    // Only use geocoding API on client side
    if (typeof window === 'undefined') {
      return getFallbackCoordinates(address)
    }

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

    // Try Mapbox first if token is available
    if (accessToken) {
      try {
        // Use Mapbox Search Box API forward endpoint for direct geocoding
        const encodedAddress = encodeURIComponent(address)
        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/forward?q=${encodedAddress}&limit=1&language=en&access_token=${accessToken}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.ok) {
          const data = await response.json()

          if (data && data.features && data.features.length > 0) {
            const feature = data.features[0]
            const [lng, lat] = feature.geometry.coordinates
            return { lat, lng }
          }
        }
      } catch (mapboxError) {
        console.warn('Mapbox geocoding failed, falling back to Nominatim:', mapboxError)
      }
    }

    // Fallback to Nominatim (OpenStreetMap) if Mapbox fails or no token
    console.log('Using Nominatim fallback for single geocoding')
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MiddleMeetup/1.0 (contact@middlemeetup.com)' // Required for Nominatim
        }
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding service unavailable')
    }

    const data = await response.json()

    if (data && data.length > 0) {
      const result = data[0]
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      }
    }

    // Final fallback to mock data
    return getFallbackCoordinates(address)
  } catch (error) {
    console.error("Geocoding error:", error)
    return getFallbackCoordinates(address)
  }
}

// Fallback address search for development
function getFallbackAddresses(query: string, limit: number): AddressResult[] {
  const mockAddresses: AddressResult[] = [
    { display_name: "New York, NY, United States", lat: 40.7128, lng: -74.006, type: "city", importance: 0.9 },
    { display_name: "New York City, NY, United States", lat: 40.7128, lng: -74.006, type: "city", importance: 0.95 },
    { display_name: "Manhattan, New York, NY, United States", lat: 40.7831, lng: -73.9712, type: "district", importance: 0.8 },
    { display_name: "Brooklyn, New York, NY, United States", lat: 40.6782, lng: -73.9442, type: "district", importance: 0.8 },
    { display_name: "Los Angeles, CA, United States", lat: 34.0522, lng: -118.2437, type: "city", importance: 0.9 },
    { display_name: "LA, California, United States", lat: 34.0522, lng: -118.2437, type: "city", importance: 0.85 },
    { display_name: "Chicago, IL, United States", lat: 41.8781, lng: -87.6298, type: "city", importance: 0.9 },
    { display_name: "Houston, TX, United States", lat: 29.7604, lng: -95.3698, type: "city", importance: 0.9 },
    { display_name: "Phoenix, AZ, United States", lat: 33.4484, lng: -112.074, type: "city", importance: 0.9 },
    { display_name: "Philadelphia, PA, United States", lat: 39.9526, lng: -75.1652, type: "city", importance: 0.9 },
    { display_name: "San Antonio, TX, United States", lat: 29.4241, lng: -98.4936, type: "city", importance: 0.85 },
    { display_name: "San Diego, CA, United States", lat: 32.7157, lng: -117.1611, type: "city", importance: 0.85 },
    { display_name: "Dallas, TX, United States", lat: 32.7767, lng: -96.797, type: "city", importance: 0.9 },
    { display_name: "San Jose, CA, United States", lat: 37.3382, lng: -121.8863, type: "city", importance: 0.85 },
    { display_name: "San Francisco, CA, United States", lat: 37.7749, lng: -122.4194, type: "city", importance: 0.9 },
    { display_name: "Seattle, WA, United States", lat: 47.6062, lng: -122.3321, type: "city", importance: 0.9 },
    { display_name: "Boston, MA, United States", lat: 42.3601, lng: -71.0589, type: "city", importance: 0.9 },
    { display_name: "Miami, FL, United States", lat: 25.7617, lng: -80.1918, type: "city", importance: 0.85 },
    { display_name: "Denver, CO, United States", lat: 39.7392, lng: -104.9903, type: "city", importance: 0.85 },
    { display_name: "London, United Kingdom", lat: 51.5074, lng: -0.1278, type: "city", importance: 0.95 },
    { display_name: "Paris, France", lat: 48.8566, lng: 2.3522, type: "city", importance: 0.95 },
    { display_name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, type: "city", importance: 0.95 },
    { display_name: "Sydney, Australia", lat: -33.8688, lng: 151.2093, type: "city", importance: 0.9 },
    { display_name: "Toronto, ON, Canada", lat: 43.6532, lng: -79.3832, type: "city", importance: 0.9 },
    { display_name: "Vancouver, BC, Canada", lat: 49.2827, lng: -123.1207, type: "city", importance: 0.85 },
  ]

  const normalizedQuery = query.toLowerCase().trim()

  // Filter addresses that match the query
  const filtered = mockAddresses.filter(addr =>
    addr.display_name.toLowerCase().includes(normalizedQuery)
  ).sort((a, b) => b.importance - a.importance)

  return filtered.slice(0, limit)
}

// Fallback mock coordinates for development
function getFallbackCoordinates(address: string): Coordinates | null {
  const mockCoordinates: Record<string, Coordinates> = {
    "new york": { lat: 40.7128, lng: -74.006 },
    "new york city": { lat: 40.7128, lng: -74.006 },
    "nyc": { lat: 40.7128, lng: -74.006 },
    "manhattan": { lat: 40.7831, lng: -73.9712 },
    "brooklyn": { lat: 40.6782, lng: -73.9442 },
    "los angeles": { lat: 34.0522, lng: -118.2437 },
    "la": { lat: 34.0522, lng: -118.2437 },
    "chicago": { lat: 41.8781, lng: -87.6298 },
    "houston": { lat: 29.7604, lng: -95.3698 },
    "phoenix": { lat: 33.4484, lng: -112.074 },
    "philadelphia": { lat: 39.9526, lng: -75.1652 },
    "san antonio": { lat: 29.4241, lng: -98.4936 },
    "san diego": { lat: 32.7157, lng: -117.1611 },
    "dallas": { lat: 32.7767, lng: -96.797 },
    "san jose": { lat: 37.3382, lng: -121.8863 },
    "san francisco": { lat: 37.7749, lng: -122.4194 },
    "seattle": { lat: 47.6062, lng: -122.3321 },
    "boston": { lat: 42.3601, lng: -71.0589 },
    "miami": { lat: 25.7617, lng: -80.1918 },
    "denver": { lat: 39.7392, lng: -104.9903 },
    "london": { lat: 51.5074, lng: -0.1278 },
    "paris": { lat: 48.8566, lng: 2.3522 },
    "tokyo": { lat: 35.6762, lng: 139.6503 },
    "sydney": { lat: -33.8688, lng: 151.2093 },
    "toronto": { lat: 43.6532, lng: -79.3832 },
    "vancouver": { lat: 49.2827, lng: -123.1207 },
  }

  const normalizedAddress = address.toLowerCase().trim()

  // Try exact match first
  if (mockCoordinates[normalizedAddress]) {
    return mockCoordinates[normalizedAddress]
  }

  // Try partial matches
  for (const [key, coords] of Object.entries(mockCoordinates)) {
    if (normalizedAddress.includes(key) || key.includes(normalizedAddress)) {
      return coords
    }
  }

  return null
}

// Mock venue search function (replace with actual API)
export async function searchVenues(
  midpointCoordinates: Coordinates,
  activities: string[],
  radius = 10,
  user1Coordinates?: Coordinates,
  user2Coordinates?: Coordinates
): Promise<any[]> {
  // If we have all required data, use Gemini API
  if (user1Coordinates && user2Coordinates) {
    try {
      const { getVenueRecommendations } = await import('@/lib/services/gemini')

      const venues = await getVenueRecommendations({
        user1Coordinates,
        user2Coordinates,
        midpoint: midpointCoordinates,
        selectedActivities: activities,
        radius
      })

      return venues
    } catch (error) {
      console.error('Failed to get Gemini venue recommendations:', error)
      // Fall through to mock data
    }
  }

  // Fallback mock venue data
  const mockVenues: any[] = [
    {
      id: "fallback-1",
      name: "Central Park Cafe",
      address: "123 Park Ave, New York, NY",
      coordinates: { lat: midpointCoordinates.lat + 0.01, lng: midpointCoordinates.lng + 0.01 },
      rating: 4.5,
      type: "dining",
      description: "Cozy cafe with outdoor seating - perfect for meetups",
      image_url: "/placeholder.svg?height=200&width=300",
      googleMapsLink: `https://maps.google.com/?q=${midpointCoordinates.lat + 0.01},${midpointCoordinates.lng + 0.01}`,
      distanceFromUser1: 0,
      distanceFromUser2: 0
    },
    {
      id: "fallback-2",
      name: "Art Gallery Downtown",
      address: "456 Main St, New York, NY",
      coordinates: { lat: midpointCoordinates.lat - 0.01, lng: midpointCoordinates.lng - 0.01 },
      rating: 4.2,
      type: "cultural",
      description: "Contemporary art gallery with rotating exhibitions",
      image_url: "/placeholder.svg?height=200&width=300",
      googleMapsLink: `https://maps.google.com/?q=${midpointCoordinates.lat - 0.01},${midpointCoordinates.lng - 0.01}`,
      distanceFromUser1: 0,
      distanceFromUser2: 0
    },
    {
      id: "fallback-3",
      name: "Riverside Park",
      address: "789 River Rd, New York, NY",
      coordinates: { lat: midpointCoordinates.lat + 0.005, lng: midpointCoordinates.lng - 0.005 },
      rating: 4.7,
      type: "outdoor",
      description: "Beautiful park with walking trails and scenic views",
      image_url: "/placeholder.svg?height=200&width=300",
      googleMapsLink: `https://maps.google.com/?q=${midpointCoordinates.lat + 0.005},${midpointCoordinates.lng - 0.005}`,
      distanceFromUser1: 0,
      distanceFromUser2: 0
    },
  ]

  // Filter venues based on selected activities and add distance calculations
  const filteredVenues = mockVenues.filter((venue) => activities.includes(venue.type))

  if (user1Coordinates && user2Coordinates) {
    filteredVenues.forEach(venue => {
      venue.distanceFromUser1 = calculateDistance(user1Coordinates, venue.coordinates)
      venue.distanceFromUser2 = calculateDistance(user2Coordinates, venue.coordinates)
    })
  }

  return filteredVenues
}
