"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CoralButton } from "@/components/ui/coral-button"
import { TravelCard } from "@/components/ui/travel-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock, User, MapPin } from "lucide-react"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      toast({
        title: "Welcome aboard! 🎉",
        description: "Check your email to confirm your account and start planning amazing meetups.",
      })
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: "Welcome back! 👋",
        description: "Ready to plan your next amazing meetup?",
      })

      // Authentication state will be automatically updated via onAuthStateChange listener
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center p-4">
      <TravelCard className="w-full max-w-md">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="w-16 h-16 bg-coral rounded-2xl flex items-center justify-center mx-auto">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Join MeetUp</CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Start planning perfect meetups with friends at the ideal midpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-2xl p-1 h-12">
              <TabsTrigger
                value="signin"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6 mt-8">
              <form action={handleSignIn} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="signin-email" className="text-sm font-semibold text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-12 h-14 rounded-2xl border-gray-200 focus:border-coral focus:ring-coral text-base"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signin-password" className="text-sm font-semibold text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-12 h-14 rounded-2xl border-gray-200 focus:border-coral focus:ring-coral text-base"
                      required
                    />
                  </div>
                </div>
                <CoralButton type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </CoralButton>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6 mt-8">
              <form action={handleSignUp} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="signup-name" className="text-sm font-semibold text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-12 h-14 rounded-2xl border-gray-200 focus:border-coral focus:ring-coral text-base"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-email" className="text-sm font-semibold text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-12 h-14 rounded-2xl border-gray-200 focus:border-coral focus:ring-coral text-base"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-password" className="text-sm font-semibold text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a secure password"
                      className="pl-12 h-14 rounded-2xl border-gray-200 focus:border-coral focus:ring-coral text-base"
                      required
                    />
                  </div>
                </div>
                <CoralButton type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </CoralButton>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </TravelCard>
    </div>
  )
}
