import express from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import { doctor } from "../utils/doctor.js";

const router = express.Router();

router.get("/diagnose", auth, isAdmin, (req, res) => {
  res.json(doctor.getReport());
});

export default router;
