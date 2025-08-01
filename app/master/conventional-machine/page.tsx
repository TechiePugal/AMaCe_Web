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
import { Pencil, Trash2 } from "lucide-react"

interface ConventionalMachine {
  id?: string
  machineName: string
  speed: number
  feed: number
  status: string
}

export default function ConventionalMachineSpeedFeedMaster() {
  const { toast } = useToast()
  const [machines, setMachines] = useState<ConventionalMachine[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<ConventionalMachine>({
    machineName: "",
    speed: 0,
    feed: 0,
    status: "Active",
  })

  const conventionalMachines = [
    "MILLING/ESTEEM",
    "LATHE/KIRLOSKAR",
    "DRILLING/RADIAL",
    "SHAPING/HYDRAULIC",
    "GRINDING/SURFACE",
    "GRINDING/CYLINDRICAL",
    "BORING/HORIZONTAL",
    "BORING/VERTICAL",
    "PLANING/MECHANICAL",
    "SLOTTING/VERTICAL",
    "BROACHING/VERTICAL",
    "GEAR CUTTING/HOBBING",
    "THREAD CUTTING/AUTOMATIC",
    "SAWING/POWER HACKSAW",
    "SAWING/BAND SAW",
  ]

  useEffect(() => {
    loadMachines()
  }, [])

  const loadMachines = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("conventionalMachines")
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
        result = await FirebaseService.update("conventionalMachines", editingId, formData)
      } else {
        result = await FirebaseService.create("conventionalMachines", formData)
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
      speed: 0,
      feed: 0,
      status: "Active",
    })
    setEditingId(null)
  }

  const handleEdit = (machine: ConventionalMachine) => {
    setFormData(machine)
    setEditingId(machine.id!)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this machine?")) {
      const result = await FirebaseService.delete("conventionalMachines", id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Machine deleted successfully",
        })
        loadMachines()
      }
    }
  }

  const handleInputChange = (field: keyof ConventionalMachine, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Conventional Machine Speed Feed Master</h1>
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
                <CardTitle>{editingId ? "Edit Conventional Machine" : "Add New Conventional Machine"}</CardTitle>
                <CardDescription>
                  {editingId ? "Update machine information" : "Enter conventional machine speed and feed parameters"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        {conventionalMachines.map((machine) => (
                          <SelectItem key={machine} value={machine}>
                            {machine}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground">Or enter custom machine name:</div>
                    <Input
                      placeholder="Enter custom machine name"
                      value={formData.machineName}
                      onChange={(e) => handleInputChange("machineName", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="speed">Speed * (RPM)</Label>
                      <Input
                        id="speed"
                        type="number"
                        step="0.1"
                        value={formData.speed}
                        onChange={(e) => handleInputChange("speed", Number.parseFloat(e.target.value) || 0)}
                        placeholder="Enter speed in RPM"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="feed">Feed * (mm/min)</Label>
                      <Input
                        id="feed"
                        type="number"
                        step="0.01"
                        value={formData.feed}
                        onChange={(e) => handleInputChange("feed", Number.parseFloat(e.target.value) || 0)}
                        placeholder="Enter feed rate in mm/min"
                        required
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
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Conventional Machine List</CardTitle>
                <CardDescription>Manage all conventional machines in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Machine Name</TableHead>
                      <TableHead>Speed (RPM)</TableHead>
                      <TableHead>Feed (mm/min)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {machines.map((machine) => (
                      <TableRow key={machine.id}>
                        <TableCell className="font-medium">{machine.machineName}</TableCell>
                        <TableCell>{machine.speed}</TableCell>
                        <TableCell>{machine.feed}</TableCell>
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
