"use client"

import LayoutWrapper from "@/layout-wrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

export default function LivabilityPage() {
  // Top 3 Most Livable Areas - STRICT
  const topAreas = [
    {
      rank: 1,
      name: "Indiranagar",
      score: 78.5,
      ndvi: 52.3,
      mndwi: 61.2,
      lst: 30.8,
      ndbi: 35.2,
    },
    {
      rank: 2,
      name: "Koramangala",
      score: 76.2,
      ndvi: 48.9,
      mndwi: 58.7,
      lst: 31.5,
      ndbi: 38.1,
    },
    {
      rank: 3,
      name: "Whitefield",
      score: 74.8,
      ndvi: 46.5,
      mndwi: 56.3,
      lst: 32.1,
      ndbi: 40.2,
    },
  ]

  const userLocation = {
    name: "Your Location (Bengaluru)",
    score: 72.5,
    ndvi: 45.8,
    mndwi: 58.3,
    lst: 32.4,
    ndbi: 38.2,
  }

  const radarData = [
    { metric: "NDVI", value: 45.8, fullMark: 100 },
    { metric: "MNDWI", value: 58.3, fullMark: 100 },
    { metric: "LST", value: 67.6, fullMark: 100 },
    { metric: "NDBI", value: 61.8, fullMark: 100 },
  ]

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Livability Analysis</h1>
          <p className="text-muted-foreground">Top 3 Most Livable Areas in Bengaluru</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ranking">Top 3 Areas</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="breakdown">Component Breakdown</TabsTrigger>
          </TabsList>

          {/* Top 3 Areas */}
          <TabsContent value="ranking" className="space-y-4">
            {topAreas.map((area) => (
              <div>
                key={area.rank}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">#{area.rank}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{area.name}</h3>
                      <p className="text-sm text-muted-foreground">Livability Score</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{area.score}</p>
                    <p className="text-xs text-muted-foreground">out of 100</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "NDVI", value: area.ndvi },
                    { label: "MNDWI", value: area.mndwi },
                    { label: "LST", value: area.lst },
                    { label: "NDBI", value: area.ndbi },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                      <p className="font-semibold">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Comparison */}
          <TabsContent value="comparison" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Your Location vs Top 3 Areas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: "Your Location", score: userLocation.score },
                    ...topAreas.map((area) => ({ name: area.name, score: area.score })),
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#a0a0a0" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#a0a0a0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="score" fill="#1db954" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Component Breakdown */}
          <TabsContent value="breakdown" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Component Analysis - Your Location</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2a2a2a" />
                  <PolarAngleAxis dataKey="metric" stroke="#a0a0a0" />
                  <PolarRadiusAxis stroke="#a0a0a0" />
                  <Radar name="Score" dataKey="value" stroke="#1db954" fill="#1db954" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutWrapper>
  )
}
