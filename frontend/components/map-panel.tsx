"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Calendar } from "lucide-react"

export default function MapPanel() {
  const [layers, setLayers] = useState({
    vegetation: true,
    water: true,
    heat: true,
    encroachment: false,
  })

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }

  return (
    <div className="h-full flex flex-col bg-secondary/50">
      {/* Map Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold mb-4">Interactive Map</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Bengaluru, India</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Oct 23, 2025</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-gradient-to-br from-secondary to-background relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">Leaflet Map Integration</p>
            <p className="text-xs text-muted-foreground mt-2">Ready for map library</p>
          </div>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="p-6 border-t border-border space-y-4">
        <h3 className="font-semibold text-sm">Map Layers</h3>
        <div className="space-y-3">
          {[
            { id: "vegetation", label: "Vegetation (Green)", color: "bg-green-500" },
            { id: "water", label: "Water Bodies (Blue)", color: "bg-blue-500" },
            { id: "heat", label: "Heat Hotspots (Red)", color: "bg-red-500" },
            { id: "encroachment", label: "Encroachment (Yellow)", color: "bg-yellow-500" },
          ].map((layer) => (
            <div key={layer.id} className="flex items-center gap-3">
              <Checkbox
                checked={layers[layer.id as keyof typeof layers]}
                onCheckedChange={() => toggleLayer(layer.id as keyof typeof layers)}
              />
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-3 h-3 rounded-full ${layer.color}`} />
                <span className="text-sm">{layer.label}</span>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4">Analyze Area</Button>
      </div>
    </div>
  )
}
