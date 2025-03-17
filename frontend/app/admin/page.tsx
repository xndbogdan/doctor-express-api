import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DoctorManagement } from "@/components/admin/doctor-management"
import { PatientManagement } from "@/components/admin/patient-management"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Portal</h1>

      <Tabs defaultValue="doctors">
        <TabsList className="mb-4">
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
        </TabsList>
        <TabsContent value="doctors">
          <DoctorManagement />
        </TabsContent>
        <TabsContent value="patients">
          <PatientManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}

