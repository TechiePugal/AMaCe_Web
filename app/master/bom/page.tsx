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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"

interface BOMItem {
  itemNo: number
  itemPartName: string
  drawingNo: string
  quantity: number
  uom: string
}

interface BOM {
  id?: string
  partName: string
  drawingNo: string
  items: BOMItem[]
}

export default function BOMMaster() {
  const { toast } = useToast()
  const [boms, setBOMs] = useState<BOM[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<BOM>({
    partName: "",
    drawingNo: "",
    items: [],
  })

  const [newItem, setNewItem] = useState<Omit<BOMItem, "itemNo">>({
    itemPartName: "",
    drawingNo: "",
    quantity: 1,
    uom: "Nos",
  })

  useEffect(() => {
    loadBOMs()
  }, [])

  const loadBOMs = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("boms")
    if (result.success) {
      setBOMs(result.data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await FirebaseService.create("boms", formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "BOM created successfully",
        })
        resetForm()
        loadBOMs()
      } else {
        throw new Error("Failed to save BOM")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save BOM",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      partName: "",
      drawingNo: "",
      items: [],
    })
    setNewItem({
      itemPartName: "",
      drawingNo: "",
      quantity: 1,
      uom: "Nos",
    })
  }

  const addItem = () => {
    if (!newItem.itemPartName || !newItem.drawingNo) {
      toast({
        title: "Error",
        description: "Please fill all item fields",
        variant: "destructive",
      })
      return
    }

    const item: BOMItem = {
      ...newItem,
      itemNo: formData.items.length + 1,
    }

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }))

    setNewItem({
      itemPartName: "",
      drawingNo: "",
      quantity: 1,
      uom: "Nos",
    })
  }

  const removeItem = (itemNo: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.itemNo !== itemNo).map((item, index) => ({ ...item, itemNo: index + 1 })),
    }))
  }

  const handleInputChange = (field: keyof BOM, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNewItemChange = (field: keyof Omit<BOMItem, "itemNo">, value: string | number) => {
    setNewItem((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">BOM Master</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Bill of Materials (BOM)</CardTitle>
            <CardDescription>Create and manage Bill of Materials for parts</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partName">Part Name *</Label>
                  <Input
                    id="partName"
                    value={formData.partName}
                    onChange={(e) => handleInputChange("partName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drawingNo">Drawing No *</Label>
                  <Input
                    id="drawingNo"
                    value={formData.drawingNo}
                    onChange={(e) => handleInputChange("drawingNo", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Add BOM Items</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="itemPartName">Item Part Name</Label>
                    <Input
                      id="itemPartName"
                      value={newItem.itemPartName}
                      onChange={(e) => handleNewItemChange("itemPartName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itemDrawingNo">Item Drawing No</Label>
                    <Input
                      id="itemDrawingNo"
                      value={newItem.drawingNo}
                      onChange={(e) => handleNewItemChange("drawingNo", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => handleNewItemChange("quantity", Number.parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uom">UOM</Label>
                    <Select value={newItem.uom} onValueChange={(value) => handleNewItemChange("uom", value)}>
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

                  <div className="flex items-end">
                    <Button type="button" onClick={addItem} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {formData.items.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">BOM Items</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item No</TableHead>
                          <TableHead>Item Part Name</TableHead>
                          <TableHead>Drawing No</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>UOM</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.items.map((item) => (
                          <TableRow key={item.itemNo}>
                            <TableCell>{item.itemNo}</TableCell>
                            <TableCell>{item.itemPartName}</TableCell>
                            <TableCell>{item.drawingNo}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.uom}</TableCell>
                            <TableCell>
                              <Button type="button" size="sm" variant="outline" onClick={() => removeItem(item.itemNo)}>
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

              <div className="flex gap-2">
                <Button type="submit" disabled={loading || formData.items.length === 0}>
                  {loading ? "Saving..." : "Save BOM"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing BOMs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {boms.map((bom) => (
                <div key={bom.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{bom.partName}</h4>
                      <p className="text-sm text-muted-foreground">Drawing: {bom.drawingNo}</p>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Item No</TableHead>
                        <TableHead>Item Part Name</TableHead>
                        <TableHead>Drawing No</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>UOM</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bom.items.map((item) => (
                        <TableRow key={item.itemNo}>
                          <TableCell>{item.itemNo}</TableCell>
                          <TableCell>{item.itemPartName}</TableCell>
                          <TableCell>{item.drawingNo}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.uom}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
