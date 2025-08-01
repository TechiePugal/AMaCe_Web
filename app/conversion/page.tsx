"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, ArrowRightLeft, RotateCcw } from "lucide-react"

export default function ConversionPage() {
  // Inch to Millimeter conversion
  const [inches, setInches] = useState<number>(0)
  const [millimeters, setMillimeters] = useState<number>(0)

  // Generic converter states
  const [fromValue, setFromValue] = useState<number>(0)
  const [toValue, setToValue] = useState<number>(0)
  const [conversionType, setConversionType] = useState<string>("length")
  const [fromUnit, setFromUnit] = useState<string>("inch")
  const [toUnit, setToUnit] = useState<string>("mm")

  // Auto-calculate millimeters when inches change
  useEffect(() => {
    const result = inches * 25.4
    setMillimeters(Math.round(result * 10000) / 10000) // Round to 4 decimal places
  }, [inches])

  // Generic conversion calculations
  useEffect(() => {
    let result = 0

    // Length conversions
    if (conversionType === "length") {
      const lengthConversions: { [key: string]: number } = {
        // Base unit: millimeter
        mm: 1,
        cm: 10,
        m: 1000,
        inch: 25.4,
        ft: 304.8,
        yard: 914.4,
      }

      if (lengthConversions[fromUnit] && lengthConversions[toUnit]) {
        // Convert to mm first, then to target unit
        const inMm = fromValue * lengthConversions[fromUnit]
        result = inMm / lengthConversions[toUnit]
      }
    }

    // Weight conversions
    else if (conversionType === "weight") {
      const weightConversions: { [key: string]: number } = {
        // Base unit: gram
        g: 1,
        kg: 1000,
        ton: 1000000,
        oz: 28.3495,
        lb: 453.592,
      }

      if (weightConversions[fromUnit] && weightConversions[toUnit]) {
        const inGrams = fromValue * weightConversions[fromUnit]
        result = inGrams / weightConversions[toUnit]
      }
    }

    // Temperature conversions
    else if (conversionType === "temperature") {
      if (fromUnit === "celsius" && toUnit === "fahrenheit") {
        result = (fromValue * 9) / 5 + 32
      } else if (fromUnit === "fahrenheit" && toUnit === "celsius") {
        result = ((fromValue - 32) * 5) / 9
      } else if (fromUnit === "celsius" && toUnit === "kelvin") {
        result = fromValue + 273.15
      } else if (fromUnit === "kelvin" && toUnit === "celsius") {
        result = fromValue - 273.15
      } else if (fromUnit === "fahrenheit" && toUnit === "kelvin") {
        result = ((fromValue - 32) * 5) / 9 + 273.15
      } else if (fromUnit === "kelvin" && toUnit === "fahrenheit") {
        result = ((fromValue - 273.15) * 9) / 5 + 32
      } else {
        result = fromValue // Same unit
      }
    }

    // Volume conversions
    else if (conversionType === "volume") {
      const volumeConversions: { [key: string]: number } = {
        // Base unit: milliliter
        ml: 1,
        l: 1000,
        m3: 1000000,
        in3: 16.3871,
        ft3: 28316.8,
        gal: 3785.41,
      }

      if (volumeConversions[fromUnit] && volumeConversions[toUnit]) {
        const inMl = fromValue * volumeConversions[fromUnit]
        result = inMl / volumeConversions[toUnit]
      }
    }

    setToValue(Math.round(result * 10000) / 10000)
  }, [fromValue, conversionType, fromUnit, toUnit])

  const resetInchMm = () => {
    setInches(0)
    setMillimeters(0)
  }

  const resetGeneric = () => {
    setFromValue(0)
    setToValue(0)
  }

  const swapUnits = () => {
    const tempUnit = fromUnit
    const tempValue = toValue
    setFromUnit(toUnit)
    setToUnit(tempUnit)
    setFromValue(tempValue)
  }

  const getUnitsForType = (type: string) => {
    switch (type) {
      case "length":
        return [
          { value: "mm", label: "Millimeter (mm)" },
          { value: "cm", label: "Centimeter (cm)" },
          { value: "m", label: "Meter (m)" },
          { value: "inch", label: "Inch (in)" },
          { value: "ft", label: "Feet (ft)" },
          { value: "yard", label: "Yard (yd)" },
        ]
      case "weight":
        return [
          { value: "g", label: "Gram (g)" },
          { value: "kg", label: "Kilogram (kg)" },
          { value: "ton", label: "Ton (t)" },
          { value: "oz", label: "Ounce (oz)" },
          { value: "lb", label: "Pound (lb)" },
        ]
      case "temperature":
        return [
          { value: "celsius", label: "Celsius (°C)" },
          { value: "fahrenheit", label: "Fahrenheit (°F)" },
          { value: "kelvin", label: "Kelvin (K)" },
        ]
      case "volume":
        return [
          { value: "ml", label: "Milliliter (ml)" },
          { value: "l", label: "Liter (l)" },
          { value: "m3", label: "Cubic Meter (m³)" },
          { value: "in3", label: "Cubic Inch (in³)" },
          { value: "ft3", label: "Cubic Feet (ft³)" },
          { value: "gal", label: "Gallon (gal)" },
        ]
      default:
        return []
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(num)
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Unit Conversion</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="inch-mm" className="w-full">
          <TabsList>
            <TabsTrigger value="inch-mm">Inch ↔ Millimeter</TabsTrigger>
            <TabsTrigger value="generic">Universal Converter</TabsTrigger>
          </TabsList>

          <TabsContent value="inch-mm">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Inch to Millimeter Conversion
                </CardTitle>
                <CardDescription>Convert inches to millimeters using the formula: 1 inch = 25.4 mm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="inches" className="text-lg font-semibold">
                          🔹 Input
                        </Label>
                        <div className="space-y-2">
                          <Label htmlFor="inches">Inches</Label>
                          <Input
                            id="inches"
                            type="number"
                            step="0.0001"
                            value={inches}
                            onChange={(e) => setInches(Number.parseFloat(e.target.value) || 0)}
                            placeholder="0.0"
                            className="text-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Output Section */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-lg font-semibold">🔸 Output</Label>
                        <div className="space-y-2">
                          <Label>Millimeters</Label>
                          <Input
                            value={formatNumber(millimeters)}
                            readOnly
                            className="bg-primary/10 text-lg font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Example and Formula */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Formula</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm font-mono">1 inch = 25.4 mm</p>
                        <p className="text-sm font-mono">mm = inches × 25.4</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">✅ Example</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">Input: 2.0 in</p>
                        <p className="text-sm">Output: 50.8 mm</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetInchMm}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5" />
                  Universal Unit Converter
                </CardTitle>
                <CardDescription>
                  Convert between various units for length, weight, temperature, and volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Conversion Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="conversionType">Conversion Type</Label>
                    <Select value={conversionType} onValueChange={setConversionType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="length">Length</SelectItem>
                        <SelectItem value="weight">Weight</SelectItem>
                        <SelectItem value="temperature">Temperature</SelectItem>
                        <SelectItem value="volume">Volume</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* From Section */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-lg font-semibold">From</Label>
                        <div className="space-y-2">
                          <Label htmlFor="fromUnit">Unit</Label>
                          <Select value={fromUnit} onValueChange={setFromUnit}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getUnitsForType(conversionType).map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fromValue">Value</Label>
                          <Input
                            id="fromValue"
                            type="number"
                            step="0.0001"
                            value={fromValue}
                            onChange={(e) => setFromValue(Number.parseFloat(e.target.value) || 0)}
                            placeholder="0.0"
                            className="text-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* To Section */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-lg font-semibold">To</Label>
                        <div className="space-y-2">
                          <Label htmlFor="toUnit">Unit</Label>
                          <Select value={toUnit} onValueChange={setToUnit}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getUnitsForType(conversionType).map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Result</Label>
                          <Input value={formatNumber(toValue)} readOnly className="bg-primary/10 text-lg font-bold" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={swapUnits}>
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Swap Units
                    </Button>
                    <Button variant="outline" onClick={resetGeneric}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Length</h4>
                    <ul className="space-y-1 text-xs">
                      <li>1 inch = 25.4 mm</li>
                      <li>1 foot = 304.8 mm</li>
                      <li>1 meter = 1000 mm</li>
                      <li>1 yard = 914.4 mm</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Weight</h4>
                    <ul className="space-y-1 text-xs">
                      <li>1 kg = 1000 g</li>
                      <li>1 lb = 453.592 g</li>
                      <li>1 oz = 28.3495 g</li>
                      <li>1 ton = 1000 kg</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Temperature</h4>
                    <ul className="space-y-1 text-xs">
                      <li>°F = (°C × 9/5) + 32</li>
                      <li>°C = (°F - 32) × 5/9</li>
                      <li>K = °C + 273.15</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Volume</h4>
                    <ul className="space-y-1 text-xs">
                      <li>1 liter = 1000 ml</li>
                      <li>1 gallon = 3785.41 ml</li>
                      <li>1 ft³ = 28316.8 ml</li>
                      <li>1 m³ = 1000000 ml</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
