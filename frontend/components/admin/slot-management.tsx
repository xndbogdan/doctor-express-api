"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format, addDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  type RecurringPattern,
  createDoctorSlots,
  getDoctorPatterns,
  updatePatternStatus,
  deletePattern,
} from "@/lib/api"
import { cn } from "@/lib/utils"

const weekDays = [
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
  { id: 7, label: "Sunday" },
]

const formSchema = z.object({
  start_time: z.string(),
  end_time: z.string(),
  duration: z.enum(["15", "30"]),
  recurrence_type: z.enum(["one-time", "daily", "weekly"]),
  end_date: z.string().optional(),
  week_days: z.array(z.number()).optional(),
})

interface SlotManagementProps {
  doctorId: number
}

export function SlotManagement({ doctorId }: SlotManagementProps) {
  const [patterns, setPatterns] = useState<RecurringPattern[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start_time: "09:00",
      end_time: "17:00",
      duration: "30",
      recurrence_type: "one-time",
      week_days: [],
    },
  })

  const recurrenceType = form.watch("recurrence_type")

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

    fetchPatterns()
  }, [doctorId, toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const today = new Date()
      const startDate = new Date(`${format(today, "yyyy-MM-dd")}T${values.start_time}`)
      const endDate = values.end_date ? new Date(values.end_date) : undefined

      const slotInput = {
        start_time: startDate.toISOString(),
        end_time: new Date(`${format(today, "yyyy-MM-dd")}T${values.end_time}`).toISOString(),
        duration: Number.parseInt(values.duration) as 15 | 30,
        recurrence: {
          type: values.recurrence_type,
          end_date: endDate?.toISOString(),
          week_days: values.week_days,
        },
      }

      const newPattern = await createDoctorSlots(doctorId, slotInput)
      setPatterns([...patterns, newPattern])
      toast({
        title: "Success",
        description: "Slots created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create slots",
        variant: "destructive",
      })
    }
  }

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
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Appointment Slots</CardTitle>
          <CardDescription>Set up recurring or one-time appointment slots for this doctor</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recurrence_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recurrence type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {recurrenceType !== "one-time" && (
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                            disabled={(date) => date < addDays(new Date(), 1)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>The end date for recurring appointments</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {recurrenceType === "weekly" && (
                <FormField
                  control={form.control}
                  name="week_days"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Days of Week</FormLabel>
                        <FormDescription>Select which days of the week to create slots for</FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {weekDays.map((day) => (
                          <FormField
                            key={day.id}
                            control={form.control}
                            name="week_days"
                            render={({ field }) => {
                              return (
                                <FormItem key={day.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(day.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), day.id])
                                          : field.onChange(field.value?.filter((value) => value !== day.id))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{day.label}</FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit">Create Slots</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recurring Patterns</CardTitle>
          <CardDescription>Manage existing recurring appointment patterns</CardDescription>
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
                          {format(new Date(pattern.start_time), "h:mm a")} -{" "}
                          {format(new Date(pattern.end_time), "h:mm a")}
                        </p>
                        <p>
                          Available Until: {pattern.end_date ? format(new Date(pattern.end_date), "PPP") : "N/A"}
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
    </div>
  )
}

