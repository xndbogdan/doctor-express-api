import { Router } from "express";
import DoctorsController from "@/controllers/doctorsController";
import SlotsController from "@/controllers/slotsController";

const router = Router();

// Doctor routes
router.get("/doctors", DoctorsController.index);
router.post("/doctors", DoctorsController.store);

router.get("/doctors/:doctorId/slots", SlotsController.index);
router.post("/doctors/:doctorId/slots", SlotsController.store);

export default router;