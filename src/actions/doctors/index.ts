import prisma from "@/lib/prisma";

interface DoctorResult {
  success: boolean;
  data?: any;
  error?: {
    status: number;
    message: string;
  };
}

/**
 * Finds a doctor by ID and handles not found case
 * @param doctorId The doctor ID to look up
 * @returns An object with success flag and doctor data or error information
 */
export const findDoctorById = async (
  doctorId: string | number
): Promise<DoctorResult> => {
  const id = typeof doctorId === "string" ? parseInt(doctorId) : doctorId;

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      return {
        success: false,
        error: {
          status: 404,
          message: "Doctor not found",
        },
      };
    }

    return {
      success: true,
      data: doctor,
    };
  } catch (error) {
    console.error("Error finding doctor:", error);
    return {
      success: false,
      error: {
        status: 500,
        message: "An error occurred while finding the doctor",
      },
    };
  }
};
