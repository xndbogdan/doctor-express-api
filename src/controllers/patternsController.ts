import { Request, RequestHandler, Response } from "express";
import prisma from "@/lib/prisma";
import {
  findDoctorById,
} from "@/actions/doctors";
import {
  availableSlotsCache,
} from "@/services/cacheService";

class PatternsController {
  public index: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const doctorResult = await findDoctorById(doctorId);

      if (!doctorResult.success) {
        res.status(doctorResult.error!.status).json({
          message: doctorResult.error!.message,
        });
        return;
      }

      const patterns = await prisma.recurringPattern.findMany({
        where: {
          doctorId: doctorId,
          is_active: true,
        },
      });

      res.status(200).json({
        data: patterns,
      });
    } catch (error) {
      console.error("Error fetching patterns:", error);
      res.status(500).json({
        message: "An error occurred while fetching patterns",
      });
    }
  };

  public update: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const doctorResult = await findDoctorById(doctorId);

      if (!doctorResult.success) {
        res.status(doctorResult.error!.status).json({
          message: doctorResult.error!.message,
        });
        return;
      }

      const { patternId } = req.params;
      const pattern = await prisma.recurringPattern.findUnique({
        where: { id: parseInt(patternId) },
      });

      if (pattern?.doctorId !== doctorId) {
        res.status(404).json({ message: "Pattern not found" });
        return;
      }

      if (!pattern) {
        res.status(404).json({ message: "Pattern not found" });
        return;
      }

      const { is_active } = req.body;

      // Only update is_active status for now
      // Could expand this to update other pattern properties if needed
      if (typeof is_active !== "boolean") {
        res.status(400).json({
          message: "is_active must be a boolean value",
        });
        return;
      }

      const updatedPattern = await prisma.recurringPattern.update({
        where: { id: parseInt(patternId) },
        data: { is_active },
      });

      // Invalidate all caches for this doctor
      await availableSlotsCache.invalidateAll(doctorId);

      res.status(200).json({
        message: `Pattern ${
          is_active ? "activated" : "deactivated"
        } successfully`,
        data: updatedPattern,
      });
    } catch (error) {
      console.error("Error updating pattern:", error);
      res.status(500).json({
        message: "An error occurred while updating the pattern",
      });
    }
  };

  public destroy = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const doctorResult = await findDoctorById(doctorId);

      if (!doctorResult.success) {
        res.status(doctorResult.error!.status).json({
          message: doctorResult.error!.message,
        });
        return;
      }

      const { patternId } = req.params;
      const pattern = await prisma.recurringPattern.findUnique({
        where: { id: parseInt(patternId) },
      });

      if (pattern?.doctorId !== doctorId) {
        res.status(404).json({ message: "Pattern not found" });
        return;
      }

      if (!pattern) {
        res.status(404).json({ message: "Pattern not found" });
        return;
      }

      await prisma.recurringPattern.delete({
        where: { id: parseInt(patternId) },
      });

      // Invalidate all caches for this doctor
      await availableSlotsCache.invalidateAll(doctorId);

      res.status(200).json({
        message: "Pattern deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting pattern:", error);
      res.status(500).json({
        message: "An error occurred while deleting the pattern",
      });
    }
  }
}

export default new PatternsController();