"use client"

import LayoutWrapper from "@/app/layout-wrapper"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Filter, Trash2, Edit2, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type Report = {
  id: number;
  title: string;
  category: string;
  severity: string;
  status: string;
  date: string;
};

type AnalyticsData = {
  category: string;
  count: number;
};

const bengaluruFallback = {
  reports: [
    { id: 1, title: "High temperature in Whitefield", category: "heat", severity: "high", status: "active", date: "2025-10-28" },
    { id: 2, title: "Lake pollution detected in Bellandur", category: "water", severity: "high", status: "active", date: "2025-10-27" },
    { id: 3, title: "Vegetation loss in Electronic City", category: "vegetation", severity: "medium", status: "resolved", date: "2025-10-25" },
    { id: 4, title: "Air quality concerns in Marathahalli", category: "pollution", severity: "medium", status: "active", date: "2025-10-24" },
    { id: 5, title: "Park encroachment in HSR Layout", category: "encroachment", severity: "high", status: "active", date: "2025-10-23" }
  ],
  analytics: [
    { category: "heat", count: 8 },
    { category: "water", count: 12 },
    { category: "vegetation", count: 6 },
    { category: "pollution", count: 10 },
    { category: "encroachment", count: 7 }
  ]
};

const gurgaonFallback = {
  reports: [
    { id: 1, title: "Extreme heat in DLF Phase 1", category: "heat", severity: "high", status: "active", date: "2025-10-28" },
    { id: 2, title: "Water scarcity in Sectors 14-15", category: "water", severity: "high", status: "active", date: "2025-10-27" },
    { id: 3, title: "Green belt degradation on Golf Course Road", category: "vegetation", severity: "medium", status: "active", date: "2025-10-26" },
    { id: 4, title: "Construction dust pollution in Cyber Hub", category: "pollution", severity: "high", status: "active", date: "2025-10-25" },
    { id: 5, title: "Illegal construction in Aravalli Hills", category: "encroachment", severity: "high", status: "active", date: "2025-10-24" }
  ],
  analytics: [
    { category: "heat", count: 15 },
    { category: "water", count: 18 },
    { category: "vegetation", count: 9 },
    { category: "pollution", count: 22 },
    { category: "encroachment", count: 14 }
  ]
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
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
    async function fetchReports() {
      try {
        setLoading(true);
        const cityParam = city ? `?city=${encodeURIComponent(city)}` : "";
        const res = await fetch(`http://localhost:5555/api/reports${cityParam}`);
        
        if (!res.ok) throw new Error('Backend unavailable');
        
        const data = await res.json();
        setReports(data.reports || []);
        setAnalyticsData(data.analytics || []);
      } catch (err) {
        console.warn("Backend unavailable, using fallback data:", err);
        const fallback = city?.toLowerCase().includes('gurgaon') ? gurgaonFallback : bengaluruFallback;
        setReports(fallback.reports);
        setAnalyticsData(fallback.analytics);
      } finally {
        setLoading(false);
      }
    }
    
    if (city) {
      fetchReports();
    }
  }, [city]);

  const categoryColors: Record<string, string> = {
    heat: "bg-red-500/20 text-red-400",
    water: "bg-blue-500/20 text-blue-400",
    vegetation: "bg-green-500/20 text-green-400",
    pollution: "bg-yellow-500/20 text-yellow-400",
    infrastructure: "bg-purple-500/20 text-purple-400",
    encroachment: "bg-yellow-500/20 text-yellow-400",
    other: "bg-gray-500/20 text-gray-400",
  }

  if (loading || !city) {
    return (
      <LayoutWrapper>
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">
            Loading reports {city ? `for ${city}...` : "..."}
          </p>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports — {city}</h1>
            <p className="text-muted-foreground">Create and manage environmental reports</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white gap-2">
              <AlertTriangle className="w-4 h-4" />
              Report Encroachment
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" />
              New Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Reports List</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Input placeholder="Search reports..." className="flex-1" />
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-card rounded-2xl p-4 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[report.category]}`}
                        >
                          {report.category}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            report.severity === "high"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {report.severity}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            report.status === "active" ? "bg-primary/20 text-primary" : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">{report.title}</h3>
                      <p className="text-xs text-muted-foreground">{report.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Reports by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="category" stroke="#a0a0a0" />
                  <YAxis stroke="#a0a0a0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#1db954" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Report Heatmap</h3>
              <div className="w-full h-64 bg-gradient-to-br from-secondary to-background rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Heatmap visualization ready for integration</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutWrapper>
  )
}