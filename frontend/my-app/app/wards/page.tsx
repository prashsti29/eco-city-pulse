"use client"

import LayoutWrapper from "@/app/layout-wrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"

type WardData = {
  name: string;
  liv: number;
  uri: number;
  vegetation: number;
  heat: number;
};

type LeaderboardItem = {
  rank: number;
  ward: string;
  score: number;
};

type RadarData = {
  metric: string;
  value: number;
  fullMark: number;
};

const bengaluruFallback = {
  wardData: [
    { name: "Indiranagar Ward", liv: 85.2, uri: 78.4, vegetation: 62, heat: 24.3 },
    { name: "Koramangala Ward", liv: 82.7, uri: 75.2, vegetation: 58, heat: 25.1 },
    { name: "Jayanagar Ward", liv: 80.4, uri: 73.8, vegetation: 55, heat: 25.8 }
  ],
  leaderboard: [
    { rank: 1, ward: "Indiranagar", score: 85.2 },
    { rank: 2, ward: "Koramangala", score: 82.7 },
    { rank: 3, ward: "Jayanagar", score: 80.4 },
    { rank: 4, ward: "HSR Layout", score: 78.9 },
    { rank: 5, ward: "Whitefield", score: 76.3 },
    { rank: 6, ward: "Malleshwaram", score: 74.8 },
    { rank: 7, ward: "Rajajinagar", score: 72.5 },
    { rank: 8, ward: "BTM Layout", score: 70.1 },
    { rank: 9, ward: "Marathahalli", score: 68.7 },
    { rank: 10, ward: "Electronic City", score: 65.3 }
  ],
  radarData: [
    { metric: "Livability", value: 85.2, fullMark: 100 },
    { metric: "Resilience", value: 78.4, fullMark: 100 },
    { metric: "Vegetation", value: 62, fullMark: 100 },
    { metric: "Temperature", value: 75, fullMark: 100 },
    { metric: "Air Quality", value: 72, fullMark: 100 }
  ]
};

const gurgaonFallback = {
  wardData: [
    { name: "DLF Phase 2", liv: 81.5, uri: 74.8, vegetation: 55, heat: 26.2 },
    { name: "Sohna Road", liv: 78.9, uri: 71.5, vegetation: 52, heat: 27.0 },
    { name: "Golf Course Road", liv: 76.3, uri: 69.2, vegetation: 48, heat: 27.5 }
  ],
  leaderboard: [
    { rank: 1, ward: "DLF Phase 2", score: 81.5 },
    { rank: 2, ward: "Sohna Road", score: 78.9 },
    { rank: 3, ward: "Golf Course Road", score: 76.3 },
    { rank: 4, ward: "Sector 14", score: 74.2 },
    { rank: 5, ward: "Sector 29", score: 71.8 },
    { rank: 6, ward: "MG Road", score: 69.5 },
    { rank: 7, ward: "Cyber Hub", score: 67.3 },
    { rank: 8, ward: "DLF Phase 1", score: 65.1 },
    { rank: 9, ward: "Old Gurgaon", score: 62.8 },
    { rank: 10, ward: "Udyog Vihar", score: 58.7 }
  ],
  radarData: [
    { metric: "Livability", value: 81.5, fullMark: 100 },
    { metric: "Resilience", value: 74.8, fullMark: 100 },
    { metric: "Vegetation", value: 55, fullMark: 100 },
    { metric: "Temperature", value: 68, fullMark: 100 },
    { metric: "Air Quality", value: 58, fullMark: 100 }
  ]
};

export default function WardsPage() {
  const [wardData, setWardData] = useState<WardData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [radarData, setRadarData] = useState<RadarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    const storedCity = localStorage.getItem("selectedCity");
    if (storedCity) {
      try {
        const parsed = JSON.parse(storedCity);
        setCity(parsed.name || parsed);
      } catch {
        setCity(storedCity);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchWards() {
      try {
        setLoading(true);
        const cityParam = city ? `?city=${encodeURIComponent(city)}` : "";
        const res = await fetch(`http://localhost:5555/api/wards${cityParam}`);
        
        if (!res.ok) throw new Error('Backend unavailable');
        
        const data = await res.json();
        setWardData(data.wardData || []);
        setLeaderboard(data.leaderboard || []);
        setRadarData(data.radarData || []);
      } catch (err) {
        console.warn("Backend unavailable, using fallback data:", err);
        const fallback = city?.toLowerCase().includes('gurgaon') ? gurgaonFallback : bengaluruFallback;
        setWardData(fallback.wardData);
        setLeaderboard(fallback.leaderboard);
        setRadarData(fallback.radarData);
      } finally {
        setLoading(false);
      }
    }
    
    if (city) {
      fetchWards();
    }
  }, [city]);

  if (loading || !city) {
    return (
      <LayoutWrapper>
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">
            Loading wards data {city ? `for ${city}...` : "..."}
          </p>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ward Comparison — {city}</h1>
          <p className="text-muted-foreground">Compare multiple wards and view leaderboard</p>
        </div>

        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="radar">Radar Chart</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

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

          <TabsContent value="radar" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">{wardData[0]?.name || "Ward"} - Multi-metric Analysis</h3>
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