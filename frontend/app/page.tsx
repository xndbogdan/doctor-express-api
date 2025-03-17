import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CalendarDays, Users, UserRound } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Doctor Appointment System</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Portal</CardTitle>
            <CardDescription>Manage doctors and appointment slots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Add new doctors, create appointment slots, and manage the system.
              </p>
              <Link href="/admin">
                <Button className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Enter Admin Portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doctor Portal</CardTitle>
            <CardDescription>Manage your appointment slots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">View your schedule and manage your appointment slots.</p>
              <Link href="/doctor">
                <Button className="w-full" variant="outline">
                  <UserRound className="mr-2 h-4 w-4" />
                  Enter Doctor Portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Portal</CardTitle>
            <CardDescription>Book appointments with doctors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">Find available doctors and book appointments.</p>
              <Link href="/patient">
                <Button className="w-full" variant="secondary">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Book an Appointment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

