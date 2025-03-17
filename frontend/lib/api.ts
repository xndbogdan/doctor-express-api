// Types based on the Swagger schema
export interface Doctor {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  created_at: string
  updated_at: string
}

export interface DoctorInput {
  username: string
  first_name: string
  last_name: string
  email: string
}

export interface Patient {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
  updated_at: string
}

export interface PatientInput {
  first_name: string
  last_name: string
  email: string
  phone?: string
}

export type Slot = {
  doctorId: number
  start_time: string
  end_time: string
  status: "available" | "booked"
  patternId?: number
} & (
  | { id: string; virtual_id?: never }
  | { id?: never; virtual_id: string }
);

export interface SlotInput {
  start_time: string
  end_time: string
  duration: 15 | 30
  recurrence: {
    type: "daily" | "weekly" | "one-time"
    end_date?: string
    week_days?: number[]
  }
}

export interface Booking {
  id: number
  slotId: number
  patientId: number
  doctorId: number
  reason?: string
  created_at: string
  updated_at: string
  patient: Patient
  slot: Slot
}

export interface BookingInput {
  patientId: number
  reason?: string
}

export interface RecurringPattern {
  id: number
  doctor_id: number
  start_time: string
  end_time: string
  duration: number
  type: "daily" | "weekly" | "one-time"
  week_days?: number[]
  start_date: string
  end_date?: string
  is_active: boolean
}

// API functions
const API_BASE = process.env.NEXT_PUBLIC_API_URL

// Doctor API
export async function getDoctors(): Promise<Doctor[]> {
  const response = await fetch(`${API_BASE}/doctors`)
  const data = await response.json()
  return data.data
}

export async function createDoctor(doctor: DoctorInput): Promise<Doctor> {
  const response = await fetch(`${API_BASE}/doctors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(doctor),
  })
  const data = await response.json()
  return data.data
}

// Patient API
export async function getPatients(): Promise<Patient[]> {
  const response = await fetch(`${API_BASE}/patients`)
  const data = await response.json()
  return data.data
}

export async function getPatient(id: number): Promise<Patient> {
  const response = await fetch(`${API_BASE}/patients/${id}`)
  const data = await response.json()
  return data.data
}

export async function createPatient(patient: PatientInput): Promise<Patient> {
  const response = await fetch(`${API_BASE}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patient),
  })
  const data = await response.json()
  return data.data
}

// Slot API
export async function getDoctorSlots(doctorId: number, date: string): Promise<Slot[]> {
  const response = await fetch(`${API_BASE}/doctors/${doctorId}/slots?date=${date}`)
  const data = await response.json()
  return data.data
}

export async function createDoctorSlots(doctorId: number, slotInput: SlotInput): Promise<RecurringPattern> {
  const response = await fetch(`${API_BASE}/doctors/${doctorId}/slots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(slotInput),
  })
  const data = await response.json()
  return data.data
}

// Booking API
export async function bookSlot(slotId: string, bookingInput: BookingInput): Promise<Booking> {
  const response = await fetch(`${API_BASE}/slots/${slotId}/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingInput),
  })
  const data = await response.json()
  return data.data
}

export async function getDoctorBookings(doctorId: number, startDate: string, endDate: string): Promise<Booking[]> {
  const response = await fetch(`${API_BASE}/doctors/${doctorId}/bookings?start_date=${startDate}&end_date=${endDate}`)
  const data = await response.json()
  return data.data
}

// Pattern API
export async function getDoctorPatterns(doctorId: number): Promise<RecurringPattern[]> {
  const response = await fetch(`${API_BASE}/doctors/${doctorId}/patterns`)
  const data = await response.json()
  return data.data
}

export async function updatePatternStatus(
  doctorId: number,
  patternId: number,
  isActive: boolean,
): Promise<RecurringPattern> {
  const response = await fetch(`${API_BASE}/doctors/${doctorId}/patterns/${patternId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_active: isActive }),
  })
  const data = await response.json()
  return data.data
}

export async function deletePattern(doctorId: number, patternId: number): Promise<void> {
  await fetch(`${API_BASE}/doctors/${doctorId}/patterns/${patternId}`, {
    method: "DELETE",
  })
}

