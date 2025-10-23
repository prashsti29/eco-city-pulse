"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

const POPULAR_CITIES = [
  { name: "Bengaluru", coordinates: { lat: 12.9716, lng: 77.5946 } },
  { name: "Delhi", coordinates: { lat: 28.7041, lng: 77.1025 } },
  { name: "Mumbai", coordinates: { lat: 19.076, lng: 72.8776 } },
  { name: "Hyderabad", coordinates: { lat: 17.385, lng: 78.4867 } },
  { name: "Pune", coordinates: { lat: 18.5204, lng: 73.8567 } },
  { name: "Chennai", coordinates: { lat: 13.0827, lng: 80.2707 } },
  { name: "Kolkata", coordinates: { lat: 22.5726, lng: 88.3639 } },
  { name: "Ahmedabad", coordinates: { lat: 23.0225, lng: 72.5714 } },
]

interface LocationSelectorProps {
  onLocationSelect?: (city: string) => void
}

export function LocationSelector({ onLocationSelect }: LocationSelectorProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("selectedCity") : null,
  )

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName)
    localStorage.setItem("selectedCity", cityName)
    onLocationSelect?.(cityName)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Select Location</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {POPULAR_CITIES.map((city) => (
          <Button
            key={city.name}
            variant={selectedCity === city.name ? "default" : "outline"}
            onClick={() => handleCitySelect(city.name)}
            className="text-sm"
          >
            {city.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
