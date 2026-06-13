import express from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { auth, isAdmin } from "../middleware/auth.js";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();


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
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });
    
    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been suspended or is currently on hold. Please contact the administrator." });
    }

    // Auto-create Employee profile for ADMIN and SUPER_ADMIN if it doesn't exist
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      const existingEmp = await prisma.employee.findFirst({ where: { email: user.email } });
      if (!existingEmp) {
        const deptName = "Management";
        const desigTitle = user.role === "SUPER_ADMIN" ? "Super Admin" : "Administrator";

        await prisma.department.upsert({
          where: { name: deptName },
          update: {},
          create: { name: deptName }
        });

        await prisma.designation.upsert({
          where: { title: desigTitle },
          update: {},
          create: { title: desigTitle }
        });

        await prisma.employee.create({
          data: {
            employeeId: `ADM-${Date.now()}`,
            name: user.name,
            email: user.email,
            department: deptName,
            designation: desigTitle,
            status: "ACTIVE",
            joinDate: new Date()
          }
        });
      }
    }

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

// ── Forgot Password (Email Link) ──────────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 anyway to prevent email enumeration
      return res.json({ message: "If that email address is in our database, we will send you an email to reset your password." });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiration

    // Save token to DB
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: token,
        expiresAt: expiresAt
      }
    });

    // Send email
    const resetUrl = `${req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const mailOptions = {
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset. Please click the link below to set a new password:</p>
        <p><a href="${resetUrl}" style="padding: 10px 20px; background-color: #1e293b; color: #ffffff; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    };

    // Use admin's configured SMTP or fallback to default
    const adminUser = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } }) || await prisma.user.findFirst({ where: { role: "ADMIN" } });
    await sendEmail(mailOptions, adminUser);

    res.json({ message: "If that email address is in our database, we will send you an email to reset your password." });
  } catch (e) {
    console.error("[FORGOT PASSWORD ERROR]", e);
    res.status(500).json({ message: "An error occurred while processing your request." });
  }
});

// ── Reset Password (Using Token) ──────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Invalid token or password must be at least 6 characters." });
    }

    // Find token in DB
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Update user password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    });

    // Delete token
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    res.json({ message: "Password has been successfully reset. You can now log in." });
  } catch (e) {
    console.error("[RESET PASSWORD ERROR]", e);
    res.status(500).json({ message: "An error occurred while resetting your password." });
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

      // Update current live status on check-in or check-out
      if (checkOut) {
        await prisma.employee.update({
          where: { id: employee.id },
          data: { currentStatus: "OFFLINE", lastStatusUpdate: new Date() }
        });
      } else if (checkIn || status === "PRESENT" || status === "WFH") {
        await prisma.employee.update({
          where: { id: employee.id },
          data: { currentStatus: "ONLINE", lastStatusUpdate: new Date() }
        });
      }

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

    // Auto-set status to ONLINE on initial daily check-in
    await prisma.employee.update({
      where: { id: employee.id },
      data: { currentStatus: "ONLINE", lastStatusUpdate: new Date() }
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