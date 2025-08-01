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

interface Machine {
  id?: string
  machineName: string
  machineDescription: string
  machineModel: string
  baseUOM: string
  specificGravity: number
  machineHRRate: number
  machineSpecification: string
  toolsChangingTime: number
  approachTime: number
  efficiency: number
  status: string
}

export default function MachineMaster() {
  const { toast } = useToast()
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Machine>({
    machineName: "",
    machineDescription: "",
    machineModel: "",
    baseUOM: "Kg",
    specificGravity: 0,
    machineHRRate: 0,
    machineSpecification: "",
    toolsChangingTime: 0,
    approachTime: 0,
    efficiency: 85,
    status: "Active",
  })

  const machineTypes = [
    "CNC Milling",
    "CNC Turning",
    "CNC Drilling",
    "EDM Drilling/Charmilles",
    "Wire EDM",
    "Surface Grinding",
    "Cylindrical Grinding",
    "Lathe Machine",
    "Boring Machine",
    "Shaping Machine",
    "Planing Machine",
    "Broaching Machine",
    "Gear Cutting Machine",
    "Thread Cutting Machine",
    "Welding Machine",
    "Plasma Cutting",
    "Laser Cutting",
    "Water Jet Cutting",
  ]

  useEffect(() => {
    loadMachines()
  }, [])

  const loadMachines = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("machines")
    if (result.success) {
      setMachines(result.data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingId) {
        result = await FirebaseService.update("machines", editingId, formData)
      } else {
        result = await FirebaseService.create("machines", formData)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Machine ${editingId ? "updated" : "created"} successfully`,
        })
        resetForm()
        loadMachines()
      } else {
        throw new Error("Failed to save machine")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save machine",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      machineName: "",
      machineDescription: "",
      machineModel: "",
      baseUOM: "Kg",
      specificGravity: 0,
      machineHRRate: 0,
      machineSpecification: "",
      toolsChangingTime: 0,
      approachTime: 0,
      efficiency: 85,
      status: "Active",
    })
    setEditingId(null)
  }

  const handleEdit = (machine: Machine) => {
    setFormData(machine)
    setEditingId(machine.id!)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this machine?")) {
      const result = await FirebaseService.delete("machines", id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Machine deleted successfully",
        })
        loadMachines()
      }
    }
  }

  const handleInputChange = (field: keyof Machine, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Machine Master</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Add/Edit Machine</TabsTrigger>
            <TabsTrigger value="list">Machine List</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Machine" : "Add New Machine"}</CardTitle>
                <CardDescription>
                  {editingId ? "Update machine information" : "Enter machine details to add to the system"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="machineName">Machine Name *</Label>
                      <Select
                        value={formData.machineName}
                        onValueChange={(value) => handleInputChange("machineName", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select machine type" />
                        </SelectTrigger>
                        <SelectContent>
                          {machineTypes.map((machine) => (
                            <SelectItem key={machine} value={machine}>
                              {machine}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Or enter custom machine name"
                        value={formData.machineName}
                        onChange={(e) => handleInputChange("machineName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="machineModel">Machine Model</Label>
                      <Input
                        id="machineModel"
                        value={formData.machineModel}
                        onChange={(e) => handleInputChange("machineModel", e.target.value)}
                        placeholder="e.g., DMG MORI NLX 2500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="machineDescription">Machine Description</Label>
                    <Textarea
                      id="machineDescription"
                      value={formData.machineDescription}
                      onChange={(e) => handleInputChange("machineDescription", e.target.value)}
                      placeholder="Enter detailed description of the machine"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseUOM">Base UOM</Label>
                      <Select value={formData.baseUOM} onValueChange={(value) => handleInputChange("baseUOM", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kg">Kg</SelectItem>
                          <SelectItem value="Gram">Gram</SelectItem>
                          <SelectItem value="Ton">Ton</SelectItem>
                          <SelectItem value="Nos">Nos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specificGravity">Specific Gravity</Label>
                      <Input
                        id="specificGravity"
                        type="number"
                        step="0.001"
                        value={formData.specificGravity}
                        onChange={(e) => handleInputChange("specificGravity", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="machineHRRate">Machine HR Rate * (₹/hour)</Label>
                      <Input
                        id="machineHRRate"
                        type="number"
                        step="0.01"
                        value={formData.machineHRRate}
                        onChange={(e) => handleInputChange("machineHRRate", Number.parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="efficiency">Efficiency (%)</Label>
                      <Input
                        id="efficiency"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.efficiency}
                        onChange={(e) => handleInputChange("efficiency", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="toolsChangingTime">Tools Changing Time (Sec)</Label>
                      <Input
                        id="toolsChangingTime"
                        type="number"
                        value={formData.toolsChangingTime}
                        onChange={(e) => handleInputChange("toolsChangingTime", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="approachTime">Approach Time * (Sec)</Label>
                      <Input
                        id="approachTime"
                        type="number"
                        value={formData.approachTime}
                        onChange={(e) => handleInputChange("approachTime", Number.parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="machineSpecification">Machine Specification</Label>
                    <Textarea
                      id="machineSpecification"
                      value={formData.machineSpecification}
                      onChange={(e) => handleInputChange("machineSpecification", e.target.value)}
                      placeholder="Enter technical specifications (power, dimensions, capacity, etc.)"
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
                <CardTitle>Machine List</CardTitle>
                <CardDescription>Manage all machines in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Machine Name</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>HR Rate</TableHead>
                      <TableHead>Efficiency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {machines.map((machine) => (
                      <TableRow key={machine.id}>
                        <TableCell className="font-medium">{machine.machineName}</TableCell>
                        <TableCell>{machine.machineModel}</TableCell>
                        <TableCell>₹{machine.machineHRRate}/hr</TableCell>
                        <TableCell>{machine.efficiency}%</TableCell>
                        <TableCell>
                          <Badge variant={machine.status === "Active" ? "default" : "secondary"}>
                            {machine.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(machine)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(machine.id!)}>
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
