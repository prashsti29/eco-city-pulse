"use client"

import LayoutWrapper from "@/layout-wrapper"
import MetricCard from "@/components/metric-card"
import ChartCard from "@/components/chart-card"
import { Activity, Droplets, Leaf, Thermometer, AlertTriangle } from "lucide-react"

export default function DashboardPage() {
  // Mock data - strictly backend-supported metrics only
  const metrics = [
    {
      label: "Livability Score",
      value: "72.5",
      unit: "%",
      icon: Activity,
      color: "text-primary",
      trend: "+2.3%",
    },
    {
      label: "Green Coverage (NDVI)",
      value: "45.8",
      unit: "%",
      icon: Leaf,
      color: "text-green-500",
      trend: "+1.2%",
    },
    {
      label: "Water Quality (MNDWI)",
      value: "58.3",
      unit: "%",
      icon: Droplets,
      color: "text-blue-500",
      trend: "-0.5%",
    },
    {
      label: "Avg Temperature (LST)",
      value: "32.4",
      unit: "°C",
      icon: Thermometer,
      color: "text-orange-500",
      trend: "+0.8°C",
    },
    {
      label: "Heat Vulnerability Index",
      value: "38.2",
      unit: "%",
      icon: AlertTriangle,
      color: "text-red-500",
      trend: "+1.1%",
    },
  ]

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Real-time environmental metrics for Bengaluru</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((metric, idx) => (
            <MetricCard key={idx} {...metric} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="NDVI & NDBI Comparison"
            description="Vegetation vs Built-up Index"
            data={[
              { name: "NDVI", value: 45.8 },
              { name: "NDBI", value: 38.2 },
            ]}
          />
          <ChartCard
            title="Surface Water Quality (MNDWI)"
            description="Water body health index"
            data={[
              { name: "Quality", value: 58.3 },
              { name: "Target", value: 70 },
            ]}
          />
        </div>

        {/* Component Breakdown */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Component Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "NDVI", value: "45.8%", color: "bg-green-500/20 text-green-400" },
              { label: "MNDWI", value: "58.3%", color: "bg-blue-500/20 text-blue-400" },
              { label: "LST", value: "32.4°C", color: "bg-orange-500/20 text-orange-400" },
              { label: "NDBI", value: "38.2%", color: "bg-red-500/20 text-red-400" },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${item.color}`}>
                <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                <p className="text-xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
