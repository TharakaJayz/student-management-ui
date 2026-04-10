"use client"

import { useState } from "react"
import { BookOpen, GraduationCap, Home, Settings, Users } from "lucide-react"
import LeftSidebar from "@/app/common/layout/LeftSidebar"
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

  return (
    <div className="min-h-screen bg-background text-card-foreground">
      <TopBar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      <div className="flex">
        <LeftSidebar
          isSidebarOpen={isSidebarOpen}
          navItems={primaryNav}
          onToggleSidebar={() => !isSidebarOpen ? setIsSidebarOpen((prev) => !prev) : null}
        />

        <main className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-7">{children}</main>
      </div>
    </div>
  )
}