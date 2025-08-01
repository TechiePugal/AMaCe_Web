import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Construction, Clock, AlertCircle } from "lucide-react"

interface PageInDevelopmentProps {
  title?: string
  description?: string
  expectedDate?: string
}

export function PageInDevelopment({
  title = "Page In Development",
  description = "This page is currently under development and will be available soon.",
  expectedDate,
}: PageInDevelopmentProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Construction className="w-16 h-16 text-orange-500" />
              <Clock className="w-6 h-6 text-blue-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-700">{title}</CardTitle>
          <CardDescription className="text-gray-500">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>Waiting for Update</span>
            </div>
            {expectedDate && (
              <div className="text-sm text-gray-500">
                Expected completion: <span className="font-medium">{expectedDate}</span>
              </div>
            )}
            <div className="text-xs text-gray-400">Thank you for your patience while we work on this feature.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
