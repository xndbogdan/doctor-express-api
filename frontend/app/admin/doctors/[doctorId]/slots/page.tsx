import { SlotManagement } from "@/components/admin/slot-management"

export default function DoctorSlotsPage({
  params,
}: {
  params: { doctorId: string }
}) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Manage Doctor Slots</h1>
      <SlotManagement doctorId={Number.parseInt(params.doctorId)} />
    </div>
  )
}

