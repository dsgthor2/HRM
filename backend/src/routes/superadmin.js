import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Only SUPER_ADMIN can access these routes
router.use(auth);
router.use(isSuperAdmin);

// ── List All Users ────────────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Update User Access/Role/Status ────────────────────────────────────────────
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;
    
    // Prevent changing your own active status or super admin role
    if (id === req.user.id && (isActive === false || role !== "SUPER_ADMIN")) {
      return res.status(400).json({ message: "You cannot suspend yourself or remove your Super Admin role." });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role, isActive }
    });
    res.json({ message: "User updated successfully", user: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Force Reset Password ──────────────────────────────────────────────────────
router.put("/users/:id/password", async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
    
    res.json({ message: "Password updated successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Delete User ───────────────────────────────────────────────────────────────
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete yourself." });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
