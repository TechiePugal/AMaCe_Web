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
import { Pencil, Trash2, Upload, Download } from "lucide-react"

interface Customer {
  id?: string
  customerName: string
  mobileNumber: string
  emailId1: string
  addressLine1: string
  addressLine2: string
  emailId2: string
  regionCity: string
  keyPerson: string
  keyPersonDesignation: string
  keyPersonContact: string
  keyPersonEmail: string
  phoneNumber: string
  state: string
  country: string
  pincode: string
  status: string
  customerCode: string
}

export default function CustomerMaster() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Customer>({
    customerName: "",
    mobileNumber: "",
    emailId1: "",
    addressLine1: "",
    addressLine2: "",
    emailId2: "",
    regionCity: "",
    keyPerson: "",
    keyPersonDesignation: "",
    keyPersonContact: "",
    keyPersonEmail: "",
    phoneNumber: "",
    state: "",
    country: "",
    pincode: "",
    status: "Active",
    customerCode: "",
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoading(true)
    const result = await FirebaseService.getAll("customers")
    if (result.success) {
      setCustomers(result.data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingId) {
        result = await FirebaseService.update("customers", editingId, formData)
      } else {
        result = await FirebaseService.create("customers", formData)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Customer ${editingId ? "updated" : "created"} successfully`,
        })
        resetForm()
        loadCustomers()
      } else {
        throw new Error("Failed to save customer")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save customer",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      customerName: "",
      mobileNumber: "",
      emailId1: "",
      addressLine1: "",
      addressLine2: "",
      emailId2: "",
      regionCity: "",
      keyPerson: "",
      keyPersonDesignation: "",
      keyPersonContact: "",
      keyPersonEmail: "",
      phoneNumber: "",
      state: "",
      country: "",
      pincode: "",
      status: "Active",
      customerCode: "",
    })
    setEditingId(null)
  }

  const handleEdit = (customer: Customer) => {
    setFormData(customer)
    setEditingId(customer.id!)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      const result = await FirebaseService.delete("customers", id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Customer deleted successfully",
        })
        loadCustomers()
      }
    }
  }

  const handleInputChange = (field: keyof Customer, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Customer Master</h1>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Add/Edit Customer</TabsTrigger>
            <TabsTrigger value="list">Customer List</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Customer" : "Add New Customer"}</CardTitle>
                <CardDescription>
                  {editingId ? "Update customer information" : "Enter customer details to add to the system"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange("customerName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerCode">Customer Code *</Label>
                      <Input
                        id="customerCode"
                        value={formData.customerCode}
                        onChange={(e) => handleInputChange("customerCode", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Mobile Number *</Label>
                      <Input
                        id="mobileNumber"
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailId1">Email ID 1 *</Label>
                      <Input
                        id="emailId1"
                        type="email"
                        value={formData.emailId1}
                        onChange={(e) => handleInputChange("emailId1", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailId2">Email ID 2</Label>
                      <Input
                        id="emailId2"
                        type="email"
                        value={formData.emailId2}
                        onChange={(e) => handleInputChange("emailId2", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Textarea
                        id="addressLine1"
                        value={formData.addressLine1}
                        onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Textarea
                        id="addressLine2"
                        value={formData.addressLine2}
                        onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="regionCity">Region / City</Label>
                      <Input
                        id="regionCity"
                        value={formData.regionCity}
                        onChange={(e) => handleInputChange("regionCity", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyPerson">Key Person</Label>
                      <Input
                        id="keyPerson"
                        value={formData.keyPerson}
                        onChange={(e) => handleInputChange("keyPerson", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keyPersonDesignation">Key Person Designation</Label>
                      <Input
                        id="keyPersonDesignation"
                        value={formData.keyPersonDesignation}
                        onChange={(e) => handleInputChange("keyPersonDesignation", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keyPersonContact">Key Person Contact</Label>
                      <Input
                        id="keyPersonContact"
                        type="tel"
                        value={formData.keyPersonContact}
                        onChange={(e) => handleInputChange("keyPersonContact", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keyPersonEmail">Key Person Email</Label>
                      <Input
                        id="keyPersonEmail"
                        type="email"
                        value={formData.keyPersonEmail}
                        onChange={(e) => handleInputChange("keyPersonEmail", e.target.value)}
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
                <CardTitle>Customer List</CardTitle>
                <CardDescription>Manage all customers in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Code</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.customerCode}</TableCell>
                        <TableCell>{customer.customerName}</TableCell>
                        <TableCell>{customer.mobileNumber}</TableCell>
                        <TableCell>{customer.emailId1}</TableCell>
                        <TableCell>{customer.regionCity}</TableCell>
                        <TableCell>
                          <Badge variant={customer.status === "Active" ? "default" : "secondary"}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(customer)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(customer.id!)}>
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
