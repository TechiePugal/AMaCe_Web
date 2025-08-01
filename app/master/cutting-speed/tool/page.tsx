"use client"

import type React from "react"

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
import { Pencil, Trash2, Upload, Download } from "lucide-react"

interface Tool {
  id?: string
  toolType: string
  description: string
  numberOfCuttingEdges: number
  status: string
}

export default function ToolMaster() {
  const { toast } = useToast()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Tool>({
    toolType: "",
    description: "",
    numberOfCuttingEdges: 1,
    status: "Active",
  })

  const toolTypes = [
    "End Mill",
    "Face Mill",
    "Ball End Mill",
    "Slot Drill",
    "Drill Bit",
    "Reamer",
    "Tap",
    "Die",
    "Boring Bar",
    "Turning Insert",
    "Grooving Tool",
    "Threading Tool",
    "Parting Tool",
    "Fly Cutter",
    "Chamfer Mill",
    "T-Slot Cutter",
    "Dovetail Cutter",
    "Keyway Cutter",
    "Countersink",
    "Counterbore",
  ]

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("tools")
    if (result.success) {
      setTools(result.data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingId) {
        result = await FirebaseService.update("tools", editingId, formData)
      } else {
        result = await FirebaseService.create("tools", formData)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Tool ${editingId ? "updated" : "created"} successfully`,
        })
        resetForm()
        loadTools()
      } else {
        throw new Error("Failed to save tool")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save tool",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      toolType: "",
      description: "",
      numberOfCuttingEdges: 1,
      status: "Active",
    })
    setEditingId(null)
  }

  const handleEdit = (tool: Tool) => {
    setFormData(tool)
    setEditingId(tool.id!)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this tool?")) {
      const result = await FirebaseService.delete("tools", id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Tool deleted successfully",
        })
        loadTools()
      }
    }
  }

  const handleInputChange = (field: keyof Tool, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Tool Master</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Add/Edit Tool</TabsTrigger>
            <TabsTrigger value="list">Tool List</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Tool" : "Add New Tool"}</CardTitle>
                <CardDescription>
                  {editingId ? "Update tool information" : "Enter tool details to add to the system"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="toolType">Tool Type *</Label>
                    <Select value={formData.toolType} onValueChange={(value) => handleInputChange("toolType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tool type" />
                      </SelectTrigger>
                      <SelectContent>
                        {toolTypes.map((tool) => (
                          <SelectItem key={tool} value={tool}>
                            {tool}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground">Or enter custom tool type:</div>
                    <Input
                      placeholder="Enter custom tool type"
                      value={formData.toolType}
                      onChange={(e) => handleInputChange("toolType", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter detailed description of the tool (size, material, coating, etc.)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfCuttingEdges">No. of Cutting Edges</Label>
                    <Input
                      id="numberOfCuttingEdges"
                      type="number"
                      min="1"
                      value={formData.numberOfCuttingEdges}
                      onChange={(e) => handleInputChange("numberOfCuttingEdges", Number.parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : editingId ? "Update" : "Save"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Reset
                    </Button>
                    <Button type="button" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                    <Button type="button" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Tool List</CardTitle>
                <CardDescription>Manage all tools in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Cutting Edges</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tools.map((tool) => (
                      <TableRow key={tool.id}>
                        <TableCell className="font-medium">{tool.toolType}</TableCell>
                        <TableCell className="max-w-xs truncate">{tool.description}</TableCell>
                        <TableCell>{tool.numberOfCuttingEdges}</TableCell>
                        <TableCell>
                          <Badge variant={tool.status === "Active" ? "default" : "secondary"}>{tool.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(tool)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(tool.id!)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
