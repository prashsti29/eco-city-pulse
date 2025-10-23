"use client"

import LayoutWrapper from "@/app/layout-wrapper"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TimelinePage() {
  // Safe mock data: NDVI & MNDWI timeline for Bengaluru & Gurugram (1985-2025)
  const timelineData = [
    { year: 1985, bengaluru_ndvi: 35.2, bengaluru_mndwi: 42.1, gurugram_ndvi: 38.5, gurugram_mndwi: 45.3 },
    { year: 1995, bengaluru_ndvi: 38.1, bengaluru_mndwi: 40.5, gurugram_ndvi: 40.2, gurugram_mndwi: 43.8 },
    { year: 2005, bengaluru_ndvi: 42.3, bengaluru_mndwi: 38.2, gurugram_ndvi: 42.8, gurugram_mndwi: 41.2 },
    { year: 2015, bengaluru_ndvi: 44.5, bengaluru_mndwi: 39.8, gurugram_ndvi: 44.1, gurugram_mndwi: 40.5 },
    { year: 2025, bengaluru_ndvi: 45.8, bengaluru_mndwi: 58.3, gurugram_ndvi: 46.2, gurugram_mndwi: 59.1 },
  ]

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Timeline Analysis</h1>
          <p className="text-muted-foreground">NDVI & MNDWI trends from 1985 to 2025</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bengaluru" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bengaluru">Bengaluru</TabsTrigger>
            <TabsTrigger value="gurugram">Gurugram</TabsTrigger>
          </TabsList>

          {/* Bengaluru Timeline */}
          <TabsContent value="bengaluru" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Bengaluru - NDVI & MNDWI Trends (1985-2025)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="year" stroke="#a0a0a0" />
                  <YAxis stroke="#a0a0a0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bengaluru_ndvi"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="NDVI"
                    dot={{ fill: "#22c55e" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bengaluru_mndwi"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="MNDWI"
                    dot={{ fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Gurugram Timeline */}
          <TabsContent value="gurugram" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Gurugram - NDVI & MNDWI Trends (1985-2025)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="year" stroke="#a0a0a0" />
                  <YAxis stroke="#a0a0a0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="gurugram_ndvi"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="NDVI"
                    dot={{ fill: "#22c55e" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gurugram_mndwi"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="MNDWI"
                    dot={{ fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutWrapper>
  )
}
