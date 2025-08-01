"use client"

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
import { Calculator, Save, RotateCcw, Trash2, Eye, Download } from "lucide-react"

interface MaterialCalculation {
  id?: string
  materialName: string
  specificGravity: number
  shapeType: string
  dimensions: {
    [key: string]: number
  }
  volume: number // in mm³
  weight: number // in Kg
  calculatedAt: Date
}

interface Material {
  id: string
  materialName: string
  specificGravity: number
}

export default function WeightCalculation() {
  const { toast } = useToast()
  const [calculations, setCalculations] = useState<MaterialCalculation[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    materialName: "",
    specificGravity: 7.85,
    shapeType: "flat",
    dimensions: {} as { [key: string]: number },
  })

  const [results, setResults] = useState({
    volume: 0,
    weight: 0,
  })

  const shapeTypes = [
    { value: "flat", label: "Flat Material" },
    { value: "pipe", label: "Pipe / Ring" },
    { value: "round", label: "Round Material" },
    { value: "hexagon", label: "Hexagon Material" },
  ]

  useEffect(() => {
    loadCalculations()
    loadMaterials()
  }, [])

  // Auto-calculate volume and weight when dimensions or material change
  useEffect(() => {
    calculateVolumeAndWeight()
  }, [formData.dimensions, formData.specificGravity, formData.shapeType])

  const loadCalculations = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("weightCalculations")
    if (result.success) {
      setCalculations(result.data)
    }
    setLoading(false)
  }

  const loadMaterials = async () => {
    const result = await FirebaseService.getAll("materials")
    if (result.success) {
      setMaterials(result.data)
    }
  }

  const calculateVolumeAndWeight = () => {
    let volume = 0
    const { dimensions } = formData

    switch (formData.shapeType) {
      case "flat":
        if (dimensions.length && dimensions.width && dimensions.thickness) {
          volume = dimensions.length * dimensions.width * dimensions.thickness
        }
        break

      case "pipe":
        if (dimensions.outerDiameter && dimensions.innerDiameter && dimensions.length) {
          const outerRadius = dimensions.outerDiameter / 2
          const innerRadius = dimensions.innerDiameter / 2
          volume = Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius) * dimensions.length
        }
        break

      case "round":
        if (dimensions.outerDiameter && dimensions.length) {
          const radius = dimensions.outerDiameter / 2
          volume = Math.PI * radius * radius * dimensions.length
        }
        break

      case "hexagon":
        if (dimensions.acrossFlats && dimensions.length) {
          // Volume = (3√3 / 2) × (AF²) × Length
          volume = ((3 * Math.sqrt(3)) / 2) * Math.pow(dimensions.acrossFlats, 2) * dimensions.length
        }
        break
    }

    const weight = (volume * formData.specificGravity) / 1000000 // Convert mm³ to Kg

    setResults({
      volume: Math.round(volume * 100) / 100,
      weight: Math.round(weight * 1000) / 1000,
    })
  }

  const handleMaterialChange = (materialName: string) => {
    const selectedMaterial = materials.find((m) => m.materialName === materialName)
    if (selectedMaterial) {
      setFormData((prev) => ({
        ...prev,
        materialName,
        specificGravity: selectedMaterial.specificGravity,
      }))
    }
  }

  const handleDimensionChange = (key: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [key]: value,
      },
    }))
  }

  const handleSaveCalculation = async () => {
    if (!formData.materialName || results.weight === 0) {
      toast({
        title: "Error",
        description: "Please select material and enter valid dimensions",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const calculation: MaterialCalculation = {
        materialName: formData.materialName,
        specificGravity: formData.specificGravity,
        shapeType: formData.shapeType,
        dimensions: formData.dimensions,
        volume: results.volume,
        weight: results.weight,
        calculatedAt: new Date(),
      }

      const result = await FirebaseService.create("weightCalculations", calculation)
      if (result.success) {
        toast({
          title: "Success",
          description: "Calculation saved successfully",
        })
        loadCalculations()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save calculation",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      materialName: "",
      specificGravity: 7.85,
      shapeType: "flat",
      dimensions: {},
    })
    setResults({
      volume: 0,
      weight: 0,
    })
  }

  const deleteCalculation = async (id: string) => {
    if (confirm("Are you sure you want to delete this calculation?")) {
      const result = await FirebaseService.delete("weightCalculations", id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Calculation deleted successfully",
        })
        loadCalculations()
      }
    }
  }

  const renderDimensionInputs = () => {
    switch (formData.shapeType) {
      case "flat":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length (mm) *</Label>
              <Input
                id="length"
                type="number"
                step="0.01"
                value={formData.dimensions.length || ""}
                onChange={(e) => handleDimensionChange("length", Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter length"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width (mm) *</Label>
              <Input
                id="width"
                type="number"
                step="0.01"
                value={formData.dimensions.width || ""}
                onChange={(e) => handleDimensionChange("width", Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thickness">Thickness (mm) *</Label>
              <Input
                id="thickness"
                type="number"
                step="0.01"
                value={formData.dimensions.thickness || ""}
                onChange={(e) => handleDimensionChange("thickness", Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter thickness"
              />
            </div>
          </div>
        )

      case "pipe":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outerDiameter">OD (Outer Diameter) (mm) *</Label>
              <Input
                id="outerDiameter"
                type="number"
                step="0.01"
                value={formData.dimensions.outerDiameter || ""}
                onChange={(e) => handleDimensionChange("outerDiameter", Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter outer diameter"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="innerDiameter">ID (Inner Diameter) (mm) *</Label>
              <Input
                id="innerDiameter"
                type="number"
                step="0.01"
                value={formData.dimensions.innerDiameter || ""}
                onChange={(e) => handleDimensionChange("innerDiameter", Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter inner diameter"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Length (mm) *</Label>
              <Input
                id="length"
                type="number"
                step="0.01"
                value={formData.dimensions.length || ""}
                onChange={(e) => handleDimensionChange("length", Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter length"
              />
            </div>
          </div>
        )

      case "round":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outerDiameter">OD (Outer Diameter) (mm) *</Label>
              <Input
                id="outerDiameter"
                type="number"
                step="0.01"
                value={formData.dimensions.outerDiameter || ""}
                onChange={(e) => handleDimensionChange("outerDiameter", Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter outer diameter"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Length (mm) *</Label>
              <Input
                id="length"
                type="number"
                step="0.01"
                value={formData.dimensions.length || ""}
                onChange={(e) => handleDimensionChange("length", Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter length"
              />
            </div>
          </div>
        )

      case "hexagon":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acrossFlats">Across Flats (mm) *</Label>
              <Input
                id="acrossFlats"
                type="number"
                step="0.01"
                value={formData.dimensions.acrossFlats || ""}
                onChange={(e) => handleDimensionChange("acrossFlats", Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter across flats dimension"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Length (mm) *</Label>
              <Input
                id="length"
                type="number"
                step="0.01"
                value={formData.dimensions.length || ""}
                onChange={(e) => handleDimensionChange("length", Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter length"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }).format(num)
  }

  const getShapeLabel = (shapeType: string) => {
    return shapeTypes.find((s) => s.value === shapeType)?.label || shapeType
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Weight Calculation - Raw Material</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList>
            <TabsTrigger value="calculator">Material Calculator</TabsTrigger>
            <TabsTrigger value="history">Calculation History</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <div className="space-y-6">
              {/* Material Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Material Selection
                  </CardTitle>
                  <CardDescription>Select material and specify its properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="material">Material *</Label>
                      <Select value={formData.materialName} onValueChange={handleMaterialChange}>
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
                      <Label htmlFor="specificGravity">Specific Gravity</Label>
                      <Input
                        id="specificGravity"
                        type="number"
                        step="0.001"
                        value={formData.specificGravity}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            specificGravity: Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="e.g., 7.85 for steel"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shape Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Shape Type</CardTitle>
                  <CardDescription>Select the material shape for calculation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shapeType">Shape Type *</Label>
                      <Select
                        value={formData.shapeType}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            shapeType: value,
                            dimensions: {}, // Reset dimensions when shape changes
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {shapeTypes.map((shape) => (
                            <SelectItem key={shape.value} value={shape.value}>
                              {shape.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dynamic dimension inputs based on shape */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Dimensions</h4>
                      {renderDimensionInputs()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Calculation Results</CardTitle>
                  <CardDescription>Automatically calculated volume and weight</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Volume (mm³)</Label>
                      <Input value={formatNumber(results.volume)} readOnly className="bg-muted font-mono text-right" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">Weight (Kg)</Label>
                      <Input
                        value={formatNumber(results.weight)}
                        readOnly
                        className="bg-primary/10 font-mono text-right text-lg font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button onClick={handleSaveCalculation} disabled={loading || results.weight === 0}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Saving..." : "Save Calculation"}
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Calculation Formulas Reference */}
              <Card>
                <CardHeader>
                  <CardTitle>Calculation Formulas</CardTitle>
                  <CardDescription>Reference formulas used for each shape type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>Flat Material:</strong> Volume = Length × Width × Thickness
                    </div>
                    <div>
                      <strong>Pipe/Ring:</strong> Volume = π/4 × (OD² - ID²) × Length
                    </div>
                    <div>
                      <strong>Round Material:</strong> Volume = π/4 × OD² × Length
                    </div>
                    <div>
                      <strong>Hexagon Material:</strong> Volume = (3√3 / 2) × (AF²) × Length
                    </div>
                    <div className="pt-2 border-t">
                      <strong>Weight Calculation:</strong> Weight (Kg) = Volume (mm³) × Specific Gravity ÷ 1,000,000
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Calculation History</CardTitle>
                <CardDescription>View and manage saved weight calculations</CardDescription>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Shape</TableHead>
                      <TableHead>Dimensions</TableHead>
                      <TableHead>Volume (mm³)</TableHead>
                      <TableHead>Weight (Kg)</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculations.map((calc) => (
                      <TableRow key={calc.id}>
                        <TableCell className="font-medium">{calc.materialName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getShapeLabel(calc.shapeType)}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-xs space-y-1">
                            {Object.entries(calc.dimensions).map(([key, value]) => (
                              <div key={key}>
                                {key}: {formatNumber(value)}mm
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{formatNumber(calc.volume)}</TableCell>
                        <TableCell className="font-mono font-semibold">{formatNumber(calc.weight)}</TableCell>
                        <TableCell>{new Date(calc.calculatedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteCalculation(calc.id!)}>
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
