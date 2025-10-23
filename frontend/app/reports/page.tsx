"use client"

import LayoutWrapper from "@/layout-wrapper"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Filter, Trash2, Edit2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function ReportsPage() {
  const [reports] = useState([
    {
      id: 1,
      title: "Heat Wave Alert - Indiranagar",
      category: "heat",
      severity: "high",
      status: "active",
      date: "Oct 23, 2025",
    },
    {
      id: 2,
      title: "Water Quality Degradation",
      category: "water",
      severity: "medium",
      status: "resolved",
      date: "Oct 22, 2025",
    },
    {
      id: 3,
      title: "Vegetation Loss Detection",
      category: "vegetation",
      severity: "medium",
      status: "active",
      date: "Oct 21, 2025",
    },
  ])

  const categoryColors: Record<string, string> = {
    heat: "bg-red-500/20 text-red-400",
    water: "bg-blue-500/20 text-blue-400",
    vegetation: "bg-green-500/20 text-green-400",
    pollution: "bg-yellow-500/20 text-yellow-400",
    infrastructure: "bg-purple-500/20 text-purple-400",
    other: "bg-gray-500/20 text-gray-400",
  }

  const analyticsData = [
    { category: "Heat", count: 12 },
    { category: "Water", count: 8 },
    { category: "Vegetation", count: 6 },
    { category: "Pollution", count: 4 },
    { category: "Infrastructure", count: 3 },
  ]

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports</h1>
            <p className="text-muted-foreground">Create and manage environmental reports</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Reports List</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          </TabsList>

          {/* Reports List */}
          <TabsContent value="list" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Input placeholder="Search reports..." className="flex-1" />
              <Button variant="outline" gap-2>
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

          {/* Analytics */}
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

          {/* Heatmap */}
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
