import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// ── Register (Admin only) ─────────────────────────
router.post("/register", auth, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Only allow ADMIN to create ADMIN users (default is USER)
    const assignedRole = role === "ADMIN" ? "ADMIN" : "USER";
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: assignedRole }
    });
    res.json({ message: "User created", id: user.id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Me ────────────────────────────────────────────────────────────────────────
router.get("/me", auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, smtpUser: true }
  });
  res.json(user);
});

// ── Change Password ───────────────────────────────────────────────────────────
router.put("/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!(await bcrypt.compare(oldPassword, user.password)))
    return res.status(400).json({ message: "Old password incorrect" });
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: await bcrypt.hash(newPassword, 10) }
  });
  res.json({ message: "Password updated" });
});

// ── Reset User Password (Admin only) ─
router.post("/forgot-password", auth, isAdmin, async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "No account found with this email" });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, 10) }
    });
    res.json({ message: "Password reset successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Update Profile (self) ─────────────────────────────────────────────────────
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone, department, designation } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, department, designation },
      select: { id: true, name: true, email: true, role: true, phone: true, department: true, designation: true, smtpUser: true }
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Self Mark Attendance (USER role - marks their own attendance) ─────────────
router.post("/mark-attendance", auth, async (req, res) => {
  try {
    const { checkIn, checkOut, status, remarks, date } = req.body;
    
    // Normalize logic: always work with local midnight for "dates"
    const now = new Date();
    const serverToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Local midnight
    
    let targetDate;
    if (date) {
      const [y, m, d] = date.split("-").map(Number);
      targetDate = new Date(y, m - 1, d); // Local midnight for the provided YYYY-MM-DD
    } else {
      targetDate = serverToday;
    }

    // Prevent future date marking
    if (targetDate > serverToday) {
      return res.status(400).json({ message: "Cannot mark attendance for future dates." });
    }

    // Find employee linked to this user by email
    const employee = await prisma.employee.findFirst({
      where: { email: req.user.email }
    });
    if (!employee) {
      return res.status(404).json({
        message: "No employee profile linked to your account. Please contact admin."
      });
    }

    // Check if already marked for this date
    const existing = await prisma.attendance.findFirst({
      where: { employeeId: employee.id, date: targetDate }
    });

    if (existing) {
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: { 
          checkIn: checkIn || existing.checkIn, 
          checkOut: checkOut || existing.checkOut, 
          status: status || existing.status, 
          remarks: remarks !== undefined ? remarks : existing.remarks 
        }
      });
      return res.json({ ...updated, alreadyMarked: true });
    }

    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const rec = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: targetDate,
        checkIn: checkIn || timeStr,
        status: status || "PRESENT",
        remarks
      }
    });
    res.json(rec);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// ── Get own attendance (USER) ─────────────────────────────────────────────────
router.get("/my-attendance", auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const employee = await prisma.employee.findFirst({ where: { email: req.user.email } });
    if (!employee) return res.json([]);

    const where = { employeeId: employee.id };
    if (month && year) {
      where.date = {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0, 23, 59, 59),
      };
    }
    const records = await prisma.attendance.findMany({ where, orderBy: { date: "desc" } });
    res.json({ records, employee });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Get own documents (USER) ─────────────────────────────────────────────────
router.get("/my-documents", auth, async (req, res) => {
  try {
    const employee = await prisma.employee.findFirst({
      where: { email: req.user.email },
      include: {
        payslips: { orderBy: { generated: "desc" } },
        letters: { orderBy: { createdAt: "desc" } },
      }
    });
    if (!employee) return res.json({ payslips: [], letters: [] });
    res.json({
      payslips: employee.payslips,
      letters: employee.letters,
      employee
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Update SMTP Settings (self) ───────────────────────────────────────────────
router.put("/smtp-settings", auth, async (req, res) => {
  try {
    const { smtpUser, smtpPass } = req.body;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { smtpUser, smtpPass }
    });
    res.json({ success: true, message: "SMTP credentials updated successfully." });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;