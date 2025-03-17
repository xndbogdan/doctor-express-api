"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { type Slot, getDoctorSlots, bookSlot } from "@/lib/api"

interface DoctorSlotsProps {
  doctorId: number
  patientId: number
  date: Date
}

export function DoctorSlots({ doctorId, patientId, date }: DoctorSlotsProps) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null)
  const [reason, setReason] = useState("")
  const [bookingInProgress, setBookingInProgress] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true)
        const formattedDate = format(date, "yyyy-MM-dd")
        const data = await getDoctorSlots(doctorId, formattedDate)
        setSlots(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch available slots",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (doctorId) {
      fetchSlots()
    }
  }, [doctorId, date, toast, bookingInProgress])

  async function handleBookSlot() {
    if (!bookingSlot) return

    try {
      setBookingInProgress(true)
      const id = bookingSlot.id || bookingSlot.virtual_id
      if (!id) return
      await bookSlot(id, {
        patientId,
        reason: reason.trim() || undefined,
      })

      // Update the slot status in the UI
      setSlots(slots.map((slot) => (slot.id === id ? { ...slot, status: "booked" } : slot)))

      setBookingSlot(null)
      setReason("")

      toast({
        title: "Success",
        description: "Appointment booked successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      })
    } finally {
      setBookingInProgress(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Slots for {format(date, "MMMM d, yyyy")}</CardTitle>
        <CardDescription>Select an available time slot to book your appointment</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading available slots...</div>
        ) : slots.length === 0 ? (
          <div className="text-center py-4">No available slots for this date</div>
        ) : (
          <div className="space-y-4">
            {bookingSlot ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/50">
                  <h3 className="font-medium mb-2">
                    Booking appointment for{" "}
                    {format(parseISO(bookingSlot.start_time || ""), "h:mm a")}
                  </h3>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Reason for visit (optional)</label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please describe the reason for your visit"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button onClick={handleBookSlot} disabled={bookingInProgress}>
                      {bookingInProgress ? "Booking..." : "Confirm Booking"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBookingSlot(null)
                        setReason("")
                      }}
                      disabled={bookingInProgress}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {slots
                  .filter((slot) => slot.status === "available")
                  .map((slot) => (
                    <Button
                      key={slot.id || slot.virtual_id}
                      variant="outline"
                      className="h-auto py-2"
                      onClick={() => setBookingSlot(slot)}
                    >
                      {format(parseISO(slot.start_time), "h:mm a")}
                    </Button>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

