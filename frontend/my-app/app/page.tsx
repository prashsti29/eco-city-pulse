"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const selectedCity = localStorage.getItem("selectedCity")
    if (selectedCity) {
      router.push("/dashboard")
    } else {
      router.push("/onboarding")
    }
  }, [router])

  return null
}
