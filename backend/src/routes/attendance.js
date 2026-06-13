// ── ATTENDANCE ROUTE ──────────────────────────────────────────────────────────
import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth, isAdmin } from "../middleware/auth.js";
import { generateAttendanceReportPDF } from "../utils/pdfGenerator.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", auth, async (req, res) => {
  const { date, employeeId, month, year } = req.query;
  const where = {};
  if (date) where.date = new Date(date);
  if (employeeId) where.employeeId = employeeId;
  if (month && year) {
    where.date = {
      gte: new Date(year, month - 1, 1),
      lte: new Date(year, month, 0, 23, 59, 59),
    };
  }
  const records = await prisma.attendance.findMany({
    where,
    include: { employee: { select: { name: true, department: true, designation: true } } },
    orderBy: { date: "desc" }
  });
  res.json(records);
});

router.post("/", auth, async (req, res) => {
  try {
    const data = { ...req.body, date: new Date(req.body.date) };
    const existing = await prisma.attendance.findFirst({
      where: { employeeId: data.employeeId, date: data.date }
    });
    if (existing) {
      const updated = await prisma.attendance.update({ where: { id: existing.id }, data });
      return res.json(updated);
    }
    const rec = await prisma.attendance.create({ data });
    res.json(rec);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put("/live-status", auth, async (req, res) => {
  try {
    const { status, employeeId } = req.body;
    if (!status || !employeeId) return res.status(400).json({ message: "Status and employeeId required" });
    
    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: { 
        currentStatus: status,
        lastStatusUpdate: new Date()
      }
    });
    res.json({ currentStatus: updated.currentStatus, lastStatusUpdate: updated.lastStatusUpdate });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  const rec = await prisma.attendance.update({ where: { id: req.params.id }, data: req.body });
  res.json(rec);
});

router.get("/report/:employeeId", auth, async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const records = await prisma.attendance.findMany({
    where: { employeeId: req.params.employeeId, date: { gte: start, lte: end } },
    orderBy: { date: "asc" }
  });
  const summary = { PRESENT: 0, ABSENT: 0, LATE: 0, HALFDAY: 0, HOLIDAY: 0, WEEKEND: 0, WFH: 0 };
  records.forEach(r => { if (summary[r.status] !== undefined) summary[r.status]++; });
  res.json({ records, summary, total: records.length });
});

router.get("/report/:employeeId/pdf", auth, async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const records = await prisma.attendance.findMany({
    where: { employeeId: req.params.employeeId, date: { gte: start, lte: end } },
    orderBy: { date: "asc" }
  });
  
  const employee = await prisma.employee.findUnique({
    where: { id: req.params.employeeId }
  });
  if (!employee) return res.status(404).json({ message: "Employee not found" });

  const company = await prisma.company.findFirst() || {};

  const summary = { PRESENT: 0, ABSENT: 0, LATE: 0, HALFDAY: 0, HOLIDAY: 0, WEEKEND: 0, WFH: 0 };
  records.forEach(r => { if (summary[r.status] !== undefined) summary[r.status]++; });
  
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  
  try {
    const pdfUrl = await generateAttendanceReportPDF(
      { month: month, monthString: MONTHS[month - 1], year, records, summary, total: records.length },
      employee,
      company
    );
    res.json({ pdfUrl });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

router.post("/bulk", auth, async (req, res) => {
  const { date, records } = req.body;
  const results = [];
  for (const rec of records) {
    try {
      const d = new Date(date);
      const existing = await prisma.attendance.findFirst({
        where: { employeeId: rec.employeeId, date: d }
      });
      if (existing) {
        const u = await prisma.attendance.update({ where: { id: existing.id }, data: { ...rec, date: d } });
        results.push(u);
      } else {
        const c = await prisma.attendance.create({ data: { ...rec, date: d } });
        results.push(c);
      }
    } catch (e) { results.push({ error: e.message }); }
  }
  res.json(results);
});

// --- LIVE STATUS TRACKING ---

router.get("/live-status/stats", auth, async (req, res) => {
  try {
    const stats = await prisma.employee.groupBy({
      by: ['currentStatus'],
      _count: { id: true },
    });
    
    const result = { ONLINE: 0, OFFLINE: 0, IN_MEETING: 0, ON_BREAK: 0, LUNCH_BREAK: 0 };
    stats.forEach(s => {
      if (s.currentStatus) {
         result[s.currentStatus] = s._count.id;
      }
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});


router.get("/live-status/:employeeId", auth, async (req, res) => {
  try {
    const emp = await prisma.employee.findUnique({
      where: { id: req.params.employeeId },
      select: { currentStatus: true, lastStatusUpdate: true }
    });
    if (!emp) return res.status(404).json({ message: "Not found" });
    res.json(emp);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;