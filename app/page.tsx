"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Package,
  Settings,
  FileText,
  Calculator,
  BarChart3,
  Wrench,
  Plus,
  TrendingUp,
  Factory,
  ClipboardList,
  Target,
} from "lucide-react"
import Link from "next/link"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    parts: 0,
    machines: 0,
    projects: 0,
    estimations: 0,
    efficiency: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customersSnap, partsSnap, machinesSnap, projectsSnap, estimationsSnap] = await Promise.all([
          getDocs(collection(db, "customers")),
          getDocs(collection(db, "parts")),
          getDocs(collection(db, "machines")),
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "estimations")),
        ])

        const projectsData = projectsSnap.docs.map((doc) => doc.data())
        const completedProjects = projectsData.filter((p) => p.status === "completed").length
        const totalProjects = projectsData.length
        const efficiency = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0

        setStats({
          customers: customersSnap.size,
          parts: partsSnap.size,
          machines: machinesSnap.size,
          projects: projectsSnap.size,
          estimations: estimationsSnap.size,
          efficiency,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const quickActions = [
    { name: "New Project", icon: Plus, href: "/project", color: "bg-blue-500 hover:bg-blue-600" },
    { name: "Add Customer", icon: Users, href: "/master/customer", color: "bg-green-500 hover:bg-green-600" },
    {
      name: "Create Part Master",
      icon: Package,
      href: "/master/part/part",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      name: "Manual Estimation",
      icon: Calculator,
      href: "/manual-estimation",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    { name: "Weight Calculator", icon: Target, href: "/weight-calculation", color: "bg-red-500 hover:bg-red-600" },
    { name: "Generate Report", icon: FileText, href: "/reports", color: "bg-indigo-500 hover:bg-indigo-600" },
    {
      name: "Material Master",
      icon: Wrench,
      href: "/master/part/material",
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    { name: "System Settings", icon: Settings, href: "/settings", color: "bg-gray-500 hover:bg-gray-600" },
  ]

  const statsCards = [
    { title: "Total Customers", value: loading ? "..." : stats.customers, icon: Users, color: "text-blue-600" },
    { title: "Parts Created", value: loading ? "..." : stats.parts, icon: Package, color: "text-green-600" },
    { title: "Active Machines", value: loading ? "..." : stats.machines, icon: Factory, color: "text-purple-600" },
    { title: "Projects", value: loading ? "..." : stats.projects, icon: ClipboardList, color: "text-orange-600" },
    { title: "Estimations", value: loading ? "..." : stats.estimations, icon: Calculator, color: "text-red-600" },
    {
      title: "Efficiency",
      value: loading ? "..." : `${stats.efficiency}%`,
      icon: TrendingUp,
      color: "text-indigo-600",
    },
  ]

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">AMaCE WebV01 Dashboard</h1>
      </header>

      <div className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to AMaCE WebV01</h2>
          <p className="text-muted-foreground">Advanced Manufacturing Cost Estimation System</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Access frequently used features and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button
                    variant="outline"
                    className={`h-20 w-full flex flex-col items-center justify-center gap-2 ${action.color} text-white border-0 hover:scale-105 transition-transform`}
                  >
                    <action.icon className="h-6 w-6" />
                    <span className="text-xs text-center">{action.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
