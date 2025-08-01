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
import { useToast } from "@/hooks/use-toast"
import { FirebaseService } from "@/lib/firebase-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Upload, Download, Eye } from "lucide-react"

interface VCMaster {
  id?: string
  materialName: string
  machineName: string
  toolName: string
  toolCostPerEdge: number
  toolLife: number
  vcValue: number
  mrr: number
  status: string
}

export default function VCMaster() {
  const { toast } = useToast()
  const [vcRecords, setVCRecords] = useState<VCMaster[]>([])
  const [materials, setMaterials] = useState<string[]>([])
  const [machines, setMachines] = useState<string[]>([])
  const [tools, setTools] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<VCMaster>({
    materialName: "",
    machineName: "",
    toolName: "",
    toolCostPerEdge: 0,
    toolLife: 0,
    vcValue: 0,
    mrr: 0,
    status: "Active",
  })

  useEffect(() => {
    loadVCRecords()
    loadMaterials()
    loadMachines()
    loadTools()
  }, [])

  const loadVCRecords = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("vcMaster")
    if (result.success) {
      setVCRecords(result.data)
    }
    setLoading(false)
  }

  const loadMaterials = async () => {
    const result = await FirebaseService.getAll("cuttingMaterials")
    if (result.success) {
      setMaterials(result.data.map((m: any) => m.materialName))
    }
  }

  const loadMachines = async () => {
    const result = await FirebaseService.getAll("machines")
    if (result.success) {
      setMachines(result.data.map((m: any) => m.machineName))
    }
  }

  const loadTools = async () => {
    const result = await FirebaseService.getAll("tools")
    if (result.success) {
      setTools(result.data.map((t: any) => t.toolType))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingId) {
        result = await FirebaseService.update("vcMaster", editingId, formData)
      } else {
        result = await FirebaseService.create("vcMaster", formData)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `VC record ${editingId ? "updated" : "created"} successfully`,
        })
        resetForm()
        loadVCRecords()
      } else {
        throw new Error("Failed to save VC record")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save VC record",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      materialName: "",
      machineName: "",
      toolName: "",
      toolCostPerEdge: 0,
      toolLife: 0,
      vcValue: 0,
      mrr: 0,
      status: "Active",
    })
    setEditingId(null)
  }

  const handleEdit = (record: VCMaster) => {
    setFormData(record)
    setEditingId(record.id!)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this VC record?")) {
      const result = await FirebaseService.delete("vcMaster", id)
      if (result.success) {
        toast({
          title: "Success",
          description: "VC record deleted successfully",
        })
        loadVCRecords()
      }
    }
  }

  const handleInputChange = (field: keyof VCMaster, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">VC Master</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Add/Edit VC Record</TabsTrigger>
            <TabsTrigger value="list">VC Records List</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit VC Record" : "Add New VC Record"}</CardTitle>
                <CardDescription>
                  {editingId
                    ? "Update VC record information"
                    : "Enter cutting speed parameters for material-machine-tool combination"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="materialName">Material Name *</Label>
                      <Select
                        value={formData.materialName}
                        onValueChange={(value) => handleInputChange("materialName", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map((material) => (
                            <SelectItem key={material} value={material}>
                              {material}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="machineName">Machine Name *</Label>
                      <Select
                        value={formData.machineName}
                        onValueChange={(value) => handleInputChange("machineName", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select machine" />
                        </SelectTrigger>
                        <SelectContent>
                          {machines.map((machine) => (
                            <SelectItem key={machine} value={machine}>
                              {machine}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="toolName">Tool Name *</Label>
                      <Select value={formData.toolName} onValueChange={(value) => handleInputChange("toolName", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tool" />
                        </SelectTrigger>
                        <SelectContent>
                          {tools.map((tool) => (
                            <SelectItem key={tool} value={tool}>
                              {tool}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="toolCostPerEdge">Tool Cost/Edge (₹)</Label>
                      <Input
                        id="toolCostPerEdge"
                        type="number"
                        step="0.01"
                        value={formData.toolCostPerEdge}
                        onChange={(e) => handleInputChange("toolCostPerEdge", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="toolLife">Tool Life (min)</Label>
                      <Input
                        id="toolLife"
                        type="number"
                        step="0.1"
                        value={formData.toolLife}
                        onChange={(e) => handleInputChange("toolLife", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vcValue">VC Value (m/min)</Label>
                      <Input
                        id="vcValue"
                        type="number"
                        step="0.1"
                        value={formData.vcValue}
                        onChange={(e) => handleInputChange("vcValue", Number.parseFloat(e.target.value) || 0)}
                        placeholder="Cutting speed in meters per minute"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mrr">MRR (cm³/min)</Label>
                      <Input
                        id="mrr"
                        type="number"
                        step="0.01"
                        value={formData.mrr}
                        onChange={(e) => handleInputChange("mrr", Number.parseFloat(e.target.value) || 0)}
                        placeholder="Material Removal Rate"
                      />
                    </div>
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
                      <Eye className="w-4 h-4 mr-2" />
                      View All VC
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
                <CardTitle>VC Records List</CardTitle>
                <CardDescription>Manage all cutting speed records in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Tool</TableHead>
                      <TableHead>VC Value</TableHead>
                      <TableHead>MRR</TableHead>
                      <TableHead>Tool Life</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vcRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.materialName}</TableCell>
                        <TableCell>{record.machineName}</TableCell>
                        <TableCell>{record.toolName}</TableCell>
                        <TableCell>{record.vcValue} m/min</TableCell>
                        <TableCell>{record.mrr} cm³/min</TableCell>
                        <TableCell>{record.toolLife} min</TableCell>
                        <TableCell>
                          <Badge variant={record.status === "Active" ? "default" : "secondary"}>{record.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(record.id!)}>
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
