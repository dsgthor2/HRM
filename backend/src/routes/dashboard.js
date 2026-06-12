import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", auth, async (req, res) => {
  const [
    totalEmployees,
    activeEmployees,
    totalCandidates,
    pendingLeaves,
    payslipsThisMonth,
    byStatus,
    byDept,
    recentEmployees,
    recentCandidates,
    todayAttendance,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.candidate.count({ where: { stage: { notIn: ["HIRED", "REJECTED"] } } }),
    prisma.leaveRecord.count({ where: { status: "PENDING" } }),
    prisma.payslip.count({
      where: {
        month: new Date().toLocaleString("default", { month: "long" }),
        year: new Date().getFullYear(),
      }
    }),
    prisma.employee.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.employee.groupBy({ by: ["department"], _count: { id: true } }),
    prisma.employee.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, designation: true, department: true, joinDate: true, status: true }
    }),
    prisma.candidate.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, position: true, stage: true, createdAt: true }
    }),
    prisma.attendance.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: "PRESENT"
      }
    }),
  ]);

  res.json({
    kpis: {
      totalEmployees,
      activeEmployees,
      totalCandidates,
      pendingLeaves,
      payslipsThisMonth,
      todayPresent: todayAttendance,
    },
    charts: { byStatus, byDept },
    recentEmployees,
    recentCandidates,
  });
});

export default router;