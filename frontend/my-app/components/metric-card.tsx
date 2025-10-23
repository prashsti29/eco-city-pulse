import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string
  unit: string
  icon: LucideIcon
  color: string
  trend: string
}

export default function MetricCard({ label, value, unit, icon: Icon, color, trend }: MetricCardProps) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg bg-primary/10 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-green-500">{trend}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}
