"use client"

import LayoutWrapper from "@/app/layout-wrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { useEffect, useState } from "react"

type Area = {
  rank: number;
  name: string;
  score: string;
  ndvi: string;
  mndwi: string;
  lst: string;
  ndbi: string;
};

type UserLocation = {
  name: string;
  score: string;
  ndvi: string;
  mndwi: string;
  lst: string;
  ndbi: string;
};

type RadarData = {
  metric: string;
  value: number;
  fullMark: number;
};

const bengaluruFallback = {
  topAreas: [
    { rank: 1, name: "Indiranagar", score: "85.2", ndvi: "0.62", mndwi: "0.45", lst: "24.3°C", ndbi: "0.28" },
    { rank: 2, name: "Koramangala", score: "82.7", ndvi: "0.58", mndwi: "0.42", lst: "25.1°C", ndbi: "0.31" },
    { rank: 3, name: "Jayanagar", score: "80.4", ndvi: "0.55", mndwi: "0.40", lst: "25.8°C", ndbi: "0.33" }
  ],
  userLocation: { name: "Your Location", score: "72.3", ndvi: "0.48", mndwi: "0.38", lst: "26.4°C", ndbi: "0.38" },
  radarData: [
    { metric: "NDVI", value: 48, fullMark: 100 },
    { metric: "MNDWI", value: 38, fullMark: 100 },
    { metric: "Temperature", value: 65, fullMark: 100 },
    { metric: "NDBI", value: 42, fullMark: 100 }
  ]
};

const gurgaonFallback = {
  topAreas: [
    { rank: 1, name: "DLF Phase 2", score: "81.5", ndvi: "0.55", mndwi: "0.38", lst: "26.2°C", ndbi: "0.35" },
    { rank: 2, name: "Sohna Road", score: "78.9", ndvi: "0.52", mndwi: "0.36", lst: "27.0°C", ndbi: "0.38" },
    { rank: 3, name: "Golf Course Road", score: "76.3", ndvi: "0.48", mndwi: "0.34", lst: "27.5°C", ndbi: "0.41" }
  ],
  userLocation: { name: "Your Location", score: "68.7", ndvi: "0.42", mndwi: "0.32", lst: "28.1°C", ndbi: "0.45" },
  radarData: [
    { metric: "NDVI", value: 42, fullMark: 100 },
    { metric: "MNDWI", value: 32, fullMark: 100 },
    { metric: "Temperature", value: 58, fullMark: 100 },
    { metric: "NDBI", value: 55, fullMark: 100 }
  ]
};

export default function LivabilityPage() {
  const [topAreas, setTopAreas] = useState<Area[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
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
    async function fetchLivability() {
      try {
        setLoading(true);
        const cityParam = city ? `?city=${encodeURIComponent(city)}` : "";
        const res = await fetch(`http://localhost:5555/api/livability/analysis${cityParam}`);
        
        if (!res.ok) throw new Error('Backend unavailable');
        
        const data = await res.json();
        setTopAreas(data.topAreas || []);
        setUserLocation(data.userLocation);
        setRadarData(data.radarData || []);
      } catch (err) {
        console.warn("Backend unavailable, using fallback data:", err);
        const fallback = city?.toLowerCase().includes('gurgaon') ? gurgaonFallback : bengaluruFallback;
        setTopAreas(fallback.topAreas);
        setUserLocation(fallback.userLocation);
        setRadarData(fallback.radarData);
      } finally {
        setLoading(false);
      }
    }
    
    if (city) {
      fetchLivability();
    }
  }, [city]);

  if (loading || !city) {
    return (
      <LayoutWrapper>
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">
            Loading livability data {city ? `for ${city}...` : "..."}
          </p>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Livability Analysis — {city}</h1>
          <p className="text-muted-foreground">Top 3 Most Livable Areas in {city}</p>
        </div>

        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ranking">Top 3 Areas</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="breakdown">Component Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="ranking" className="space-y-4">
            {topAreas.map((area) => (
              <div key={area.rank} className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors">
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
                    { label: "NDBI", value: area.ndbi }
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

          <TabsContent value="comparison" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Your Location vs Top 3 Areas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: userLocation?.name || "Your Location", score: parseFloat(userLocation?.score || "0") },
                  ...topAreas.map((area) => ({ name: area.name, score: parseFloat(area.score) }))
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#a0a0a0" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#a0a0a0" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px" }} />
                  <Bar dataKey="score" fill="#1db954" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

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