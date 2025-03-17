"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { type Doctor, getDoctors } from "@/lib/api"
import { DoctorAppointments } from "@/components/doctor/doctor-appointments"
import { DoctorPatterns } from "@/components/doctor/doctor-patterns"

export default function DoctorPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [date, setDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getDoctors()
        setDoctors(data)
        if (data.length > 0) {
          setSelectedDoctor(data[0].id)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch doctors",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [toast])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Doctor Portal</h1>

      {loading ? (
        <div className="text-center py-4">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-4">No doctors found in the system</div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Doctor</CardTitle>
              <CardDescription>Choose a doctor to view their schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedDoctor?.toString() || ""}
                onValueChange={(value) => setSelectedDoctor(Number.parseInt(value))}
              >
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      Dr. {doctor.first_name} {doctor.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedDoctor && (
            <Tabs defaultValue="appointments">
              <TabsList className="mb-4">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="patterns">Recurring Patterns</TabsTrigger>
              </TabsList>
              <TabsContent value="appointments">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        className="rounded-md border"
                      />
                    </CardContent>
                  </Card>
                  <div className="md:col-span-2">
                    <DoctorAppointments doctorId={selectedDoctor} date={date} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="patterns">
                <DoctorPatterns doctorId={selectedDoctor} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  )
}

