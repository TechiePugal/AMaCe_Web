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

interface Currency {
  id?: string
  currency: string
  status: string
}

export default function CurrencyMaster() {
  const { toast } = useToast()
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Currency>({
    currency: "",
    status: "Active",
  })

  useEffect(() => {
    loadCurrencies()
  }, [])

  const loadCurrencies = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("currencies")
    if (result.success) {
      setCurrencies(result.data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.currency.trim()) {
      toast({
        title: "Error",
        description: "Currency name is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      let result
      if (editingId) {
        result = await FirebaseService.update("currencies", editingId, formData)
      } else {
        result = await FirebaseService.create("currencies", formData)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Currency ${editingId ? "updated" : "created"} successfully`,
        })
        resetForm()
        loadCurrencies()
      } else {
        throw new Error("Failed to save currency")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save currency",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      currency: "",
      status: "Active",
    })
    setEditingId(null)
  }

  const handleEdit = (currency: Currency) => {
    setFormData(currency)
    setEditingId(currency.id!)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this currency?")) {
      const result = await FirebaseService.delete("currencies", id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Currency deleted successfully",
        })
        loadCurrencies()
      }
    }
  }

  const handleInputChange = (field: keyof Currency, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Currency Master</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Add/Edit Currency</TabsTrigger>
            <TabsTrigger value="list">Currency List</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Currency" : "Add New Currency"}</CardTitle>
                <CardDescription>
                  {editingId ? "Update currency information" : "Enter currency details to add to the system"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency Name *</Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => handleInputChange("currency", e.target.value)}
                      placeholder="e.g., INR, USD, EUR"
                      required
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
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Currency List</CardTitle>
                <CardDescription>Manage all currencies in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies.map((currency) => (
                      <TableRow key={currency.id}>
                        <TableCell className="font-medium">{currency.currency}</TableCell>
                        <TableCell>
                          <Badge variant={currency.status === "Active" ? "default" : "secondary"}>
                            {currency.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(currency)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(currency.id!)}>
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
