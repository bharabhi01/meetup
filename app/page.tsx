"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthForm } from "@/components/auth/auth-form"
import { MeetupFlow } from "@/components/meetup/meetup-flow"
import { CoralButton } from "@/components/ui/coral-button"
import { TravelCard } from "@/components/ui/travel-card"
import { FloatingElements } from "@/components/ui/floating-elements"
import { MapPin, Users, Calendar, Route, Star, Heart } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-pink-soft relative overflow-hidden">
        <FloatingElements />

        <div className="relative z-10">
          {/* Hero Section */}
          <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Book Unique Meetup
                <br />
                <span className="text-coral">And Experience</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Since 2024, we've helped more than 500,000 people of all ages enjoy the best meetup experience of their
                lives.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <CoralButton size="lg">
                  <Heart className="h-5 w-5 mr-2" />
                  Start Planning Free
                </CoralButton>
                <CoralButton variant="outline" size="lg">
                  Learn More
                </CoralButton>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <TravelCard className="text-center p-8">
                <div className="w-16 h-16 bg-coral rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Smart Location</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Find the perfect midpoint between any two locations with our intelligent algorithm
                </p>
              </TravelCard>

              <TravelCard className="text-center p-8">
                <div className="w-16 h-16 bg-coral rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Activity Matching</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Discover venues that match both your interests and create memorable experiences
                </p>
              </TravelCard>

              <TravelCard className="text-center p-8">
                <div className="w-16 h-16 bg-coral rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Route className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Smart Routes</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Get optimized routes and travel times for both participants automatically
                </p>
              </TravelCard>

              <TravelCard className="text-center p-8">
                <div className="w-16 h-16 bg-coral rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Full Itinerary</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Complete timeline from departure to return, perfectly planned with activities
                </p>
              </TravelCard>
            </div>

            {/* Social Proof */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 bg-coral rounded-full border-2 border-white shadow-sm" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">10,000+ happy users</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm font-medium text-gray-600 ml-2">4.9/5 rating</span>
                </div>
              </div>
            </div>

            {/* Auth Section */}
            <div id="auth">
              <AuthForm />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <MeetupFlow />
}
