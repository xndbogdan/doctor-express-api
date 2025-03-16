import { Router } from "express";
import DoctorsController from "@/controllers/doctorsController";

const router = Router();

// Doctor routes
router.get("/doctors", DoctorsController.index);
router.post("/doctors", DoctorsController.store);

export default router;