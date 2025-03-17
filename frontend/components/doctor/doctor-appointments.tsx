"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { type Booking, getDoctorBookings } from "@/lib/api"

interface DoctorAppointmentsProps {
  doctorId: number
  date: Date
}

export function DoctorAppointments({ doctorId, date }: DoctorAppointmentsProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const startDate = new Date(date)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(date)
        endDate.setHours(23, 59, 59, 999)

        const data = await getDoctorBookings(doctorId, startDate.toISOString(), endDate.toISOString())
        setBookings(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch bookings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (doctorId) {
      fetchBookings()
    }
  }, [doctorId, date, toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments for {format(date, "MMMM d, yyyy")}</CardTitle>
        <CardDescription>View all appointments for this date</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading appointments...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-4">No appointments for this date</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">
                        {format(parseISO(booking.slot.start_time), "h:mm a")} -{" "}
                        {format(parseISO(booking.slot.end_time), "h:mm a")}
                      </h3>
                      <p className="text-sm font-medium">
                        {booking.patient.first_name} {booking.patient.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{booking.patient.email}</p>
                      {booking.patient.phone && (
                        <p className="text-sm text-muted-foreground">{booking.patient.phone}</p>
                      )}
                      {booking.reason && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Reason:</span> {booking.reason}
                        </p>
                      )}
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

