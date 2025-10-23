"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartCardProps {
  title: string
  description: string
  data: Array<{ name: string; value: number }>
}

export default function ChartCard({ title, description, data }: ChartCardProps) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
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
          <Bar dataKey="value" fill="#1db954" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
