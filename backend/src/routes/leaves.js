import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", auth, async (req, res) => {
  const { employeeId, status } = req.query;
  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  const leaves = await prisma.leaveRecord.findMany({
    where,
    include: { employee: { select: { name: true, department: true } } },
    orderBy: { createdAt: "desc" }
  });
  res.json(leaves);
});

// Pending leave count for admin notifications
router.get("/pending-count", auth, async (req, res) => {
  try {
    const pendingLeaves = await prisma.leaveRecord.findMany({
      where: { status: "PENDING" },
      include: { employee: { select: { name: true, department: true, designation: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    res.json({ count: pendingLeaves.length, leaves: pendingLeaves });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Self-service: get own leaves by email→employee
router.get("/my", auth, async (req, res) => {
  try {
    const employee = await prisma.employee.findFirst({ where: { email: req.user.email } });
    if (!employee) return res.json([]);
    const leaves = await prisma.leaveRecord.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(leaves);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Self-service: apply for leave
router.post("/apply", auth, async (req, res) => {
  try {
    const employee = await prisma.employee.findFirst({ where: { email: req.user.email } });
    if (!employee) return res.status(404).json({ message: "No employee profile found. Contact admin." });
    const { from, to, type, reason } = req.body;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const days = Math.ceil((toDate - fromDate) / 86400000) + 1;
    const leave = await prisma.leaveRecord.create({
      data: { employeeId: employee.id, leaveType: type, fromDate, toDate, days, reason, status: "PENDING" }
    });
    res.json(leave);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.post("/", auth, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.fromDate) data.fromDate = new Date(data.fromDate);
    if (data.toDate) data.toDate = new Date(data.toDate);
    if (!data.days) {
      const diff = Math.ceil((new Date(data.toDate) - new Date(data.fromDate)) / 86400000) + 1;
      data.days = diff;
    }
    const leave = await prisma.leaveRecord.create({ data });
    res.json(leave);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put("/:id/approve", auth, isAdmin, async (req, res) => {
  const leave = await prisma.leaveRecord.update({
    where: { id: req.params.id },
    data: { status: "APPROVED" }
  });
  res.json(leave);
});

router.put("/:id/reject", auth, isAdmin, async (req, res) => {
  const leave = await prisma.leaveRecord.update({
    where: { id: req.params.id },
    data: { status: "REJECTED" }
  });
  res.json(leave);
});

router.delete("/:id", auth, isAdmin, async (req, res) => {
  await prisma.leaveRecord.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

export default router;