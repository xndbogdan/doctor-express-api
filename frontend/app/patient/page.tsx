"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { type Doctor, type Patient, getDoctors, getPatients } from "@/lib/api"
import { DoctorSlots } from "@/components/patient/doctor-slots"

export default function PatientPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [date, setDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsData, patientsData] = await Promise.all([getDoctors(), getPatients()])

        setDoctors(doctorsData)
        setPatients(patientsData)

        if (doctorsData.length > 0) {
          setSelectedDoctor(doctorsData[0].id)
        }

        if (patientsData.length > 0) {
          setSelectedPatient(patientsData[0].id)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Patient Portal</h1>

      {loading ? (
        <div className="text-center py-4">Loading data...</div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Book an Appointment</CardTitle>
              <CardDescription>Select a doctor, date, and available time slot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Patient</label>
                  <Select
                    value={selectedPatient?.toString() || ""}
                    onValueChange={(value) => setSelectedPatient(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No patients found
                        </SelectItem>
                      ) : (
                        patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.first_name} {patient.last_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Select Doctor</label>
                  <Select
                    value={selectedDoctor?.toString() || ""}
                    onValueChange={(value) => setSelectedDoctor(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No doctors found
                        </SelectItem>
                      ) : (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            Dr. {doctor.first_name} {doctor.last_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedDoctor && selectedPatient && (
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
                <DoctorSlots doctorId={selectedDoctor} patientId={selectedPatient} date={date} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

