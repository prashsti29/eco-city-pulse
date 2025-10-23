"use client"

import LayoutWrapper from "@/layout-wrapper"
import { Button } from "@/components/ui/button"
import { Download, Calendar } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function OverviewPage() {
  const overviewMetrics = [
    {
      label: "Average Livability",
      value: "72.5",
      unit: "%",
      color: "bg-primary/20 text-primary",
    },
    {
      label: "Average Resilience",
      value: "58.3",
      unit: "%",
      color: "bg-green-500/20 text-green-400",
    },
    {
      label: "Vegetation Coverage",
      value: "45.8",
      unit: "%",
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      label: "Heat Level",
      value: "32.4",
      unit: "°C",
      color: "bg-orange-500/20 text-orange-400",
    },
  ]

  const summaryData = [
    { area: "Indiranagar", liv: 78.5, uri: 68.5 },
    { area: "Koramangala", liv: 76.2, uri: 65.2 },
    { area: "Whitefield", liv: 74.8, uri: 62.8 },
    { area: "Jayanagar", liv: 72.3, uri: 60.1 },
    { area: "Malleswaram", liv: 71.5, uri: 58.9 },
  ]

  const handleExportPDF = () => {
    alert("PDF export functionality ready for integration with backend")
  }

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Overview</h1>
            <p className="text-muted-foreground">City-wide environmental summary</p>
          </div>
          <Button onClick={handleExportPDF} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewMetrics.map((metric, idx) => (
            <div key={idx} className={`rounded-2xl p-6 border border-border ${metric.color}`}>
              <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{metric.value}</span>
                <span className="text-sm">{metric.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Last updated: Oct 23, 2025 at 14:32 UTC</span>
          </div>
        </div>

        {/* Summary Chart */}
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
              <Bar dataKey="liv" fill="#1db954" radius={[8, 8, 0, 0]} name="Livability" />
              <Bar dataKey="uri" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Resilience" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Export Section */}
        <div className="bg-secondary/50 rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Export Data</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Generate comprehensive reports and export environmental data for further analysis.
          </p>
          <div className="flex gap-3">
            <Button variant="outline">Export CSV</Button>
            <Button variant="outline">Export JSON</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Generate Full Report</Button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
