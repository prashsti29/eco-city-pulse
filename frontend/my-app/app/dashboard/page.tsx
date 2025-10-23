"use client"

import LayoutWrapper from "@/app/layout-wrapper"
import MetricCard from "@/components/metric-card"
import ChartCard from "@/components/chart-card"
import { Activity, Droplets, Leaf, Thermometer, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

type Metric = {
  label: string;
  value: string;
  unit: string;
  trend: string;
};

type BreakdownItem = {
  label: string;
  value: string;
};

type ChartData = {
  name: string;
  value: number;
};

// Fallback data for Bengaluru
const bengaluruData = {
  metrics: [
    { label: "Livability Score", value: "72.3", unit: "/100", trend: "+2.1%" },
    { label: "Green Coverage", value: "45.8", unit: "%", trend: "+1.3%" },
    { label: "Water Quality", value: "58.3", unit: "MNDWI", trend: "-0.8%" },
    { label: "Avg Temperature", value: "26.4", unit: "°C", trend: "+0.5°C" },
    { label: "Urban Resilience", value: "68.5", unit: "URI", trend: "+1.7%" }
  ],
  breakdown: [
    { label: "Vegetation", value: "45.8%" },
    { label: "Water Bodies", value: "12.3%" },
    { label: "Built-up Area", value: "38.2%" },
    { label: "Bare Land", value: "3.7%" }
  ],
  charts: {
    comparison: [
      { name: "Jan", value: 0.42 },
      { name: "Feb", value: 0.45 },
      { name: "Mar", value: 0.48 },
      { name: "Apr", value: 0.46 },
      { name: "May", value: 0.44 },
      { name: "Jun", value: 0.47 }
    ],
    waterQuality: [
      { name: "Jan", value: 0.58 },
      { name: "Feb", value: 0.56 },
      { name: "Mar", value: 0.59 },
      { name: "Apr", value: 0.57 },
      { name: "May", value: 0.58 },
      { name: "Jun", value: 0.60 }
    ]
  }
};

// Fallback data for Gurgaon
const gurgaonData = {
  metrics: [
    { label: "Livability Score", value: "68.7", unit: "/100", trend: "+1.8%" },
    { label: "Green Coverage", value: "38.2", unit: "%", trend: "+0.9%" },
    { label: "Water Quality", value: "52.1", unit: "MNDWI", trend: "-1.2%" },
    { label: "Avg Temperature", value: "28.1", unit: "°C", trend: "+0.7°C" },
    { label: "Urban Resilience", value: "64.3", unit: "URI", trend: "+1.4%" }
  ],
  breakdown: [
    { label: "Vegetation", value: "38.2%" },
    { label: "Water Bodies", value: "8.7%" },
    { label: "Built-up Area", value: "48.5%" },
    { label: "Bare Land", value: "4.6%" }
  ],
  charts: {
    comparison: [
      { name: "Jan", value: 0.38 },
      { name: "Feb", value: 0.40 },
      { name: "Mar", value: 0.42 },
      { name: "Apr", value: 0.39 },
      { name: "May", value: 0.37 },
      { name: "Jun", value: 0.41 }
    ],
    waterQuality: [
      { name: "Jan", value: 0.52 },
      { name: "Feb", value: 0.50 },
      { name: "Mar", value: 0.53 },
      { name: "Apr", value: 0.51 },
      { name: "May", value: 0.52 },
      { name: "Jun", value: 0.54 }
    ]
  }
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [charts, setCharts] = useState<{ comparison: ChartData[], waterQuality: ChartData[] }>({
    comparison: [],
    waterQuality: []
  });
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
    async function fetchDashboard() {
      try {
        setLoading(true);
        const cityParam = city ? `?city=${encodeURIComponent(city)}` : "";
        const res = await fetch(`http://localhost:5555/api/dashboard${cityParam}`);
        
        if (!res.ok) throw new Error('Backend unavailable');
        
        const data = await res.json();
        setMetrics(data.metrics || []);
        setBreakdown(data.breakdown || []);
        setCharts(data.charts || { comparison: [], waterQuality: [] });
      } catch (err) {
        console.warn("Backend unavailable, using fallback data:", err);
        // Use fallback data based on city
        const fallbackData = city?.toLowerCase().includes('gurgaon') ? gurgaonData : bengaluruData;
        setMetrics(fallbackData.metrics);
        setBreakdown(fallbackData.breakdown);
        setCharts(fallbackData.charts);
      } finally {
        setLoading(false);
      }
    }

    if (city) {
      fetchDashboard();
    }
  }, [city]);

  const icons = [Activity, Leaf, Droplets, Thermometer, AlertTriangle];
  const colors = ["text-primary", "text-green-500", "text-blue-500", "text-orange-500", "text-red-500"];
  const bgColors = [
    "bg-green-500/20 text-green-400",
    "bg-blue-500/20 text-blue-400",
    "bg-orange-500/20 text-orange-400",
    "bg-red-500/20 text-red-400"
  ];

  if (loading || !city) {
    return (
      <LayoutWrapper>
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">
            Loading dashboard data {city ? `for ${city}...` : "..."}
          </p>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard — {city}</h1>
          <p className="text-muted-foreground">
            Real-time environmental metrics for {city}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((metric, idx) => (
            <MetricCard
              key={idx}
              {...metric}
              icon={icons[idx]}
              color={colors[idx]}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="NDVI & NDBI Comparison"
            description="Vegetation vs Built-up Index"
            data={charts.comparison}
          />
          <ChartCard
            title="Surface Water Quality (MNDWI)"
            description="Water body health index"
            data={charts.waterQuality}
          />
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Component Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {breakdown.map((item, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${bgColors[idx % bgColors.length]}`}>
                <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                <p className="text-xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}