import prisma from "@/lib/prisma";

interface PatientResult {
  success: boolean;
  data?: any;
  error?: {
    status: number;
    message: string;
  };
}

/**
 * Finds a patient by ID and handles not found case
 * @param patientId The patient ID to look up
 * @param include Optional related entities to include
 * @returns An object with success flag and patient data or error information
 */
export const findPatientById = async (
  patientId: string | number,
  include?: any
): Promise<PatientResult> => {
  const id = typeof patientId === "string" ? parseInt(patientId) : patientId;

  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include,
    });

    if (!patient) {
      return {
        success: false,
        error: {
          status: 404,
          message: "Patient not found",
        },
      };
    }

    return {
      success: true,
      data: patient,
    };
  } catch (error) {
    console.error("Error finding patient:", error);
    return {
      success: false,
      error: {
        status: 500,
        message: "An error occurred while finding the patient",
      },
    };
  }
};

export default findPatientById;
