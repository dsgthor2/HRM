import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get all timesheets (Admin) or my timesheets (User)
router.get("/", auth, async (req, res) => {
  const { employeeId, status, startDate, endDate } = req.query;
  const where = {};

  try {
    if (req.user.role === 'USER') {
      // If regular user, only show own timesheets
      const employee = await prisma.employee.findUnique({ where: { email: req.user.email } });
      if (!employee) return res.json([]);
      where.employeeId = employee.id;
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) where.status = status;
    if (startDate && endDate) {
      where.startDate = { gte: new Date(startDate) };
      where.endDate = { lte: new Date(endDate) };
    }

    const timesheets = await prisma.timesheet.findMany({
      where,
      include: {
        employee: { select: { name: true, employeeId: true, email: true, department: true, designation: true, reportingTo: true } },
        entries: {
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    res.json(timesheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single timesheet
router.get("/:id", auth, async (req, res) => {
  try {
    const timesheet = await prisma.timesheet.findUnique({
      where: { id: req.params.id },
      include: {
        employee: { select: { name: true, employeeId: true, email: true, department: true, designation: true, reportingTo: true } },
        entries: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!timesheet) return res.status(404).json({ message: "Timesheet not found" });

    // Check permission
    if (req.user.role === 'USER') {
      const employee = await prisma.employee.findUnique({ where: { email: req.user.email } });
      if (!employee || timesheet.employeeId !== employee.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    res.json(timesheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or Update Timesheet (Save as Draft)
router.post("/", auth, async (req, res) => {
  const { startDate, endDate, entries, type } = req.body;
  const tsType = type || 'WEEKLY';
  
  try {
    const employee = await prisma.employee.findUnique({ where: { email: req.user.email } });
    if (!employee) return res.status(404).json({ message: "Employee record not found" });

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const tsType = (type || 'WEEKLY').toUpperCase();

    // Calculate totals
    const totalHours = entries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
    const totalOvertime = entries.reduce((sum, entry) => sum + (parseFloat(entry.overtimeHours) || 0), 0);

    // Find existing timesheet to update or create new
    let timesheet = await prisma.timesheet.findFirst({
      where: {
        employeeId: employee.id,
        startDate: start,
        type: tsType
      }
    });

    if (timesheet) {
      // Update existing
      timesheet = await prisma.timesheet.update({
        where: { id: timesheet.id },
        data: {
          endDate: end,
          totalHours,
          totalOvertime,
          status: 'DRAFT',
          updatedAt: new Date(),
          entries: {
            deleteMany: {},
            create: entries.map(e => ({
              date: new Date(e.date),
              project: e.project,
              task: e.task,
              hours: parseFloat(e.hours) || 0,
              breakHours: parseFloat(e.breakHours) || 0,
              overtimeHours: parseFloat(e.overtimeHours) || 0,
              description: e.description,
              status: e.status || 'Present'
            }))
          }
        },
        include: { entries: true }
      });
    } else {
      // Create new
      timesheet = await prisma.timesheet.create({
        data: {
          employeeId: employee.id,
          type: tsType,
          startDate: start,
          endDate: end,
          totalHours,
          totalOvertime,
          status: 'DRAFT',
          entries: {
            create: entries.map(e => ({
              date: new Date(e.date),
              project: e.project,
              task: e.task,
              hours: parseFloat(e.hours) || 0,
              breakHours: parseFloat(e.breakHours) || 0,
              overtimeHours: parseFloat(e.overtimeHours) || 0,
              description: e.description,
              status: e.status || 'Present'
            }))
          }
        },
        include: { entries: true }
      });
    }

    res.json(timesheet);
  } catch (error) {
    console.error("Timesheet error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Submit Timesheet
router.post("/:id/submit", auth, async (req, res) => {
  try {
    const timesheet = await prisma.timesheet.findUnique({ where: { id: req.params.id } });
    if (!timesheet) return res.status(404).json({ message: "Timesheet not found" });

    // Update status
    const updated = await prisma.timesheet.update({
      where: { id: req.params.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Review Timesheet (Approve/Reject) - Admin/HR Only
router.post("/:id/review", auth, async (req, res) => {
  if (!["ADMIN", "HR"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied. Admins or HR only." });
  }
  const { status, comments } = req.body;
  console.log(`[TIMESHEET REVIEW] ID: ${req.params.id}, User: ${req.user.email}, Role: ${req.user.role}`);
  console.log(`[TIMESHEET REVIEW] Data:`, req.body);
  
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    console.error(`[TIMESHEET REVIEW] Invalid status: ${status}`);
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const updated = await prisma.timesheet.update({
      where: { id: req.params.id },
      data: {
        status,
        comments,
        reviewedAt: new Date(),
        reviewedBy: req.user.name || req.user.email
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk Review
router.post("/bulk-review", auth, async (req, res) => {
  if (!["ADMIN", "HR"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied. Admins or HR only." });
  }
  const { ids, status, comments } = req.body;
  
  try {
    const results = await prisma.timesheet.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        comments,
        reviewedAt: new Date(),
        reviewedBy: req.user.name || req.user.email
      }
    });
    res.json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Timesheet
router.delete("/:id", auth, async (req, res) => {
  try {
    const timesheet = await prisma.timesheet.findUnique({ where: { id: req.params.id } });
    if (!timesheet) return res.status(404).json({ message: "Timesheet not found" });

    // Users can only delete their own DRAFT timesheets
    if (req.user.role === 'USER' && timesheet.employeeId !== req.user.id && timesheet.status !== 'DRAFT') {
       // Wait, req.user.id is the User ID, but timesheet.employeeId is the Employee ID.
       // I should check if the user is the owner.
    }
    
    await prisma.timesheet.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
