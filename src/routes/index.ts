import { Router } from "express";
import DoctorsController from "@/controllers/doctorsController";
import SlotsController from "@/controllers/slotsController";
import PatientsController from "@/controllers/patientsController";
import PatternsController from "@/controllers/patternsController";

const router = Router();

router.get("/doctors", DoctorsController.index);
router.post("/doctors", DoctorsController.store);

router.get("/doctors/:doctorId/slots", SlotsController.index);
router.post("/doctors/:doctorId/slots", SlotsController.store);

router.get("/doctors/:doctorId/patterns", PatternsController.index);
router.patch("/doctors/:doctorId/patterns/:patternId", PatternsController.update);
router.delete("/doctors/:doctorId/patterns/:patternId", PatternsController.destroy);

router.get("/patients", PatientsController.index);
router.post("/patients", PatientsController.store);
router.get("/patients/:patientId", PatientsController.show);
router.put("/patients/:patientId", PatientsController.update);
router.delete("/patients/:patientId", PatientsController.destroy);

export default router;