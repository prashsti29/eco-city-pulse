"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Leaf, LogOut } from "lucide-react"

const POPULAR_CITIES = [
  { name: "Bengaluru", coordinates: { lat: 12.9716, lng: 77.5946 } },
  { name: "Gurgaon", coordinates: { lat: 28.4595, lng: 77.0266 } },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<{ username: string; name?: string; role: string } | null>(null)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName)
  }

  const handleContinue = () => {
    if (selectedCity) {
      setIsLoading(true)
      localStorage.setItem("selectedCity", selectedCity)
      router.push("/dashboard")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
    localStorage.removeItem("selectedCity")
    router.push("/auth/login")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header with Logout */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Eco-City Pulse</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* User Info */}
        <div className="mb-8 text-center">
          <p className="text-muted-foreground">
            Welcome, <span className="text-primary font-semibold">{user.name || user.username}</span>
          </p>
          <p className="text-sm text-muted-foreground capitalize">Role: {user.role}</p>
        </div>

        {/* Main Card */}
        <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Select Your City</h2>
            </div>
            <p className="text-muted-foreground">Choose a city to view environmental metrics and insights</p>
          </div>

          {/* City Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCitySelect(city.name)}
                className={`p-6 rounded-lg border-2 transition-all duration-200 font-medium ${
                  selectedCity === city.name
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-foreground hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!selectedCity || isLoading}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {isLoading ? "Loading..." : "Continue to Dashboard"}
          </Button>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Real-time Data:</span> Get live environmental metrics
              including vegetation coverage, water quality, temperature, and urban resilience indicators.
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Powered by satellite imagery and environmental sensors</p>
        </div>
      </div>
    </div>
  )
}