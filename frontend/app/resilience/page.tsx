"use client"

import LayoutWrapper from "@/layout-wrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { AlertTriangle, Shield } from "lucide-react"

export default function ResiliencePage() {
  const uriData = [
    { area: "Indiranagar", uri: 68.5, encroachment: 12.3 },
    { area: "Koramangala", uri: 65.2, encroachment: 15.8 },
    { area: "Whitefield", uri: 62.8, encroachment: 18.2 },
    { area: "Bengaluru Avg", uri: 58.3, encroachment: 22.1 },
  ]

  const componentData = [
    { name: "NDVI", value: 45.8 },
    { name: "MNDWI", value: 58.3 },
    { name: "LST", value: 67.6 },
    { name: "NDBI", value: 61.8 },
  ]

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Urban Resilience</h1>
          <p className="text-muted-foreground">URI Calculation & Encroachment Detection</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Urban Resilience Index</h3>
            </div>
            <p className="text-3xl font-bold text-primary mb-2">58.3%</p>
            <p className="text-sm text-muted-foreground">Bengaluru Average</p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Encroachment Detection</h3>
            </div>
            <p className="text-3xl font-bold text-red-500 mb-2">22.1%</p>
            <p className="text-sm text-muted-foreground">Urban Area Encroachment</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="uri" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="uri">URI by Area</TabsTrigger>
            <TabsTrigger value="components">Component Breakdown</TabsTrigger>
          </TabsList>

          {/* URI Analysis */}
          <TabsContent value="uri" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Urban Resilience Index by Area</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={uriData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="area" stroke="#a0a0a0" />
                  <YAxis stroke="#a0a0a0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="uri" fill="#1db954" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Component Breakdown */}
          <TabsContent value="components" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Supported Components</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={componentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#a0a0a0" />
                  <YAxis stroke="#a0a0a0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#1db954" strokeWidth={2} dot={{ fill: "#1db954" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutWrapper>
  )
}