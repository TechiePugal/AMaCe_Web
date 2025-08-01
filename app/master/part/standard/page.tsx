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
import { Pencil, Trash2 } from "lucide-react"

interface StandardPart {
  id?: string
  name: string
  description: string
  specification: string
  baseUOM: string
  price: number
  status: string
}

export default function StandardPartMaster() {
  const { toast } = useToast()
  const [standardParts, setStandardParts] = useState<StandardPart[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<StandardPart>({
    name: "",
    description: "",
    specification: "",
    baseUOM: "Nos",
    price: 0,
    status: "Active",
  })

  const commonStandardParts = [
    "Bolt - Hex Head",
    "Nut - Hex",
    "Washer - Flat",
    "Washer - Spring",
    "Screw - Phillips Head",
    "Screw - Flat Head",
    "Pin - Dowel",
    "Pin - Spring",
    "Bearing - Ball",
    "Bearing - Roller",
    "O-Ring",
    "Gasket",
    "Seal",
    "Spring - Compression",
    "Spring - Extension",
  ]

  useEffect(() => {
    loadStandardParts()
  }, [])

  const loadStandardParts = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("standardParts")
    if (result.success) {
      setStandardParts(result.data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingId) {
        result = await FirebaseService.update("standardParts", editingId, formData)
      } else {
        result = await FirebaseService.create("standardParts", formData)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Standard part ${editingId ? "updated" : "created"} successfully`,
        })
        resetForm()
        loadStandardParts()
      } else {
        throw new Error("Failed to save standard part")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save standard part",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      specification: "",
      baseUOM: "Nos",
      price: 0,
      status: "Active",
    })
    setEditingId(null)
  }

  const handleEdit = (part: StandardPart) => {
    setFormData(part)
    setEditingId(part.id!)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this standard part?")) {
      const result = await FirebaseService.delete("standardParts", id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Standard part deleted successfully",
        })
        loadStandardParts()
      }
    }
  }

  const handleInputChange = (field: keyof StandardPart, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Standard Part Master</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Add/Edit Standard Part</TabsTrigger>
            <TabsTrigger value="list">Standard Part List</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Standard Part" : "Add New Standard Part"}</CardTitle>
                <CardDescription>
                  {editingId ? "Update standard part information" : "Enter standard part details to add to the system"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Select value={formData.name} onValueChange={(value) => handleInputChange("name", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a standard part" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonStandardParts.map((part) => (
                          <SelectItem key={part} value={part}>
                            {part}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground">Or enter custom part name:</div>
                    <Input
                      placeholder="Enter custom part name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter detailed description of the standard part"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specification">Specification</Label>
                    <Textarea
                      id="specification"
                      value={formData.specification}
                      onChange={(e) => handleInputChange("specification", e.target.value)}
                      placeholder="Enter technical specifications (size, material, grade, etc.)"
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
                          <SelectItem value="Nos">Nos</SelectItem>
                          <SelectItem value="Kg">Kg</SelectItem>
                          <SelectItem value="Gram">Gram</SelectItem>
                          <SelectItem value="Meter">Meter</SelectItem>
                          <SelectItem value="Liter">Liter</SelectItem>
                          <SelectItem value="Set">Set</SelectItem>
                          <SelectItem value="Pair">Pair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price in ₹</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                        placeholder="Enter price per unit"
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
                <CardTitle>Standard Part List</CardTitle>
                <CardDescription>Manage all standard parts in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Base UOM</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standardParts.map((part) => (
                      <TableRow key={part.id}>
                        <TableCell className="font-medium">{part.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{part.description}</TableCell>
                        <TableCell>{part.baseUOM}</TableCell>
                        <TableCell>₹{part.price}</TableCell>
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
