import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

const DEFAULT_TASKS = [
  "Submit Aadhaar card copy",
  "Submit PAN card copy",
  "Submit bank account details",
  "Submit educational certificates",
  "Submit previous employment letter",
  "Laptop & equipment issued",
  "Email account created",
  "System access & credentials provided",
  "HR induction completed",
  "Team introduction done",
  "Company policy documents signed",
  "Emergency contact form submitted",
];

router.get("/:employeeId", auth, async (req, res) => {
  const tasks = await prisma.onboarding.findMany({
    where: { employeeId: req.params.employeeId },
    orderBy: { createdAt: "asc" }
  });
  res.json(tasks);
});

router.post("/", auth, async (req, res) => {
  const data = { ...req.body };
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  const task = await prisma.onboarding.create({ data });
  res.json(task);
});

router.put("/:id", auth, async (req, res) => {
  const data = { ...req.body };
  if (data.completed === true) data.completedAt = new Date();
  if (data.completed === false) data.completedAt = null;
  const task = await prisma.onboarding.update({ where: { id: req.params.id }, data });
  res.json(task);
});

router.post("/init/:employeeId", auth, async (req, res) => {
  await prisma.onboarding.deleteMany({ where: { employeeId: req.params.employeeId } });
  const due = new Date(Date.now() + 7 * 86400000);
  const tasks = await Promise.all(
    DEFAULT_TASKS.map(taskName =>
      prisma.onboarding.create({
        data: { employeeId: req.params.employeeId, taskName, dueDate: due }
      })
    )
  );
  res.json(tasks);
});

router.delete("/:id", auth, async (req, res) => {
  await prisma.onboarding.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

export default router;