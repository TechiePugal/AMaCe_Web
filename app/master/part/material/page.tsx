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
import { Pencil, Trash2, Upload, Download } from "lucide-react"

interface Material {
  id?: string
  materialName: string
  baseUOM: string
  specificGravity: number
  status: string
}

export default function MaterialMaster() {
  const { toast } = useToast()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Material>({
    materialName: "",
    baseUOM: "Kg",
    specificGravity: 0,
    status: "Active",
  })

  const commonMaterials = [
    "Steel - Carbon Steel",
    "Steel - Stainless Steel 304",
    "Steel - Stainless Steel 316",
    "Aluminum - 6061",
    "Aluminum - 7075",
    "Brass",
    "Copper",
    "Cast Iron",
    "Mild Steel",
    "Tool Steel",
    "Titanium",
    "Plastic - ABS",
    "Plastic - PVC",
    "Plastic - Nylon",
  ]

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("materials")
    if (result.success) {
      setMaterials(result.data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingId) {
        result = await FirebaseService.update("materials", editingId, formData)
      } else {
        result = await FirebaseService.create("materials", formData)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Material ${editingId ? "updated" : "created"} successfully`,
        })
        resetForm()
        loadMaterials()
      } else {
        throw new Error("Failed to save material")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save material",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      materialName: "",
      baseUOM: "Kg",
      specificGravity: 0,
      status: "Active",
    })
    setEditingId(null)
  }

  const handleEdit = (material: Material) => {
    setFormData(material)
    setEditingId(material.id!)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this material?")) {
      const result = await FirebaseService.delete("materials", id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Material deleted successfully",
        })
        loadMaterials()
      }
    }
  }

  const handleInputChange = (field: keyof Material, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Material Master</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Add/Edit Material</TabsTrigger>
            <TabsTrigger value="list">Material List</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Material" : "Add New Material"}</CardTitle>
                <CardDescription>
                  {editingId ? "Update material information" : "Enter material details to add to the system"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="materialName">Material Name *</Label>
                    <Select
                      value={formData.materialName}
                      onValueChange={(value) => handleInputChange("materialName", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a material" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonMaterials.map((material) => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground">Or enter custom material:</div>
                    <Input
                      placeholder="Enter custom material name"
                      value={formData.materialName}
                      onChange={(e) => handleInputChange("materialName", e.target.value)}
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
                          <SelectItem value="Liter">Liter</SelectItem>
                          <SelectItem value="Meter">Meter</SelectItem>
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
                        placeholder="e.g., 7.85 for steel"
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
                <CardTitle>Material List</CardTitle>
                <CardDescription>Manage all materials in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material Name</TableHead>
                      <TableHead>Base UOM</TableHead>
                      <TableHead>Specific Gravity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.materialName}</TableCell>
                        <TableCell>{material.baseUOM}</TableCell>
                        <TableCell>{material.specificGravity}</TableCell>
                        <TableCell>
                          <Badge variant={material.status === "Active" ? "default" : "secondary"}>
                            {material.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(material)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(material.id!)}>
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
