import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Coordinates, Venue } from '@/lib/types'
import { calculateDistance } from '@/lib/utils/location'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface GeminiVenueRequest {
    user1Coordinates: Coordinates
    user2Coordinates: Coordinates
    midpoint: Coordinates
    selectedActivities: string[]
    radius?: number
}

export interface GeminiVenueResponse {
    name: string
    address: string
    coordinates: {
        lat: number
        lng: number
    }
    rating?: number
    type: string
    description: string
    googleMapsLink?: string
    distanceFromUser1?: number
    distanceFromUser2?: number
}

export async function getVenueRecommendations({
    user1Coordinates,
    user2Coordinates,
    midpoint,
    selectedActivities,
    radius = 10
}: GeminiVenueRequest): Promise<Venue[]> {
    try {
        const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' })

        const prompt = `
You are a local expert helping two friends find the perfect meetup locations. Here's the context:

**User Locations:**
- User A: Latitude ${user1Coordinates.lat}, Longitude ${user1Coordinates.lng}
- User B: Latitude ${user2Coordinates.lat}, Longitude ${user2Coordinates.lng}
- Midpoint: Latitude ${midpoint.lat}, Longitude ${midpoint.lng}

**Requested Activities:** ${selectedActivities.join(', ')}
**Search Radius:** ${radius} km from midpoint

**Instructions:**
1. Find 6-8 real, specific venues near the midpoint coordinates that match the selected activities
2. Focus on places that are accessible to both users and well-reviewed
3. Include a variety of options (different price points, ambiance, etc.)
4. Make sure coordinates are accurate for real places

**Required Response Format (JSON only, no other text):**
[
  {
    "name": "Venue Name",
    "address": "Full street address",
    "coordinates": {
      "lat": 40.1234,
      "lng": -74.5678
    },
    "rating": 4.5,
    "type": "dining|entertainment|outdoor|cultural|shopping|nightlife|sports|wellness",
    "description": "Brief description of the venue and why it's good for meetups",
    "googleMapsLink": "https://maps.google.com/?q=latitude,longitude"
  }
]

**Important:**
- Only return valid JSON array
- Use real coordinates for actual places
- Rating should be a number between 1-5 (omit if unknown)
- Type must match one of the activity categories
- Keep descriptions concise but helpful
- Include Google Maps links with actual coordinates
`

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        // Parse the JSON response
        let venuesData: GeminiVenueResponse[]
        try {
            // Clean the response text to extract just the JSON
            const jsonMatch = text.match(/\[[\s\S]*\]/)
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response')
            }

            venuesData = JSON.parse(jsonMatch[0])
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', text)
            throw new Error('Invalid JSON response from Gemini API')
        }

        // Transform to our Venue type and calculate distances
        const venues: Venue[] = venuesData.map((venue, index) => ({
            id: `gemini-${Date.now()}-${index}`,
            name: venue.name,
            address: venue.address,
            coordinates: venue.coordinates,
            rating: venue.rating,
            type: venue.type,
            description: venue.description,
            image_url: `/placeholder.svg?height=200&width=300`, // Placeholder image
            googleMapsLink: venue.googleMapsLink
        }))

        // Add distance calculations
        venues.forEach(venue => {
            venue.distanceFromUser1 = calculateDistance(user1Coordinates, venue.coordinates)
            venue.distanceFromUser2 = calculateDistance(user2Coordinates, venue.coordinates)
        })

        // Sort by average distance to both users
        venues.sort((a, b) => {
            const avgDistanceA = ((a.distanceFromUser1 || 0) + (a.distanceFromUser2 || 0)) / 2
            const avgDistanceB = ((b.distanceFromUser1 || 0) + (b.distanceFromUser2 || 0)) / 2
            return avgDistanceA - avgDistanceB
        })

        return venues

    } catch (error) {
        console.error('Error calling Gemini API:', error)

        // Fallback to mock data if API fails
        return getFallbackVenues(midpoint, selectedActivities, user1Coordinates, user2Coordinates)
    }
}

// Fallback mock data in case Gemini API fails
function getFallbackVenues(
    coordinates: Coordinates,
    activities: string[],
    user1Coordinates: Coordinates,
    user2Coordinates: Coordinates
): Venue[] {
    const mockVenues = [
        {
            id: "fallback-1",
            name: "Central Park Cafe",
            address: "123 Park Ave, New York, NY",
            coordinates: { lat: coordinates.lat + 0.01, lng: coordinates.lng + 0.01 },
            rating: 4.5,
            type: "dining",
            description: "Cozy cafe with outdoor seating - perfect for casual meetups",
            image_url: "/placeholder.svg?height=200&width=300",
            googleMapsLink: `https://maps.google.com/?q=${coordinates.lat + 0.01},${coordinates.lng + 0.01}`
        },
        {
            id: "fallback-2",
            name: "Art Gallery Downtown",
            address: "456 Main St, New York, NY",
            coordinates: { lat: coordinates.lat - 0.01, lng: coordinates.lng - 0.01 },
            rating: 4.2,
            type: "cultural",
            description: "Contemporary art gallery with rotating exhibitions",
            image_url: "/placeholder.svg?height=200&width=300",
            googleMapsLink: `https://maps.google.com/?q=${coordinates.lat - 0.01},${coordinates.lng - 0.01}`
        },
        {
            id: "fallback-3",
            name: "Riverside Park",
            address: "789 River Rd, New York, NY",
            coordinates: { lat: coordinates.lat + 0.005, lng: coordinates.lng - 0.005 },
            rating: 4.7,
            type: "outdoor",
            description: "Beautiful park with walking trails and scenic views",
            image_url: "/placeholder.svg?height=200&width=300",
            googleMapsLink: `https://maps.google.com/?q=${coordinates.lat + 0.005},${coordinates.lng - 0.005}`
        },
    ]

    // Filter and add distance calculations
    const filteredVenues = mockVenues.filter((venue) => activities.includes(venue.type))

    filteredVenues.forEach(venue => {
        venue.distanceFromUser1 = calculateDistance(user1Coordinates, venue.coordinates)
        venue.distanceFromUser2 = calculateDistance(user2Coordinates, venue.coordinates)
    })

    return filteredVenues
} 