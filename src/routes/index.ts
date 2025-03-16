import { Router } from "express";
import DoctorsController from "@/controllers/doctorsController";
import SlotsController from "@/controllers/slotsController";

const router = Router();

// Doctor routes
router.get("/doctors", DoctorsController.index);
router.post("/doctors", DoctorsController.store);

router.post("/doctors/:doctorId/slots", SlotsController.createSlots);
export default router;