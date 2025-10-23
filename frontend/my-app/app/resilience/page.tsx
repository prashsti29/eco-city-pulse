"use client"

import LayoutWrapper from "@/app/layout-wrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { AlertTriangle, Shield } from "lucide-react"
import { useEffect, useState } from "react"

type URIData = {
  area: string;
  uri: number;
  encroachment: number;
};

type ComponentData = {
  name: string;
  value: number;
};

type ResilienceMetrics = {
  avgURI: string;
  avgEncroachment: string;
};

const bengaluruFallback = {
  uriData: [
    { area: "Indiranagar", uri: 78.4, encroachment: 12.3 },
    { area: "Koramangala", uri: 75.2, encroachment: 15.8 },
    { area: "Jayanagar", uri: 73.8, encroachment: 14.2 },
    { area: "Whitefield", uri: 68.5, encroachment: 22.1 },
    { area: "Electronic City", uri: 65.3, encroachment: 28.5 }
  ],
  componentData: [
    { name: "Green Cover", value: 45.8 },
    { name: "Water Bodies", value: 58.3 },
    { name: "Temperature", value: 72.1 },
    { name: "Air Quality", value: 65.4 },
    { name: "Infrastructure", value: 68.9 }
  ],
  metrics: { avgURI: "68.5", avgEncroachment: "18.6" }
};

const gurgaonFallback = {
  uriData: [
    { area: "DLF Phase 2", uri: 74.8, encroachment: 18.2 },
    { area: "Sohna Road", uri: 71.5, encroachment: 21.5 },
    { area: "Golf Course", uri: 69.2, encroachment: 24.8 },
    { area: "Cyber Hub", uri: 64.3, encroachment: 32.1 },
    { area: "Old Gurgaon", uri: 58.7, encroachment: 38.5 }
  ],
  componentData: [
    { name: "Green Cover", value: 38.2 },
    { name: "Water Bodies", value: 52.1 },
    { name: "Temperature", value: 58.5 },
    { name: "Air Quality", value: 48.9 },
    { name: "Infrastructure", value: 72.3 }
  ],
  metrics: { avgURI: "64.3", avgEncroachment: "27.0" }
};

export default function ResiliencePage() {
  const [uriData, setUriData] = useState<URIData[]>([]);
  const [componentData, setComponentData] = useState<ComponentData[]>([]);
  const [metrics, setMetrics] = useState<ResilienceMetrics>({ avgURI: "0", avgEncroachment: "0" });
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
    } else {
      setCity("Bengaluru");
    }
  }, []);

  useEffect(() => {
    async function fetchResilience() {
      if (!city) return;
      
      try {
        setLoading(true);
        const cityParam = `?city=${encodeURIComponent(city)}`;
        const res = await fetch(`http://localhost:5555/api/resilience${cityParam}`);
        
        if (!res.ok) throw new Error('Backend unavailable');
        
        const data = await res.json();
        setUriData(data.uriData || []);
        setComponentData(data.componentData || []);
        setMetrics(data.metrics || { avgURI: "0", avgEncroachment: "0" });
      } catch (err) {
        console.warn("Backend unavailable, using fallback data:", err);
        const fallback = city?.toLowerCase().includes('gurgaon') ? gurgaonFallback : bengaluruFallback;
        setUriData(fallback.uriData);
        setComponentData(fallback.componentData);
        setMetrics(fallback.metrics);
      } finally {
        setLoading(false);
      }
    }
    
    fetchResilience();
  }, [city]);

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">
            Loading resilience data {city ? `for ${city}...` : "..."}
          </p>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Urban Resilience — {city}</h1>
          <p className="text-muted-foreground">URI Calculation & Encroachment Detection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Urban Resilience Index</h3>
            </div>
            <p className="text-3xl font-bold text-primary mb-2">{metrics.avgURI}%</p>
            <p className="text-sm text-muted-foreground">{city} Average</p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Encroachment Detection</h3>
            </div>
            <p className="text-3xl font-bold text-red-500 mb-2">{metrics.avgEncroachment}%</p>
            <p className="text-sm text-muted-foreground">Urban Area Encroachment</p>
          </div>
        </div>

        <Tabs defaultValue="uri" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="uri">URI by Area</TabsTrigger>
            <TabsTrigger value="components">Component Breakdown</TabsTrigger>
          </TabsList>

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

          <TabsContent value="components" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Component Breakdown</h3>
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