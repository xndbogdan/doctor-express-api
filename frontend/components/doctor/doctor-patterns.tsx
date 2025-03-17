"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { type RecurringPattern, getDoctorPatterns, updatePatternStatus, deletePattern } from "@/lib/api"

interface DoctorPatternsProps {
  doctorId: number
}

const weekDays = [
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
  { id: 7, label: "Sunday" },
]

export function DoctorPatterns({ doctorId }: DoctorPatternsProps) {
  const [patterns, setPatterns] = useState<RecurringPattern[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const data = await getDoctorPatterns(doctorId)
        setPatterns(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch patterns",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (doctorId) {
      fetchPatterns()
    }
  }, [doctorId, toast])

  async function handleTogglePattern(patternId: number, isActive: boolean) {
    try {
      const updatedPattern = await updatePatternStatus(doctorId, patternId, isActive)
      setPatterns(patterns.map((p) => (p.id === patternId ? updatedPattern : p)))
      toast({
        title: "Success",
        description: `Pattern ${isActive ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pattern status",
        variant: "destructive",
      })
    }
  }

  async function handleDeletePattern(patternId: number) {
    try {
      await deletePattern(doctorId, patternId)
      setPatterns(patterns.filter((p) => p.id !== patternId))
      toast({
        title: "Success",
        description: "Pattern deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete pattern",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Appointment Patterns</CardTitle>
        <CardDescription>Manage your recurring appointment patterns</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading patterns...</div>
        ) : patterns.length === 0 ? (
          <div className="text-center py-4">No patterns found</div>
        ) : (
          <div className="space-y-4">
            {patterns.map((pattern) => (
              <Card key={pattern.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)} Pattern
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(pattern.start_time), "h:mm a Y-MM-dd")} -{" "}
                        {format(new Date(pattern.end_time), "h:mm a Y-MM-dd")}
                      </p>
                      <p className="text-sm text-muted-foreground">{pattern.duration} minute appointments</p>
                      {pattern.week_days && pattern.week_days.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Days: {pattern.week_days.map((day) => weekDays.find((d) => d.id === day)?.label).join(", ")}
                        </p>
                      )}
                      {pattern.end_date && (
                        <p className="text-sm text-muted-foreground">
                          Until: {format(new Date(pattern.end_date), "PPP")}
                        </p>
                      )}
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${pattern.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                        >
                          {pattern.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant={pattern.is_active ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleTogglePattern(pattern.id, !pattern.is_active)}
                      >
                        {pattern.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePattern(pattern.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

