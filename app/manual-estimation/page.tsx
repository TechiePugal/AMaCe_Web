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
import { Plus, Trash2, Calculator, FileText, Save, RotateCcw, Eye } from "lucide-react"

interface PartDetail {
  partName: string
  drawingNo: string
  material: string
  weight: number
  ratePerKg: number
  materialCost: number
}

interface ProcessDetail {
  id: string
  process: string
  processTime: number
  rate: number
  processCost: number
}

interface ManualEstimation {
  id?: string
  // Header Section
  customerName: string
  enquiryNumber: string
  enquiryDate: string
  description: string
  quotationNumber: string
  quotationDate: string
  drawingNumber: string
  quantity: number

  // Part Details
  partDetails: PartDetail

  // Process Details
  processes: ProcessDetail[]

  // Costs
  partCost: number
  totalPartCost: number
  manufacturingCostNet: number
  transport: number
  oiling: number
  others: number
  profitPercentage: number
  packingPercentage: number
  overheadsPercentage: number
  manufacturingCostGross: number
  projectCost: number

  // Status
  status: string
  createdAt?: Date
}

export default function ManualEstimation() {
  const { toast } = useToast()
  const [estimations, setEstimations] = useState<ManualEstimation[]>([])
  const [customers, setCustomers] = useState<string[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [drawings, setDrawings] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<ManualEstimation>({
    // Header Section
    customerName: "",
    enquiryNumber: "",
    enquiryDate: new Date().toISOString().split("T")[0],
    description: "",
    quotationNumber: "",
    quotationDate: new Date().toISOString().split("T")[0],
    drawingNumber: "",
    quantity: 1,

    // Part Details
    partDetails: {
      partName: "",
      drawingNo: "",
      material: "",
      weight: 0,
      ratePerKg: 0,
      materialCost: 0,
    },

    // Process Details
    processes: [],

    // Costs
    partCost: 0,
    totalPartCost: 0,
    manufacturingCostNet: 0,
    transport: 0,
    oiling: 0,
    others: 0,
    profitPercentage: 15,
    packingPercentage: 2,
    overheadsPercentage: 10,
    manufacturingCostGross: 0,
    projectCost: 0,

    // Status
    status: "Draft",
  })

  const [newProcess, setNewProcess] = useState<Omit<ProcessDetail, "id" | "processCost">>({
    process: "",
    processTime: 0,
    rate: 0,
  })

  const commonProcesses = [
    "CNC Milling",
    "CNC Turning",
    "Drilling",
    "Boring",
    "Grinding",
    "Welding",
    "Heat Treatment",
    "Surface Treatment",
    "Assembly",
    "Quality Check",
    "Packaging",
    "Material Handling",
  ]

  useEffect(() => {
    loadEstimations()
    loadCustomers()
    loadMaterials()
    loadDrawings()
  }, [])

  // ──────────────────────────────────────────
  // Auto-recalculate whenever BASE inputs change
  // ──────────────────────────────────────────
  useEffect(() => {
    const materialCost = formData.partDetails.weight * formData.partDetails.ratePerKg
    const totalProcessCost = formData.processes.reduce((sum, p) => sum + p.processCost, 0)
    const partCost = materialCost + totalProcessCost
    const totalPartCost = partCost * formData.quantity
    const manufacturingCostNet = totalPartCost
    const manufacturingCostGross = manufacturingCostNet + formData.transport + formData.oiling + formData.others

    const profitAmount = (manufacturingCostGross * formData.profitPercentage) / 100
    const packingAmount = (manufacturingCostGross * formData.packingPercentage) / 100
    const overheadsAmount = (manufacturingCostGross * formData.overheadsPercentage) / 100
    const projectCost = manufacturingCostGross + profitAmount + packingAmount + overheadsAmount

    // ― Update ONLY if any derived value actually changed
    setFormData((prev) => {
      if (
        prev.partDetails.materialCost === materialCost &&
        prev.partCost === partCost &&
        prev.totalPartCost === totalPartCost &&
        prev.manufacturingCostNet === manufacturingCostNet &&
        prev.manufacturingCostGross === manufacturingCostGross &&
        prev.projectCost === projectCost
      ) {
        return prev // no change → no extra render
      }
      return {
        ...prev,
        partDetails: { ...prev.partDetails, materialCost },
        partCost,
        totalPartCost,
        manufacturingCostNet,
        manufacturingCostGross,
        projectCost,
      }
    })
  }, [
    // BASE input dependencies only 🔽
    formData.partDetails.weight,
    formData.partDetails.ratePerKg,
    formData.processes,
    formData.quantity,
    formData.transport,
    formData.oiling,
    formData.others,
    formData.profitPercentage,
    formData.packingPercentage,
    formData.overheadsPercentage,
  ])

  const loadEstimations = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("manualEstimations")
    if (result.success) {
      setEstimations(result.data)
    }
    setLoading(false)
  }

  const loadCustomers = async () => {
    const result = await FirebaseService.getAll("customers")
    if (result.success) {
      setCustomers(result.data.map((c: any) => c.customerName))
    }
  }

  const loadMaterials = async () => {
    const result = await FirebaseService.getAll("materials")
    if (result.success) {
      setMaterials(result.data)
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
        result = await FirebaseService.update("manualEstimations", editingId, formData)
      } else {
        result = await FirebaseService.create("manualEstimations", formData)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Estimation ${editingId ? "updated" : "created"} successfully`,
        })
        resetForm()
        loadEstimations()
      } else {
        throw new Error("Failed to save estimation")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save estimation",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      customerName: "",
      enquiryNumber: "",
      enquiryDate: new Date().toISOString().split("T")[0],
      description: "",
      quotationNumber: "",
      quotationDate: new Date().toISOString().split("T")[0],
      drawingNumber: "",
      quantity: 1,
      partDetails: {
        partName: "",
        drawingNo: "",
        material: "",
        weight: 0,
        ratePerKg: 0,
        materialCost: 0,
      },
      processes: [],
      partCost: 0,
      totalPartCost: 0,
      manufacturingCostNet: 0,
      transport: 0,
      oiling: 0,
      others: 0,
      profitPercentage: 15,
      packingPercentage: 2,
      overheadsPercentage: 10,
      manufacturingCostGross: 0,
      projectCost: 0,
      status: "Draft",
    })
    setNewProcess({
      process: "",
      processTime: 0,
      rate: 0,
    })
    setEditingId(null)
  }

  const addProcess = () => {
    if (!newProcess.process || newProcess.processTime <= 0 || newProcess.rate <= 0) {
      toast({
        title: "Error",
        description: "Please fill all process fields with valid values",
        variant: "destructive",
      })
      return
    }

    const processCost = newProcess.processTime * newProcess.rate
    const process: ProcessDetail = {
      ...newProcess,
      id: Date.now().toString(),
      processCost,
    }

    setFormData((prev) => ({
      ...prev,
      processes: [...prev.processes, process],
    }))

    setNewProcess({
      process: "",
      processTime: 0,
      rate: 0,
    })
  }

  const removeProcess = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      processes: prev.processes.filter((p) => p.id !== id),
    }))
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("partDetails.")) {
      const partField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        partDetails: {
          ...prev.partDetails,
          [partField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleMaterialChange = (materialName: string) => {
    const selectedMaterial = materials.find((m) => m.materialName === materialName)
    if (selectedMaterial) {
      handleInputChange("partDetails.material", materialName)
      // You can set a default rate here if available in material master
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Manual Estimation</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Create Estimation</TabsTrigger>
            <TabsTrigger value="list">Estimation List</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Header Information
                  </CardTitle>
                  <CardDescription>Basic enquiry and quotation details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Select
                        value={formData.customerName}
                        onValueChange={(value) => handleInputChange("customerName", value)}
                      >
                        <SelectTrigger>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="enquiryNumber">Enquiry Number</Label>
                      <Input
                        id="enquiryNumber"
                        value={formData.enquiryNumber}
                        onChange={(e) => handleInputChange("enquiryNumber", e.target.value)}
                        placeholder="ENQ-2025-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="enquiryDate">Enquiry Date</Label>
                      <Input
                        id="enquiryDate"
                        type="date"
                        value={formData.enquiryDate}
                        onChange={(e) => handleInputChange("enquiryDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quotationNumber">Quotation Number</Label>
                      <Input
                        id="quotationNumber"
                        value={formData.quotationNumber}
                        onChange={(e) => handleInputChange("quotationNumber", e.target.value)}
                        placeholder="QUO-2025-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quotationDate">Quotation Date</Label>
                      <Input
                        id="quotationDate"
                        type="date"
                        value={formData.quotationDate}
                        onChange={(e) => handleInputChange("quotationDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="drawingNumber">Drawing Number</Label>
                      <Select
                        value={formData.drawingNumber}
                        onValueChange={(value) => handleInputChange("drawingNumber", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select drawing" />
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
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange("quantity", Number.parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter detailed description of the project/part"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Part Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Part Details
                  </CardTitle>
                  <CardDescription>Part specifications and material costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="partName">Part Name *</Label>
                      <Input
                        id="partName"
                        value={formData.partDetails.partName}
                        onChange={(e) => handleInputChange("partDetails.partName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partDrawingNo">Drawing No</Label>
                      <Input
                        id="partDrawingNo"
                        value={formData.partDetails.drawingNo}
                        onChange={(e) => handleInputChange("partDetails.drawingNo", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="material">Material *</Label>
                      <Select value={formData.partDetails.material} onValueChange={handleMaterialChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map((material) => (
                            <SelectItem key={material.id} value={material.materialName}>
                              {material.materialName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (Kg) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.001"
                        value={formData.partDetails.weight}
                        onChange={(e) =>
                          handleInputChange("partDetails.weight", Number.parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ratePerKg">Rate/Kg (₹) *</Label>
                      <Input
                        id="ratePerKg"
                        type="number"
                        step="0.01"
                        value={formData.partDetails.ratePerKg}
                        onChange={(e) =>
                          handleInputChange("partDetails.ratePerKg", Number.parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="materialCost">Material Cost (₹)</Label>
                      <Input
                        id="materialCost"
                        value={formatCurrency(formData.partDetails.materialCost)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Process Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Process Details</CardTitle>
                  <CardDescription>Add manufacturing processes and their costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="process">Process</Label>
                        <Select
                          value={newProcess.process}
                          onValueChange={(value) => setNewProcess((prev) => ({ ...prev, process: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select process" />
                          </SelectTrigger>
                          <SelectContent>
                            {commonProcesses.map((process) => (
                              <SelectItem key={process} value={process}>
                                {process}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Or enter custom process"
                          value={newProcess.process}
                          onChange={(e) => setNewProcess((prev) => ({ ...prev, process: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="processTime">Process Time (hrs)</Label>
                        <Input
                          id="processTime"
                          type="number"
                          step="0.1"
                          value={newProcess.processTime}
                          onChange={(e) =>
                            setNewProcess((prev) => ({ ...prev, processTime: Number.parseFloat(e.target.value) || 0 }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rate">Rate (₹/hr)</Label>
                        <Input
                          id="rate"
                          type="number"
                          step="0.01"
                          value={newProcess.rate}
                          onChange={(e) =>
                            setNewProcess((prev) => ({ ...prev, rate: Number.parseFloat(e.target.value) || 0 }))
                          }
                        />
                      </div>

                      <div className="flex items-end">
                        <Button type="button" onClick={addProcess} className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Process
                        </Button>
                      </div>
                    </div>

                    {formData.processes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Added Processes</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Process</TableHead>
                              <TableHead>Time (hrs)</TableHead>
                              <TableHead>Rate (₹/hr)</TableHead>
                              <TableHead>Cost (₹)</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formData.processes.map((process) => (
                              <TableRow key={process.id}>
                                <TableCell>{process.process}</TableCell>
                                <TableCell>{process.processTime}</TableCell>
                                <TableCell>{formatCurrency(process.rate)}</TableCell>
                                <TableCell>{formatCurrency(process.processCost)}</TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeProcess(process.id)}
                                  >
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

              {/* Cost Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Summary</CardTitle>
                  <CardDescription>Manufacturing and additional costs breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Part Cost (₹)</Label>
                          <Input value={formatCurrency(formData.partCost)} readOnly className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                          <Label>Total Part Cost (₹)</Label>
                          <Input value={formatCurrency(formData.totalPartCost)} readOnly className="bg-muted" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Manufacturing Cost (Net) (₹)</Label>
                        <Input value={formatCurrency(formData.manufacturingCostNet)} readOnly className="bg-muted" />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="transport">Transport (₹)</Label>
                          <Input
                            id="transport"
                            type="number"
                            step="0.01"
                            value={formData.transport}
                            onChange={(e) => handleInputChange("transport", Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="oiling">Oiling (₹)</Label>
                          <Input
                            id="oiling"
                            type="number"
                            step="0.01"
                            value={formData.oiling}
                            onChange={(e) => handleInputChange("oiling", Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="others">Others (₹)</Label>
                          <Input
                            id="others"
                            type="number"
                            step="0.01"
                            value={formData.others}
                            onChange={(e) => handleInputChange("others", Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Manufacturing Cost (Gross) (₹)</Label>
                        <Input value={formatCurrency(formData.manufacturingCostGross)} readOnly className="bg-muted" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="profitPercentage">Profit (%)</Label>
                          <Input
                            id="profitPercentage"
                            type="number"
                            step="0.1"
                            value={formData.profitPercentage}
                            onChange={(e) =>
                              handleInputChange("profitPercentage", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="packingPercentage">Packing (%)</Label>
                          <Input
                            id="packingPercentage"
                            type="number"
                            step="0.1"
                            value={formData.packingPercentage}
                            onChange={(e) =>
                              handleInputChange("packingPercentage", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="overheadsPercentage">Overheads (%)</Label>
                          <Input
                            id="overheadsPercentage"
                            type="number"
                            step="0.1"
                            value={formData.overheadsPercentage}
                            onChange={(e) =>
                              handleInputChange("overheadsPercentage", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-lg font-semibold">Project Cost (₹)</Label>
                        <Input
                          value={formatCurrency(formData.projectCost)}
                          readOnly
                          className="bg-primary/10 text-lg font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Submitted">Submitted</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : editingId ? "Update" : "Submit"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Estimation List</CardTitle>
                <CardDescription>Manage all manual estimations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Enquiry No</TableHead>
                      <TableHead>Part Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Project Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estimations.map((estimation) => (
                      <TableRow key={estimation.id}>
                        <TableCell className="font-medium">{estimation.customerName}</TableCell>
                        <TableCell>{estimation.enquiryNumber}</TableCell>
                        <TableCell>{estimation.partDetails.partName}</TableCell>
                        <TableCell>{estimation.quantity}</TableCell>
                        <TableCell>{formatCurrency(estimation.projectCost)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              estimation.status === "Approved"
                                ? "default"
                                : estimation.status === "Rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {estimation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
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
