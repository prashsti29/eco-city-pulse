"use client"

import LayoutWrapper from "@/app/layout-wrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

export default function WardsPage() {
  const wardData = [
    {
      name: "Indiranagar Ward",
      liv: 78.5,
      uri: 68.5,
      vegetation: 52.3,
      heat: 30.8,
    },
    {
      name: "Koramangala Ward",
      liv: 76.2,
      uri: 65.2,
      vegetation: 48.9,
      heat: 31.5,
    },
    {
      name: "Whitefield Ward",
      liv: 74.8,
      uri: 62.8,
      vegetation: 46.5,
      heat: 32.1,
    },
  ]

  const leaderboard = [
    { rank: 1, ward: "Indiranagar", score: 78.5 },
    { rank: 2, ward: "Koramangala", score: 76.2 },
    { rank: 3, ward: "Whitefield", score: 74.8 },
    { rank: 4, ward: "Jayanagar", score: 72.3 },
    { rank: 5, ward: "Malleswaram", score: 71.5 },
    { rank: 6, ward: "Hebbal", score: 70.2 },
    { rank: 7, ward: "Yeshwanthpur", score: 68.9 },
    { rank: 8, ward: "Yelahanka", score: 67.4 },
    { rank: 9, ward: "Ramamurthy Nagar", score: 66.1 },
    { rank: 10, ward: "Bommanahalli", score: 64.8 },
  ]

  const radarData = [
    { metric: "Livability", value: 78.5, fullMark: 100 },
    { metric: "Resilience", value: 68.5, fullMark: 100 },
    { metric: "Vegetation", value: 52.3, fullMark: 100 },
    { metric: "Heat Index", value: 69.2, fullMark: 100 },
  ]

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Ward Comparison</h1>
          <p className="text-muted-foreground">Compare multiple wards and view leaderboard</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="radar">Radar Chart</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Comparison */}
          <TabsContent value="comparison" className="space-y-4">
            {wardData.map((ward, idx) => (
              <div key={idx} className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold mb-4">{ward.name}</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Livability", value: ward.liv },
                    { label: "Resilience", value: ward.uri },
                    { label: "Vegetation %", value: ward.vegetation },
                    { label: "Heat Index", value: ward.heat },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-2">{metric.label}</p>
                      <p className="text-2xl font-bold text-primary">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Radar Chart */}
          <TabsContent value="radar" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Indiranagar Ward - Multi-metric Analysis</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2a2a2a" />
                  <PolarAngleAxis dataKey="metric" stroke="#a0a0a0" />
                  <PolarRadiusAxis stroke="#a0a0a0" />
                  <Radar name="Score" dataKey="value" stroke="#1db954" fill="#1db954" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Top 10 Wards Leaderboard</h3>
              <div className="space-y-2">
                {leaderboard.map((item) => (
                  <div key={item.rank} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                        {item.rank}
                      </div>
                      <span className="font-medium">{item.ward}</span>
                    </div>
                    <span className="text-lg font-bold text-primary">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutWrapper>
  )
}
