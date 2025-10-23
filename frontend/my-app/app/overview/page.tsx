"use client";

import LayoutWrapper from "@/app/layout-wrapper";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

type Metric = {
  label: string;
  value: string | number;
  unit: string;
  color?: string;
};

type SummaryItem = {
  area: string;
  liv: number;
  uri: number;
};

const bengaluruFallback = {
  metrics: [
    { label: "Overall Livability", value: "72.3", unit: "/100", color: "bg-primary/10" },
    { label: "Urban Resilience", value: "68.5", unit: "URI", color: "bg-green-500/10" },
    { label: "Green Cover", value: "45.8", unit: "%", color: "bg-emerald-500/10" },
    { label: "Water Quality", value: "58.3", unit: "MNDWI", color: "bg-blue-500/10" }
  ],
  summary: [
    { area: "Indiranagar", liv: 85.2, uri: 78.4 },
    { area: "Koramangala", liv: 82.7, uri: 75.2 },
    { area: "Jayanagar", liv: 80.4, uri: 73.8 }
  ],
  lastUpdated: new Date().toISOString()
};

const gurgaonFallback = {
  metrics: [
    { label: "Overall Livability", value: "68.7", unit: "/100", color: "bg-primary/10" },
    { label: "Urban Resilience", value: "64.3", unit: "URI", color: "bg-green-500/10" },
    { label: "Green Cover", value: "38.2", unit: "%", color: "bg-emerald-500/10" },
    { label: "Water Quality", value: "52.1", unit: "MNDWI", color: "bg-blue-500/10" }
  ],
  summary: [
    { area: "DLF Phase 2", liv: 81.5, uri: 74.8 },
    { area: "Sohna Road", liv: 78.9, uri: 71.5 },
    { area: "Golf Course", liv: 76.3, uri: 69.2 }
  ],
  lastUpdated: new Date().toISOString()
};

export default function OverviewPage() {
  const [overviewMetrics, setOverviewMetrics] = useState<Metric[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState("");
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
    async function fetchOverview() {
      try {
        setLoading(true);
        const cityParam = city ? `?city=${encodeURIComponent(city)}` : "";
        const res = await fetch(`http://localhost:5555/api/overview${cityParam}`);

        if (!res.ok) throw new Error('Backend unavailable');

        const data = await res.json();
        setOverviewMetrics(data.metrics || []);
        setSummaryData(data.summary || []);
        setLastUpdated(data.lastUpdated || new Date().toISOString());
      } catch (err) {
        console.warn("Backend unavailable, using fallback data:", err);
        const fallback = city?.toLowerCase().includes('gurgaon') ? gurgaonFallback : bengaluruFallback;
        setOverviewMetrics(fallback.metrics);
        setSummaryData(fallback.summary);
        setLastUpdated(fallback.lastUpdated);
      } finally {
        setLoading(false);
      }
    }

    if (city) {
      fetchOverview();
    }
  }, [city]);

  const handleExportPDF = () => {
    alert("PDF export functionality ready for integration with backend");
  };

  if (loading || !city) {
    return (
      <LayoutWrapper>
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">
            Loading overview data {city ? `for ${city}...` : "..."}
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
            <h1 className="text-3xl font-bold mb-2">Overview — {city}</h1>
            <p className="text-muted-foreground">City-wide environmental summary</p>
          </div>
          <Button
            onClick={handleExportPDF}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewMetrics.map((metric, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 border border-border ${metric.color || ""}`}
            >
              <p className="text-sm text-muted-foreground mb-2">
                {metric.label}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{metric.value}</span>
                <span className="text-sm">{metric.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              Last updated:{" "}
              {new Date(lastUpdated).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Top Areas Summary</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryData}>
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
              <Bar
                dataKey="liv"
                fill="#1db954"
                radius={[8, 8, 0, 0]}
                name="Livability"
              />
              <Bar
                dataKey="uri"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="Resilience"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-secondary/50 rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Export Data</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Generate comprehensive reports and export environmental data for further analysis.
          </p>
          <div className="flex gap-3">
            <Button variant="outline">Export CSV</Button>
            <Button variant="outline">Export JSON</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Generate Full Report
            </Button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}