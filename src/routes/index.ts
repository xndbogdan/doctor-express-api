import { Router } from "express";
import DoctorsController from "@/controllers/doctorsController";
import SlotsController from "@/controllers/slotsController";
import PatientsController from "@/controllers/patientsController";

const router = Router();

router.get("/doctors", DoctorsController.index);
router.post("/doctors", DoctorsController.store);

router.get("/doctors/:doctorId/slots", SlotsController.index);
router.post("/doctors/:doctorId/slots", SlotsController.store);

router.get("/patients", PatientsController.index);
router.post("/patients", PatientsController.store);
router.get("/patients/:patientId", PatientsController.show);
router.put("/patients/:patientId", PatientsController.update);
router.delete("/patients/:patientId", PatientsController.destroy);

export default router;