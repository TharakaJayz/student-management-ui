"use client"

import { useEffect, useState } from "react"
import { BookOpen, GraduationCap, Home, Settings, Users } from "lucide-react"
import LeftSidebar from "@/app/common/layout/LeftSidebar"
import MobileSidebar from "@/app/common/layout/MobileSidebar"
import TopBar from "@/app/common/layout/TopBar"

const primaryNav = [
  { title: "Dashboard", icon: Home, href: "/dashboard" },
  { title: "Students", icon: GraduationCap, href: "/students" },
  { title: "Classes", icon: BookOpen, href: "/classes" },
  { title: "Teachers", icon: Users, href: "/teachers" },
  { title: "Institute Settings", icon: Settings, href: "/institute-settings" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1000px)")

    const handleViewportChange = () => {
      if (mediaQuery.matches) {
        setIsSidebarOpen((prev) => (prev ? false : prev))
      }
    }

    handleViewportChange()
    mediaQuery.addEventListener("change", handleViewportChange)

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange)
    }
  }, [])

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen((prev) => !prev)
      return
    }
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <div className="isolate min-h-screen bg-background text-card-foreground">
      <TopBar onToggleSidebar={handleToggleSidebar} />
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        navItems={primaryNav}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex items-start pt-16">
        <LeftSidebar
          isSidebarOpen={isSidebarOpen}
          navItems={primaryNav}
          onToggleSidebar={() => {
            console.log("menu clicked",isSidebarOpen)
            if (window.innerWidth < 768) {
              setIsMobileSidebarOpen(false)
              return
            }
            if (!isSidebarOpen) {
              setIsSidebarOpen((prev) => !prev)
            }
          }}
        />
        <div
          className={`hidden shrink-0 transition-[width] duration-200 md:block ${
            isSidebarOpen ? "w-72" : "w-16"
          }`}
          aria-hidden
        />

        <main className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-7">{children}</main>
      </div>
    </div>
  )
}