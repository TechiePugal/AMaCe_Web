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
import { Pencil, Trash2, Plus } from "lucide-react"

interface PartSize {
  dimension: string
  value: number
  unit: string
}

interface Part {
  id?: string
  drawingNo: string
  name: string
  material: string
  sizes: PartSize[]
  unit: string
  ratePerKg: number
  scrapRatePerKg: number
  status: string
}

export default function PartMaster() {
  const { toast } = useToast()
  const [parts, setParts] = useState<Part[]>([])
  const [materials, setMaterials] = useState<string[]>([])
  const [drawings, setDrawings] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Part>({
    drawingNo: "",
    name: "",
    material: "",
    sizes: [],
    unit: "Nos",
    ratePerKg: 0,
    scrapRatePerKg: 0,
    status: "Active",
  })

  const [newSize, setNewSize] = useState<PartSize>({
    dimension: "",
    value: 0,
    unit: "mm",
  })

  useEffect(() => {
    loadParts()
    loadMaterials()
    loadDrawings()
  }, [])

  const loadParts = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("parts")
    if (result.success) {
      setParts(result.data)
    }
    setLoading(false)
  }

  const loadMaterials = async () => {
    const result = await FirebaseService.getAll("materials")
    if (result.success) {
      setMaterials(result.data.map((m: any) => m.materialName))
    }
  }

  const loadDrawings = async () => {
    const result = await FirebaseService.getAll("drawings")
    if (result.success) {
      setDrawings(result.data.map((d: any) => d.drawingNumber))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingId) {
        result = await FirebaseService.update("parts", editingId, formData)
      } else {
        result = await FirebaseService.create("parts", formData)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Part ${editingId ? "updated" : "created"} successfully`,
        })
        resetForm()
        loadParts()
      } else {
        throw new Error("Failed to save part")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save part",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      drawingNo: "",
      name: "",
      material: "",
      sizes: [],
      unit: "Nos",
      ratePerKg: 0,
      scrapRatePerKg: 0,
      status: "Active",
    })
    setNewSize({
      dimension: "",
      value: 0,
      unit: "mm",
    })
    setEditingId(null)
  }

  const addSize = () => {
    if (!newSize.dimension || newSize.value <= 0) {
      toast({
        title: "Error",
        description: "Please fill all size fields",
        variant: "destructive",
      })
      return
    }

    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, newSize],
    }))

    setNewSize({
      dimension: "",
      value: 0,
      unit: "mm",
    })
  }

  const removeSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }))
  }

  const handleEdit = (part: Part) => {
    setFormData(part)
    setEditingId(part.id!)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this part?")) {
      const result = await FirebaseService.delete("parts", id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Part deleted successfully",
        })
        loadParts()
      }
    }
  }

  const handleInputChange = (field: keyof Part, value: string | number | PartSize[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Part Master</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Add/Edit Part</TabsTrigger>
            <TabsTrigger value="list">Part List</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Part" : "Add New Part"}</CardTitle>
                <CardDescription>
                  {editingId ? "Update part information" : "Enter part details to add to the system"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="drawingNo">Drawing No *</Label>
                      <Select
                        value={formData.drawingNo}
                        onValueChange={(value) => handleInputChange("drawingNo", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select drawing number" />
                        </SelectTrigger>
                        <SelectContent>
                          {drawings.map((drawing) => (
                            <SelectItem key={drawing} value={drawing}>
                              {drawing}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="material">Material *</Label>
                      <Select value={formData.material} onValueChange={(value) => handleInputChange("material", value)}>
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
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nos">Nos</SelectItem>
                          <SelectItem value="Kg">Kg</SelectItem>
                          <SelectItem value="Meter">Meter</SelectItem>
                          <SelectItem value="Liter">Liter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Add Size Dimensions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="dimension">Dimension</Label>
                        <Input
                          id="dimension"
                          placeholder="e.g., Length, Width, Height"
                          value={newSize.dimension}
                          onChange={(e) => setNewSize((prev) => ({ ...prev, dimension: e.target.value }))}
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
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sizeUnit">Unit</Label>
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

                    {formData.sizes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Part Dimensions</h4>
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
                            {formData.sizes.map((size, index) => (
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ratePerKg">Rate/Kg in ₹</Label>
                      <Input
                        id="ratePerKg"
                        type="number"
                        step="0.01"
                        value={formData.ratePerKg}
                        onChange={(e) => handleInputChange("ratePerKg", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scrapRatePerKg">Rate/Kg (Scrap) in ₹</Label>
                      <Input
                        id="scrapRatePerKg"
                        type="number"
                        step="0.01"
                        value={formData.scrapRatePerKg}
                        onChange={(e) => handleInputChange("scrapRatePerKg", Number.parseFloat(e.target.value) || 0)}
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
                <CardTitle>Part List</CardTitle>
                <CardDescription>Manage all parts in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Drawing No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Rate/Kg</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parts.map((part) => (
                      <TableRow key={part.id}>
                        <TableCell className="font-medium">{part.drawingNo}</TableCell>
                        <TableCell>{part.name}</TableCell>
                        <TableCell>{part.material}</TableCell>
                        <TableCell>{part.unit}</TableCell>
                        <TableCell>₹{part.ratePerKg}</TableCell>
                        <TableCell>
                          <Badge variant={part.status === "Active" ? "default" : "secondary"}>{part.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(part)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(part.id!)}>
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
