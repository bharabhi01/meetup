export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface Venue {
  id: string
  name: string
  address: string
  coordinates: Coordinates
  rating?: number
  type: string
  description?: string
  image_url?: string
  googleMapsLink?: string
  distanceFromUser1?: number
  distanceFromUser2?: number
}

export interface Meetup {
  id: string
  title: string
  status: "planning" | "confirmed" | "completed" | "cancelled"
  user1_id: string
  user2_id: string
  user1_location?: string
  user2_location?: string
  user1_coordinates?: Coordinates
  user2_coordinates?: Coordinates
  selected_activities?: string[]
  midpoint_coordinates?: Coordinates
  selected_venue?: Venue
  itinerary?: ItineraryItem[]
  created_at: string
  updated_at: string
}

export interface ItineraryItem {
  id: string
  time: string
  activity: string
  location?: string
  duration: number
  description?: string
  coordinates?: Coordinates
  venue?: Venue
}

export interface Experience {
  id: string
  venue: Venue
  selectedActivities: string[]
  order: number
  estimatedDuration: number
}

export const ACTIVITY_CATEGORIES = [
  { id: "dining", label: "Dining & Food", icon: "🍽️" },
  { id: "entertainment", label: "Entertainment", icon: "🎬" },
  { id: "outdoor", label: "Outdoor Activities", icon: "🌳" },
  { id: "cultural", label: "Cultural & Arts", icon: "🎨" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "nightlife", label: "Nightlife", icon: "🌙" },
  { id: "sports", label: "Sports & Fitness", icon: "⚽" },
  { id: "wellness", label: "Wellness & Spa", icon: "🧘" },
] as const

export interface User {
  name: string
  address: string
  coordinates: Coordinates
}

export interface UserData {
  user1: User
  user2: User
  midpoint: Coordinates
}
