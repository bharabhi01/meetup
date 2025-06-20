"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [meetups, setMeetups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
        return
      }

      setUser(user)

      // Fetch user's meetups
      const { data: meetups } = await supabase
        .from("meetups")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false })

      setMeetups(meetups || [])
      setIsLoading(false)
    }

    getInitialData()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          router.push("/")
        } else {
          setUser(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Meetups</h1>
            <p className="text-muted-foreground">Manage and track your planned meetups</p>
          </div>
          <Button asChild>
            <Link href="/">
              <Plus className="h-4 w-4 mr-2" />
              New Meetup
            </Link>
          </Button>
        </div>

        {meetups && meetups.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {meetups.map((meetup) => (
              <Card key={meetup.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {meetup.title}
                  </CardTitle>
                  <CardDescription>
                    Status: <span className="capitalize">{meetup.status}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {meetup.selected_venue && (
                      <p>
                        <strong>Venue:</strong> {meetup.selected_venue.name}
                      </p>
                    )}
                    {meetup.selected_activities && (
                      <p>
                        <strong>Activities:</strong> {meetup.selected_activities.join(", ")}
                      </p>
                    )}
                    <p>
                      <strong>Created:</strong> {new Date(meetup.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No meetups yet</h3>
              <p className="text-muted-foreground mb-4">Start planning your first meetup with friends!</p>
              <Button asChild>
                <Link href="/">
                  <Plus className="h-4 w-4 mr-2" />
                  Plan Your First Meetup
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
