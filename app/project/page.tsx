"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { FirebaseService } from "@/lib/firebase-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FolderPlus,
  FileText,
  FolderOpen,
  FolderX,
  Plus,
  Settings,
  Save,
  Edit,
  Eye,
  Trash2,
  RotateCcw,
  Upload,
  Download,
  X,
  Menu,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  Calculator,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface PartSize {
  dimension: string
  value: number
  unit: string
}

interface PartMaster {
  drawingNumber: string
  name: string
  material: string
  sizes: PartSize[]
  ratePerKg: number
  scrapRatePerKg: number
  status: string
}

interface Operation {
  id: string
  operationName: string
  description: string
  estimatedTime: number
  actualTime: number
  status: string
  assignedTo: string
  priority: string
}

interface Process {
  id: string
  processName: string
  description: string
  operations: Operation[]
  status: string
  startDate: string
  endDate: string
}

interface Project {
  id?: string
  projectName: string
  projectType: "Project" | "Manual Project"
  description: string
  customerName: string
  projectManager: string
  assemblyPart: string
  projectDrawingNo: string
  projectQuantity: number
  enquiryNumber: string
  enquiryDate: string
  startDate: string
  endDate: string
  status: string
  priority: string
  partMaster: PartMaster
  processes: Process[]
  createdAt?: Date
  updatedAt?: Date
}

export default function ProjectPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [customers, setCustomers] = useState<string[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showOperationDialog, setShowOperationDialog] = useState(false)
  const [showProcessDialog, setShowProcessDialog] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<string>("")

  const [newProject, setNewProject] = useState<Omit<Project, "id" | "processes">>({
    projectName: "",
    projectType: "Project",
    description: "",
    customerName: "",
    projectManager: "",
    assemblyPart: "",
    projectDrawingNo: "",
    projectQuantity: 1,
    enquiryNumber: "",
    enquiryDate: new Date().toISOString().split("T")[0],
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "Planning",
    priority: "Medium",
    partMaster: {
      drawingNumber: "",
      name: "",
      material: "",
      sizes: [],
      ratePerKg: 0,
      scrapRatePerKg: 0,
      status: "Active",
    },
  })

  const [newSize, setNewSize] = useState<PartSize>({
    dimension: "",
    value: 0,
    unit: "mm",
  })

  const [newOperation, setNewOperation] = useState<Omit<Operation, "id">>({
    operationName: "",
    description: "",
    estimatedTime: 0,
    actualTime: 0,
    status: "Pending",
    assignedTo: "",
    priority: "Medium",
  })

  const [newProcess, setNewProcess] = useState<Omit<Process, "id" | "operations">>({
    processName: "",
    description: "",
    status: "Planning",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  })

  const engineeringMaterials = [
    "16MnCr5",
    "EN8",
    "EN19",
    "EN24",
    "EN31",
    "C45",
    "4140",
    "4340",
    "SS304",
    "SS316",
    "SS410",
    "SS420",
    "Aluminum 6061",
    "Aluminum 7075",
    "Brass",
    "Bronze",
    "Copper",
    "Cast Iron",
    "Ductile Iron",
    "Tool Steel D2",
    "Tool Steel H13",
    "Titanium Grade 2",
    "Titanium Grade 5",
  ]

  useEffect(() => {
    loadProjects()
    loadCustomers()
    loadMaterials()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            if (e.shiftKey) {
              handleSaveAll()
            } else {
              handleSave()
            }
            break
          case "e":
            e.preventDefault()
            handleEdit()
            break
          case "d":
            e.preventDefault()
            if (e.shiftKey) {
              handleDelete()
            } else {
              handleDisplay()
            }
            break
          case "r":
            e.preventDefault()
            handleReset()
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentProject])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const result = await FirebaseService.getAll("projects")
      if (result.success && result.data) {
        setProjects(result.data)
      } else {
        console.error("Failed to load projects:", result.error)
        toast({
          title: "Error",
          description: "Failed to load projects from database",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading projects:", error)
      toast({
        title: "Error",
        description: "Failed to connect to database",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const loadCustomers = async () => {
    try {
      const result = await FirebaseService.getAll("customers")
      if (result.success && result.data) {
        setCustomers(result.data.map((c: any) => c.customerName))
      }
    } catch (error) {
      console.error("Error loading customers:", error)
    }
  }

  const loadMaterials = async () => {
    try {
      const result = await FirebaseService.getAll("materials")
      if (result.success && result.data) {
        setMaterials(result.data)
      }
    } catch (error) {
      console.error("Error loading materials:", error)
    }
  }

  // Main Actions
  const handleNewProject = (type: "Project" | "Manual Project") => {
    if (type === "Manual Project") {
      router.push("/manual-estimation")
      return
    }
    setNewProject((prev) => ({ ...prev, projectType: type }))
    setShowNewProjectDialog(true)
  }

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project)
    toast({
      title: "Project Opened",
      description: `${project.projectName} is now active`,
    })
  }

  const handleCloseProject = () => {
    setCurrentProject(null)
    toast({
      title: "Project Closed",
      description: "No active project",
    })
  }

  const handleAddOperation = () => {
    if (!currentProject) {
      toast({
        title: "Error",
        description: "Please open a project first",
        variant: "destructive",
      })
      return
    }
    setShowOperationDialog(true)
  }

  const handleAddProcess = () => {
    if (!currentProject) {
      toast({
        title: "Error",
        description: "Please open a project first",
        variant: "destructive",
      })
      return
    }
    setShowProcessDialog(true)
  }

  // Save Options
  const handleSave = async () => {
    if (!currentProject) {
      toast({
        title: "Error",
        description: "No active project to save",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Add updatedAt timestamp
      const updatedProject = {
        ...currentProject,
        updatedAt: new Date()
      }

      const result = await FirebaseService.update("projects", currentProject.id!, updatedProject)
      if (result.success) {
        setCurrentProject(updatedProject)
        toast({
          title: "Success",
          description: "Project saved successfully (Ctrl + S)",
        })
        await loadProjects() // Refresh the list
      } else {
        console.error("Save failed:", result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to save project",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleSaveAll = async () => {
    toast({
      title: "Save All",
      description: "Saving all projects... (Ctrl + Shift + S)",
    })
    // Implementation for saving all projects
  }

  // Editing Tools
  const handleEdit = () => {
    if (!currentProject) {
      toast({
        title: "Error",
        description: "No active project to edit",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Edit Mode",
      description: "Project editing enabled (Ctrl + E)",
    })
  }

  const handleDisplay = () => {
    if (!currentProject) {
      toast({
        title: "Error",
        description: "No active project to display",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Display Mode",
      description: "Project display mode (Ctrl + D)",
    })
  }

  const handleDelete = async () => {
    if (!currentProject) {
      toast({
        title: "Error",
        description: "No active project to delete",
        variant: "destructive",
      })
      return
    }

    if (confirm("Are you sure you want to delete this project? (Ctrl + Shift + D)")) {
      setLoading(true)
      try {
        const result = await FirebaseService.delete("projects", currentProject.id!)
        if (result.success) {
          toast({
            title: "Success",
            description: "Project deleted successfully",
          })
          setCurrentProject(null)
          await loadProjects()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete project",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Delete error:", error)
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive",
        })
      }
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the current project? (Ctrl + R)")) {
      setCurrentProject(null)
      toast({
        title: "Reset",
        description: "Project reset successfully",
      })
    }
  }

  // Import/Export
  const handleExportProject = () => {
    if (!currentProject) {
      toast({
        title: "Error",
        description: "No active project to export",
        variant: "destructive",
      })
      return
    }

    const dataStr = JSON.stringify(currentProject, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${currentProject.projectName}_export.json`
    link.click()

    toast({
      title: "Export Complete",
      description: "Project exported successfully",
    })
  }

  const handleImportProject = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        try {
          const projectData = JSON.parse(text)
          delete projectData.id // Remove ID for new import
          projectData.createdAt = new Date()
          projectData.updatedAt = new Date()
          
          const result = await FirebaseService.create("projects", projectData)
          if (result.success) {
            toast({
              title: "Import Complete",
              description: "Project imported successfully",
            })
            await loadProjects()
          } else {
            toast({
              title: "Error",
              description: result.error || "Failed to import project",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Import error:", error)
          toast({
            title: "Error",
            description: "Invalid project file",
            variant: "destructive",
          })
        }
      }
    }
    input.click()
  }

  const createProject = async () => {
    // Enhanced validation
    if (!newProject.projectName.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive",
      })
      return
    }

    if (!newProject.partMaster.drawingNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Drawing number is required",
        variant: "destructive",
      })
      return
    }

    if (!newProject.partMaster.material.trim()) {
      toast({
        title: "Validation Error",
        description: "Material is required",
        variant: "destructive",
      })
      return
    }

    if (!newProject.customerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer name is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Create project with proper timestamps
      const projectData: Project = {
        ...newProject,
        processes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      console.log("Creating project with data:", projectData)

      const result = await FirebaseService.create("projects", projectData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: `${newProject.projectType} created successfully`,
        })
        setShowNewProjectDialog(false)
        resetNewProjectForm()
        await loadProjects() // Refresh the list
      } else {
        console.error("Create project failed:", result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to create project",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Create project error:", error)
      toast({
        title: "Error",
        description: "Failed to create project. Please check your connection.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetNewProjectForm = () => {
    setNewProject({
      projectName: "",
      projectType: "Project",
      description: "",
      customerName: "",
      projectManager: "",
      assemblyPart: "",
      projectDrawingNo: "",
      projectQuantity: 1,
      enquiryNumber: "",
      enquiryDate: new Date().toISOString().split("T")[0],
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      status: "Planning",
      priority: "Medium",
      partMaster: {
        drawingNumber: "",
        name: "",
        material: "",
        sizes: [],
        ratePerKg: 0,
        scrapRatePerKg: 0,
        status: "Active",
      },
    })
    setNewSize({
      dimension: "",
      value: 0,
      unit: "mm",
    })
  }

  const addSize = () => {
    if (!newSize.dimension.trim() || newSize.value <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all size fields with valid values",
        variant: "destructive",
      })
      return
    }

    setNewProject((prev) => ({
      ...prev,
      partMaster: {
        ...prev.partMaster,
        sizes: [...prev.partMaster.sizes, { ...newSize }],
      },
    }))

    setNewSize({
      dimension: "",
      value: 0,
      unit: "mm",
    })
  }

  const removeSize = (index: number) => {
    setNewProject((prev) => ({
      ...prev,
      partMaster: {
        ...prev.partMaster,
        sizes: prev.partMaster.sizes.filter((_, i) => i !== index),
      },
    }))
  }

  const addProcess = async () => {
    if (!currentProject || !newProcess.processName.trim()) {
      toast({
        title: "Validation Error",
        description: "Process name is required",
        variant: "destructive",
      })
      return
    }

    const process: Process = {
      ...newProcess,
      id: `process_${Date.now()}`,
      operations: [],
    }

    const updatedProject = {
      ...currentProject,
      processes: [...currentProject.processes, process],
      updatedAt: new Date(),
    }

    setCurrentProject(updatedProject)
    
    // Auto-save the project
    try {
      const result = await FirebaseService.update("projects", currentProject.id!, updatedProject)
      if (result.success) {
        toast({
          title: "Success",
          description: "Process added and saved successfully",
        })
      }
    } catch (error) {
      console.error("Error saving process:", error)
    }

    setShowProcessDialog(false)
    setNewProcess({
      processName: "",
      description: "",
      status: "Planning",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    })
  }

  const addOperation = async () => {
    if (!currentProject || !selectedProcess || !newOperation.operationName.trim()) {
      toast({
        title: "Validation Error",
        description: "Operation name and process selection are required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const operation: Operation = {
        ...newOperation,
        id: `operation_${Date.now()}`,
      }

      const updatedProject = {
        ...currentProject,
        processes: currentProject.processes.map((process) =>
          process.id === selectedProcess 
            ? { ...process, operations: [...process.operations, operation] } 
            : process
        ),
        updatedAt: new Date(),
      }

      setCurrentProject(updatedProject)

      // Auto-save the project
      const result = await FirebaseService.update("projects", currentProject.id!, updatedProject)
      if (result.success) {
        toast({
          title: "Success",
          description: "Operation added and saved successfully",
        })
        setShowOperationDialog(false)
        setSelectedProcess("")
        setNewOperation({
          operationName: "",
          description: "",
          estimatedTime: 0,
          actualTime: 0,
          status: "Pending",
          assignedTo: "",
          priority: "Medium",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save operation",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving operation:", error)
      toast({
        title: "Error",
        description: "Failed to add operation",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "default"
      case "In Progress":
        return "secondary"
      case "Planning":
        return "outline"
      case "On Hold":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4" />
      case "In Progress":
        return <Play className="w-4 h-4" />
      case "Planning":
        return <Clock className="w-4 h-4" />
      case "On Hold":
        return <Pause className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Project Management</h1>

        {/* Project Menu */}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="w-4 h-4 mr-2" />
                Project Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm font-semibold">🔹 Main Actions</div>
              <DropdownMenuItem onClick={() => handleNewProject("Project")}>
                <FolderPlus className="w-4 h-4 mr-2" />
                New ➤ Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNewProject("Manual Project")}>
                <FileText className="w-4 h-4 mr-2" />
                New ➤ Manual Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}} disabled={!currentProject}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Open Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCloseProject} disabled={!currentProject}>
                <FolderX className="w-4 h-4 mr-2" />
                Close Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddOperation} disabled={!currentProject}>
                <Plus className="w-4 h-4 mr-2" />
                Add Operation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddProcess} disabled={!currentProject}>
                <Settings className="w-4 h-4 mr-2" />
                Add Process
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm font-semibold">🔹 Save Options</div>
              <DropdownMenuItem onClick={handleSave} disabled={!currentProject}>
                <Save className="w-4 h-4 mr-2" />
                Save (Ctrl + S)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSaveAll}>
                <Save className="w-4 h-4 mr-2" />
                Save All (Ctrl + Shift + S)
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm font-semibold">🔹 Editing Tools</div>
              <DropdownMenuItem onClick={handleEdit} disabled={!currentProject}>
                <Edit className="w-4 h-4 mr-2" />
                Edit (Ctrl + E)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDisplay} disabled={!currentProject}>
                <Eye className="w-4 h-4 mr-2" />
                Display (Ctrl + D)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} disabled={!currentProject}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete (Ctrl + Shift + D)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReset} disabled={!currentProject}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset (Ctrl + R)
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm font-semibold">🔹 Import / Export</div>
              <DropdownMenuItem onClick={handleExportProject} disabled={!currentProject}>
                <Download className="w-4 h-4 mr-2" />
                Export Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportProject}>
                <Upload className="w-4 h-4 mr-2" />
                Import Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Imported Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportProject} disabled={!currentProject}>
                <Download className="w-4 h-4 mr-2" />
                Export Manual Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportProject}>
                <Upload className="w-4 h-4 mr-2" />
                Import Manual Project
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm font-semibold">🔹 Exit</div>
              <DropdownMenuItem onClick={() => window.close()}>
                <X className="w-4 h-4 mr-2" />
                Exit Application
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Processing...</p>
          </div>
        )}

        {/* Current Project Status */}
        {currentProject && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Active Project: {currentProject.projectName}
              </CardTitle>
              <CardDescription>
                {currentProject.projectType} • {currentProject.customerName} •
                <Badge variant={getStatusColor(currentProject.status)} className="ml-2">
                  {getStatusIcon(currentProject.status)}
                  <span className="ml-1">{currentProject.status}</span>
                </Badge>
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Tabs defaultValue="projects" className="w-full">
          <TabsList>
            <TabsTrigger value="projects">All Projects</TabsTrigger>
            <TabsTrigger value="details" disabled={!currentProject}>
              Project Details
            </TabsTrigger>
            <TabsTrigger value="processes" disabled={!currentProject}>
              Processes & Operations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project List</CardTitle>
                <CardDescription>Manage all projects in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No projects found. Create your first project to get started.</p>
                    <Button onClick={() => handleNewProject("Project")} className="mt-4">
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Create First Project
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.projectName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{project.projectType}</Badge>
                          </TableCell>
                          <TableCell>{project.customerName}</TableCell>
                          <TableCell>{project.projectManager}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(project.status)}>
                              {getStatusIcon(project.status)}
                              <span className="ml-1">{project.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                project.priority === "High"
                                  ? "destructive"
                                  : project.priority === "Low"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {project.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleOpenProject(project)}>
                                <FolderOpen className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            {currentProject && (
              <div className="space-y-6">
                {/* Part Master Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Part Master Details
                    </CardTitle>
                    <CardDescription>Part specifications and material information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Drawing Number</Label>
                        <Input value={currentProject.partMaster.drawingNumber} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={currentProject.partMaster.name} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Material</Label>
                        <Input value={currentProject.partMaster.material} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Rate/Kg (₹)</Label>
                        <Input value={currentProject.partMaster.ratePerKg} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Scrap Rate/Kg (₹)</Label>
                        <Input value={currentProject.partMaster.scrapRatePerKg} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Badge variant={currentProject.partMaster.status === "Active" ? "default" : "secondary"}>
                          {currentProject.partMaster.status}
                        </Badge>
                      </div>
                    </div>
                    {currentProject.partMaster.sizes.length > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium">Sizes</Label>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Dimension</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Unit</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentProject.partMaster.sizes.map((size, index) => (
                              <TableRow key={index}>
                                <TableCell>{size.dimension}</TableCell>
                                <TableCell>{size.value}</TableCell>
                                <TableCell>{size.unit}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>Detailed information about the active project</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Project Name</Label>
                        <Input value={currentProject.projectName} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Customer</Label>
                        <Input value={currentProject.customerName} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Assembly Part</Label>
                        <Input value={currentProject.assemblyPart} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Project Drawing No.</Label>
                        <Input value={currentProject.projectDrawingNo} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Project Quantity</Label>
                        <Input value={currentProject.projectQuantity} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Enquiry Number</Label>
                        <Input value={currentProject.enquiryNumber} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Enquiry Date</Label>
                        <Input value={currentProject.enquiryDate} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Project Manager</Label>
                        <Input value={currentProject.projectManager} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input value={currentProject.startDate} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input value={currentProject.endDate} readOnly />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label>Description</Label>
                      <Textarea value={currentProject.description} readOnly />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="processes">
            {currentProject && (
              <div className="space-y-4">
                {currentProject.processes.map((process) => (
                  <Card key={process.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        {process.processName}
                        <Badge variant={getStatusColor(process.status)} className="ml-auto">
                          {getStatusIcon(process.status)}
                          <span className="ml-1">{process.status}</span>
                        </Badge>
                      </CardTitle>
                      <CardDescription>{process.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {process.operations.length > 0 ? (
                        <div className="space-y-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Operation</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Estimated Time</TableHead>
                                <TableHead>Actual Time</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {process.operations.map((operation) => (
                                <TableRow key={operation.id}>
                                  <TableCell className="font-medium">{operation.operationName}</TableCell>
                                  <TableCell className="max-w-xs truncate">{operation.description}</TableCell>
                                  <TableCell>{operation.estimatedTime}h</TableCell>
                                  <TableCell>{operation.actualTime}h</TableCell>
                                  <TableCell>{operation.assignedTo || "Unassigned"}</TableCell>
                                  <TableCell>
                                    <Badge variant={getStatusColor(operation.status)}>
                                      {getStatusIcon(operation.status)}
                                      <span className="ml-1">{operation.status}</span>
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        operation.priority === "High"
                                          ? "destructive"
                                          : operation.priority === "Low"
                                            ? "secondary"
                                            : "default"
                                      }
                                    >
                                      {operation.priority}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <div className="flex justify-between items-center">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedProcess(process.id)
                                setShowOperationDialog(true)
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Operation to {process.processName}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">No operations added to this process yet.</p>
                          <Button 
                            onClick={() => {
                              setSelectedProcess(process.id)
                              setShowOperationDialog(true)
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Operation
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {currentProject.processes.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No processes added to this project yet.</p>
                      <Button onClick={handleAddProcess} className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Process
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* New Project Dialog */}
        <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>🆕 New → Project</DialogTitle>
              <DialogDescription>Create a new project with part master and project details</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Part Master Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />🔹 Part Master Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="drawingNumber">Drawing Number *</Label>
                      <Input
                        id="drawingNumber"
                        value={newProject.partMaster.drawingNumber}
                        onChange={(e) =>
                          setNewProject((prev) => ({
                            ...prev,
                            partMaster: { ...prev.partMaster, drawingNumber: e.target.value },
                          }))
                        }
                        placeholder="Enter drawing number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partName">Name</Label>
                      <Input
                        id="partName"
                        value={newProject.partMaster.name}
                        onChange={(e) =>
                          setNewProject((prev) => ({
                            ...prev,
                            partMaster: { ...prev.partMaster, name: e.target.value },
                          }))
                        }
                        placeholder="Enter part name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material">Material *</Label>
                      <Select
                        value={newProject.partMaster.material}
                        onValueChange={(value) =>
                          setNewProject((prev) => ({
                            ...prev,
                            partMaster: { ...prev.partMaster, material: value },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material (e.g., 16MnCr5)" />
                        </SelectTrigger>
                        <SelectContent>
                          {engineeringMaterials.map((material) => (
                            <SelectItem key={material} value={material}>
                              {material}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ratePerKg">Rate/Kg (in ₹)</Label>
                      <Input
                        id="ratePerKg"
                        type="number"
                        step="0.01"
                        value={newProject.partMaster.ratePerKg}
                        onChange={(e) =>
                          setNewProject((prev) => ({
                            ...prev,
                            partMaster: { ...prev.partMaster, ratePerKg: Number.parseFloat(e.target.value) || 0 },
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scrapRatePerKg">Rate/Kg (Scrap) (in ₹)</Label>
                      <Input
                        id="scrapRatePerKg"
                        type="number"
                        step="0.01"
                        value={newProject.partMaster.scrapRatePerKg}
                        onChange={(e) =>
                          setNewProject((prev) => ({
                            ...prev,
                            partMaster: { ...prev.partMaster, scrapRatePerKg: Number.parseFloat(e.target.value) || 0 },
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partStatus">Status</Label>
                      <Select
                        value={newProject.partMaster.status}
                        onValueChange={(value) =>
                          setNewProject((prev) => ({
                            ...prev,
                            partMaster: { ...prev.partMaster, status: value },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Add Size Section */}
                  <div className="mt-6 space-y-4">
                    <Label className="text-sm font-medium">Add Size</Label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="dimension">Dimension</Label>
                        <Input
                          id="dimension"
                          value={newSize.dimension}
                          onChange={(e) => setNewSize((prev) => ({ ...prev, dimension: e.target.value }))}
                          placeholder="e.g., Length, Width"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="value">Value</Label>
                        <Input
                          id="value"
                          type="number"
                          step="0.01"
                          value={newSize.value}
                          onChange={(e) =>
                            setNewSize((prev) => ({ ...prev, value: Number.parseFloat(e.target.value) || 0 }))
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select
                          value={newSize.unit}
                          onValueChange={(value) => setNewSize((prev) => ({ ...prev, unit: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mm">mm</SelectItem>
                            <SelectItem value="cm">cm</SelectItem>
                            <SelectItem value="m">m</SelectItem>
                            <SelectItem value="inch">inch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button type="button" onClick={addSize} className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Size
                        </Button>
                      </div>
                    </div>

                    {newProject.partMaster.sizes.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Added Sizes</Label>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Dimension</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {newProject.partMaster.sizes.map((size, index) => (
                              <TableRow key={index}>
                                <TableCell>{size.dimension}</TableCell>
                                <TableCell>{size.value}</TableCell>
                                <TableCell>{size.unit}</TableCell>
                                <TableCell>
                                  <Button type="button" size="sm" variant="outline" onClick={() => removeSize(index)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle>🔹 Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer *</Label>
                      <div className="flex gap-2">
                        <Select
                          value={newProject.customerName}
                          onValueChange={(value) => setNewProject((prev) => ({ ...prev, customerName: value }))}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer} value={customer}>
                                {customer}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Or enter new"
                          value={newProject.customerName}
                          onChange={(e) => setNewProject((prev) => ({ ...prev, customerName: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project Name *</Label>
                      <Input
                        id="projectName"
                        value={newProject.projectName}
                        onChange={(e) => setNewProject((prev) => ({ ...prev, projectName: e.target.value }))}
                        placeholder="Enter project name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assemblyPart">Assembly Part</Label>
                      <Input
                        id="assemblyPart"
                        value={newProject.assemblyPart}
                        onChange={(e) => setNewProject((prev) => ({ ...prev, assemblyPart: e.target.value }))}
                        placeholder="Enter assembly part"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectDrawingNo">Project Drawing No.</Label>
                      <Input
                        id="projectDrawingNo"
                        value={newProject.projectDrawingNo}
                        onChange={(e) => setNewProject((prev) => ({ ...prev, projectDrawingNo: e.target.value }))}
                        placeholder="Enter project drawing number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectQuantity">Project Quantity</Label>
                      <Input
                        id="projectQuantity"
                        type="number"
                        min="1"
                        value={newProject.projectQuantity}
                        onChange={(e) =>
                          setNewProject((prev) => ({ ...prev, projectQuantity: Number.parseInt(e.target.value) || 1 }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="enquiryNumber">Enquiry Number</Label>
                      <Input
                        id="enquiryNumber"
                        value={newProject.enquiryNumber}
                        onChange={(e) => setNewProject((prev) => ({ ...prev, enquiryNumber: e.target.value }))}
                        placeholder="Enter enquiry number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="enquiryDate">Enquiry Date</Label>
                      <Input
                        id="enquiryDate"
                        type="date"
                        value={newProject.enquiryDate}
                        onChange={(e) => setNewProject((prev) => ({ ...prev, enquiryDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectManager">Project Manager</Label>
                      <Input
                        id="projectManager"
                        value={newProject.projectManager}
                        onChange={(e) => setNewProject((prev) => ({ ...prev, projectManager: e.target.value }))}
                        placeholder="Enter project manager"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newProject.priority}
                        onValueChange={(value) => setNewProject((prev) => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newProject.startDate}
                        onChange={(e) => setNewProject((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newProject.endDate}
                        onChange={(e) => setNewProject((prev) => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter project description"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={createProject} disabled={loading}>
                  {loading ? "Creating..." : "Create Project"}
                </Button>
                <Button variant="outline" onClick={resetNewProjectForm}>
                  Reset
                </Button>
                <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Process Dialog */}
        <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Process</DialogTitle>
              <DialogDescription>Add a new process to the current project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="processName">Process Name *</Label>
                <Input
                  id="processName"
                  value={newProcess.processName}
                  onChange={(e) => setNewProcess((prev) => ({ ...prev, processName: e.target.value }))}
                  placeholder="Enter process name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processDescription">Description</Label>
                <Textarea
                  id="processDescription"
                  value={newProcess.description}
                  onChange={(e) => setNewProcess((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter process description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processStartDate">Start Date</Label>
                  <Input
                    id="processStartDate"
                    type="date"
                    value={newProcess.startDate}
                    onChange={(e) => setNewProcess((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processEndDate">End Date</Label>
                  <Input
                    id="processEndDate"
                    type="date"
                    value={newProcess.endDate}
                    onChange={(e) => setNewProcess((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addProcess} disabled={loading}>
                  {loading ? "Adding..." : "Add Process"}
                </Button>
                <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Operation Dialog */}
        <Dialog open={showOperationDialog} onOpenChange={setShowOperationDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Operation</DialogTitle>
              <DialogDescription>Add a new operation to a process</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Process Selection */}
              <div className="space-y-2">
                <Label htmlFor="processSelect">Select Process *</Label>
                {currentProject?.processes && currentProject.processes.length > 0 ? (
                  <Select value={selectedProcess} onValueChange={setSelectedProcess}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a process" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentProject.processes.map((process) => (
                        <SelectItem key={process.id} value={process.id}>
                          {process.processName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      No processes available. Please add a process first before adding operations.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        setShowOperationDialog(false)
                        setShowProcessDialog(true)
                      }}
                    >
                      Add Process First
                    </Button>
                  </div>
                )}
              </div>

              {/* Operation Details */}
              <div className="space-y-2">
                <Label htmlFor="operationName">Operation Name *</Label>
                <Input
                  id="operationName"
                  value={newOperation.operationName}
                  onChange={(e) => setNewOperation((prev) => ({ ...prev, operationName: e.target.value }))}
                  placeholder="Enter operation name (e.g., Machining, Assembly)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operationDescription">Description</Label>
                <Textarea
                  id="operationDescription"
                  value={newOperation.description}
                  onChange={(e) => setNewOperation((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter operation description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Estimated Time (hours)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    step="0.1"
                    min="0"
                    value={newOperation.estimatedTime}
                    onChange={(e) =>
                      setNewOperation((prev) => ({ ...prev, estimatedTime: Number.parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={newOperation.assignedTo}
                    onChange={(e) => setNewOperation((prev) => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="Enter assignee name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operationStatus">Status</Label>
                  <Select
                    value={newOperation.status}
                    onValueChange={(value) => setNewOperation((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operationPriority">Priority</Label>
                  <Select
                    value={newOperation.priority}
                    onValueChange={(value) => setNewOperation((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview selected process */}
              {selectedProcess && currentProject && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Adding to process: {currentProject.processes.find(p => p.id === selectedProcess)?.processName}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={addOperation} 
                  disabled={loading || !selectedProcess || !newOperation.operationName.trim()}
                >
                  {loading ? "Adding..." : "Add Operation"}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowOperationDialog(false)
                  setSelectedProcess("")
                  setNewOperation({
                    operationName: "",
                    description: "",
                    estimatedTime: 0,
                    actualTime: 0,
                    status: "Pending",
                    assignedTo: "",
                    priority: "Medium",
                  })
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}