"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { FirebaseService } from "@/lib/firebase-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2, BarChart3, Database, Users, FolderOpen, Settings } from "lucide-react"

interface FormData {
  customerName: string
  projectId: string
  projectDrawingNo: string
  partName: string
  drawingNumber: string
  operationName: string
}

interface ChartData {
  processName: string
  cycleTime: number
}

interface Customer {
  id: string
  name?: string
  customerName?: string
  companyName?: string
  firstName?: string
  lastName?: string
}

interface Project {
  id: string
  projectId?: string
  projectName?: string
  name?: string
}

interface Process {
  id: string
  processName?: string
  operationName?: string
  cycleTime?: number
  customerName?: string
  projectId?: string
  partName?: string
  drawingNumber?: string
}

// Helper function to safely convert Firebase data to array
const normalizeFirebaseData = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data
  }
  if (data && typeof data === "object" && data.data && Array.isArray(data.data)) {
    return data.data
  }
  if (data && typeof data === "object") {
    return Object.values(data)
  }
  return []
}

// Helper function to get customer display name
const getCustomerDisplayName = (customer: Customer): string => {
  if (customer.name && customer.name.trim()) return customer.name.trim()
  if (customer.customerName && customer.customerName.trim()) return customer.customerName.trim()
  if (customer.companyName && customer.companyName.trim()) return customer.companyName.trim()
  if (customer.firstName && customer.lastName) {
    return `${customer.firstName.trim()} ${customer.lastName.trim()}`.trim()
  }
  if (customer.firstName && customer.firstName.trim()) return customer.firstName.trim()
  return "Unnamed Customer"
}

// Helper function to get customer select value
const getCustomerSelectValue = (customer: Customer): string => {
  return customer.id || `customer_${Math.random().toString(36).substr(2, 9)}`
}

export default function ProcessChart() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    projectId: "",
    projectDrawingNo: "",
    partName: "",
    drawingNumber: "",
    operationName: "",
  })

  const [chartData, setChartData] = useState<ChartData[]>([])
  const [showChart, setShowChart] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Database data
  const [customers, setCustomers] = useState<Customer[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [operations, setOperations] = useState<string[]>([])
  const [dbStats, setDbStats] = useState({
    customers: 0,
    projects: 0,
    processes: 0,
  })

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true)

        const [customersData, projectsData, processesData] = await Promise.all([
          FirebaseService.getAll("customers"),
          FirebaseService.getAll("projects"),
          FirebaseService.getAll("processes"),
        ])

        // Normalize data to arrays
        const normalizedCustomers = normalizeFirebaseData(customersData)
        const normalizedProjects = normalizeFirebaseData(projectsData)
        const normalizedProcesses = normalizeFirebaseData(processesData)

        setCustomers(normalizedCustomers)
        setProjects(normalizedProjects)

        // Extract unique operations from processes
        const uniqueOperations = [
          ...new Set(
            normalizedProcesses.map((process: Process) => process.operationName || process.processName).filter(Boolean),
          ),
        ]
        setOperations(uniqueOperations)

        // Update database stats
        setDbStats({
          customers: normalizedCustomers.length,
          projects: normalizedProjects.length,
          processes: normalizedProcesses.length,
        })
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load data from database",
          variant: "destructive",
        })
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateChart = async () => {
    // Validate required fields
    if (!formData.customerName || !formData.operationName) {
      toast({
        title: "Validation Error",
        description: "Please fill in Customer Name and Operation Name (required fields)",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Fetch process data from Firebase based on form criteria
      const processesData = await FirebaseService.getAll("processes")
      const normalizedProcesses = normalizeFirebaseData(processesData)

      // Filter processes based on form data
      const filteredProcesses = normalizedProcesses.filter((process: Process) => {
        let matches = true

        if (formData.customerName && formData.customerName !== "no_customers") {
          matches = matches && process.customerName === formData.customerName
        }

        if (formData.projectId && formData.projectId !== "no_projects") {
          matches = matches && process.projectId === formData.projectId
        }

        if (formData.operationName && formData.operationName !== "no_operations") {
          matches =
            matches &&
            (process.operationName === formData.operationName || process.processName === formData.operationName)
        }

        if (formData.partName) {
          matches = matches && process.partName?.toLowerCase().includes(formData.partName.toLowerCase())
        }

        if (formData.drawingNumber) {
          matches = matches && process.drawingNumber === formData.drawingNumber
        }

        return matches
      })

      if (filteredProcesses.length === 0) {
        toast({
          title: "No Data Found",
          description:
            "No process data found matching the specified criteria. Please check your database or try different filters.",
          variant: "destructive",
        })
        setShowChart(false)
        return
      }

      // Transform data for chart
      const transformedData: ChartData[] = filteredProcesses.map((process: Process) => ({
        processName: process.processName || process.operationName || "Unknown Process",
        cycleTime: process.cycleTime || 0,
      }))

      setChartData(transformedData)
      setShowChart(true)

      toast({
        title: "Chart Generated",
        description: `Successfully generated chart with ${transformedData.length} process records`,
      })
    } catch (error) {
      console.error("Error generating chart:", error)
      toast({
        title: "Error",
        description: "Failed to generate chart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      customerName: "",
      projectId: "",
      projectDrawingNo: "",
      partName: "",
      drawingNumber: "",
      operationName: "",
    })
    setChartData([])
    setShowChart(false)
  }

  const saveChart = async () => {
    if (chartData.length === 0) {
      toast({
        title: "No Data",
        description: "No chart data to save",
        variant: "destructive",
      })
      return
    }

    try {
      const chartReport = {
        ...formData,
        chartData,
        totalProcesses: chartData.length,
        averageCycleTime: chartData.reduce((sum, item) => sum + item.cycleTime, 0) / chartData.length,
        totalCycleTime: chartData.reduce((sum, item) => sum + item.cycleTime, 0),
        createdAt: new Date().toISOString(),
      }

      await FirebaseService.create("chart_reports", chartReport)

      toast({
        title: "Chart Saved",
        description: "Chart data has been saved to database successfully",
      })
    } catch (error) {
      console.error("Error saving chart:", error)
      toast({
        title: "Error",
        description: "Failed to save chart data",
        variant: "destructive",
      })
    }
  }

  const chartSummary =
    chartData.length > 0
      ? {
          totalProcesses: chartData.length,
          averageCycleTime:
            Math.round((chartData.reduce((sum, item) => sum + item.cycleTime, 0) / chartData.length) * 100) / 100,
          totalCycleTime: chartData.reduce((sum, item) => sum + item.cycleTime, 0),
        }
      : null

  return (
    <div className="flex-1 space-y-6 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Process Chart Generator</h2>
          <p className="text-muted-foreground">Generate process analysis charts based on manufacturing data</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Chart Analysis
        </Badge>
      </div>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Customers: {dataLoading ? "..." : dbStats.customers}</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-green-500" />
              <span className="text-sm">Projects: {dataLoading ? "..." : dbStats.projects}</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Processes: {dataLoading ? "..." : dbStats.processes}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Parameters</CardTitle>
          <CardDescription>
            Enter the parameters to generate your process chart. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Select
                value={formData.customerName}
                onValueChange={(value) => handleInputChange("customerName", value)}
                disabled={dataLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={dataLoading ? "Loading customers..." : "Select customer"} />
                </SelectTrigger>
                <SelectContent>
                  {customers.length === 0 ? (
                    <SelectItem value="no_customers" disabled>
                      No customers found in database
                    </SelectItem>
                  ) : (
                    customers.map((customer) => (
                      <SelectItem key={customer.id} value={getCustomerDisplayName(customer)}>
                        {getCustomerDisplayName(customer)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Project ID */}
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => handleInputChange("projectId", value)}
                disabled={dataLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={dataLoading ? "Loading projects..." : "Select project"} />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 ? (
                    <SelectItem value="no_projects" disabled>
                      No projects found in database
                    </SelectItem>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.projectId || project.id}>
                        {project.projectId || project.id} - {project.projectName || project.name || "Unnamed Project"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Project Drawing No */}
            <div className="space-y-2">
              <Label htmlFor="projectDrawingNo">Project Drawing No</Label>
              <Input
                id="projectDrawingNo"
                value={formData.projectDrawingNo}
                onChange={(e) => handleInputChange("projectDrawingNo", e.target.value)}
                placeholder="Enter project drawing number"
              />
            </div>

            {/* Part Name */}
            <div className="space-y-2">
              <Label htmlFor="partName">Part Name</Label>
              <Input
                id="partName"
                value={formData.partName}
                onChange={(e) => handleInputChange("partName", e.target.value)}
                placeholder="Enter part name"
              />
            </div>

            {/* Drawing Number */}
            <div className="space-y-2">
              <Label htmlFor="drawingNumber">Drawing Number</Label>
              <Input
                id="drawingNumber"
                value={formData.drawingNumber}
                onChange={(e) => handleInputChange("drawingNumber", e.target.value)}
                placeholder="Enter drawing number"
              />
            </div>

            {/* Operation Name */}
            <div className="space-y-2">
              <Label htmlFor="operationName">Operation Name *</Label>
              <Select
                value={formData.operationName}
                onValueChange={(value) => handleInputChange("operationName", value)}
                disabled={dataLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={dataLoading ? "Loading operations..." : "Select operation"} />
                </SelectTrigger>
                <SelectContent>
                  {operations.length === 0 ? (
                    <SelectItem value="no_operations" disabled>
                      No operations found in database
                    </SelectItem>
                  ) : (
                    operations.map((operation) => (
                      <SelectItem key={operation} value={operation}>
                        {operation}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex gap-4">
            <Button onClick={generateChart} disabled={loading || dataLoading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Chart"
              )}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
            {showChart && (
              <Button variant="secondary" onClick={saveChart}>
                Save Chart
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart Display */}
      {showChart && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Process Name vs Cycle Time
            </CardTitle>
            <CardDescription>Analysis of cycle times across different manufacturing processes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ChartContainer
                config={{
                  cycleTime: {
                    label: "Cycle Time (min)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="processName" angle={-45} textAnchor="end" height={100} fontSize={12} />
                    <YAxis label={{ value: "Cycle Time (min)", angle: -90, position: "insideLeft" }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="cycleTime" fill="var(--color-cycleTime)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Chart Summary */}
            {chartSummary && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{chartSummary.totalProcesses}</div>
                    <p className="text-xs text-muted-foreground">Total Processes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{chartSummary.averageCycleTime} min</div>
                    <p className="text-xs text-muted-foreground">Average Cycle Time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{chartSummary.totalCycleTime} min</div>
                    <p className="text-xs text-muted-foreground">Total Cycle Time</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
