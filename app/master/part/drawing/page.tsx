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
import { Pencil, Trash2, Upload, FileText } from "lucide-react"

interface Drawing {
  id?: string
  drawingNumber: string
  description: string
  drawingFileName: string
  drawingFile?: File
  revision: string
  status: string
}

export default function DrawingMaster() {
  const { toast } = useToast()
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Drawing>({
    drawingNumber: "",
    description: "",
    drawingFileName: "",
    revision: "",
    status: "Active",
  })

  useEffect(() => {
    loadDrawings()
  }, [])

  const loadDrawings = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("drawings")
    if (result.success) {
      setDrawings(result.data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingId) {
        result = await FirebaseService.update("drawings", editingId, formData)
      } else {
        result = await FirebaseService.create("drawings", formData)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Drawing ${editingId ? "updated" : "created"} successfully`,
        })
        resetForm()
        loadDrawings()
      } else {
        throw new Error("Failed to save drawing")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save drawing",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      drawingNumber: "",
      description: "",
      drawingFileName: "",
      revision: "",
      status: "Active",
    })
    setEditingId(null)
  }

  const handleEdit = (drawing: Drawing) => {
    setFormData(drawing)
    setEditingId(drawing.id!)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this drawing?")) {
      const result = await FirebaseService.delete("drawings", id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Drawing deleted successfully",
        })
        loadDrawings()
      }
    }
  }

  const handleInputChange = (field: keyof Drawing, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        drawingFile: file,
        drawingFileName: file.name,
      }))
    }
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Drawing Master</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Add/Edit Drawing</TabsTrigger>
            <TabsTrigger value="list">Drawing List</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Drawing" : "Add New Drawing"}</CardTitle>
                <CardDescription>
                  {editingId ? "Update drawing information" : "Enter drawing details to add to the system"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="drawingNumber">Drawing Number *</Label>
                      <Input
                        id="drawingNumber"
                        value={formData.drawingNumber}
                        onChange={(e) => handleInputChange("drawingNumber", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="revision">Revision</Label>
                      <Input
                        id="revision"
                        value={formData.revision}
                        onChange={(e) => handleInputChange("revision", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="drawingFile">Drawing File</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="drawingFile"
                        type="file"
                        accept=".pdf,.dwg,.dxf,.jpg,.png"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Browse
                      </Button>
                    </div>
                    {formData.drawingFileName && (
                      <p className="text-sm text-muted-foreground">Selected: {formData.drawingFileName}</p>
                    )}
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
                <CardTitle>Drawing List</CardTitle>
                <CardDescription>Manage all drawings in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Drawing Number</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Revision</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drawings.map((drawing) => (
                      <TableRow key={drawing.id}>
                        <TableCell className="font-medium">{drawing.drawingNumber}</TableCell>
                        <TableCell>{drawing.description}</TableCell>
                        <TableCell>{drawing.revision}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {drawing.drawingFileName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={drawing.status === "Active" ? "default" : "secondary"}>
                            {drawing.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(drawing)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(drawing.id!)}>
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
