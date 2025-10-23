"use client"

import type { ReactNode } from "react"
import Navbar from "@/components/navbar"
import MapPanel from "@/components/map-panel"

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Map */}
      <div className="w-[35%] h-screen border-r border-border overflow-hidden">
        <MapPanel />
      </div>

      {/* Right Panel - Content */}
      <div className="w-[65%] h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-secondary/5">{children}</main>
      </div>
    </div>
  )
}
