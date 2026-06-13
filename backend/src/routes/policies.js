import express from "express";
import { prisma } from "../lib/prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();


// ── GET all policies (optionally filter by published/draft) ──────────────────
// GET /policies            → all
// GET /policies?type=draft → drafts only
// GET /policies?type=saved → published only
router.get("/", auth, async (req, res) => {
  try {
    const { type } = req.query;
    const where =
      type === "draft" ? { published: false } :
        type === "saved" ? { published: true } :
          {};

    const policies = await prisma.policy.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(policies);
  } catch (error) {
    console.error("GET /policies error:", error);
    res.status(500).json({ message: "Failed to fetch policies" });
  }
});

// ── GET single policy ────────────────────────────────────────────────────────
router.get("/:id", auth, async (req, res) => {
  try {
    const policy = await prisma.policy.findUnique({
      where: { id: req.params.id },
    });
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    res.json(policy);
  } catch (error) {
    console.error("GET /policies/:id error:", error);
    res.status(500).json({ message: "Failed to fetch policy" });
  }
});

// ── CREATE policy ─────────────────────────────────────────────────────────────
// Body: { title, content, category, published?, version? }
router.post("/", auth, async (req, res) => {
  try {
    const { title, content, category, published = false, version = "1.0" } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: "title, content, and category are required" });
    }

    const policy = await prisma.policy.create({
      data: { title, content, category, published, version },
    });
    res.status(201).json(policy);
  } catch (error) {
    console.error("POST /policies error:", error);
    res.status(500).json({ message: "Failed to create policy" });
  }
});

// ── UPDATE policy ─────────────────────────────────────────────────────────────
// Body: { title?, content?, category?, published?, version? }
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, content, category, published, version } = req.body;

    const existing = await prisma.policy.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Policy not found" });

    const policy = await prisma.policy.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(published !== undefined && { published }),
        ...(version !== undefined && { version }),
      },
    });
    res.json(policy);
  } catch (error) {
    console.error("PUT /policies/:id error:", error);
    res.status(500).json({ message: "Failed to update policy" });
  }
});

// ── PUBLISH a draft policy ───────────────────────────────────────────────────
router.patch("/:id/publish", auth, async (req, res) => {
  try {
    const policy = await prisma.policy.update({
      where: { id: req.params.id },
      data: { published: true },
    });
    res.json(policy);
  } catch (error) {
    console.error("PATCH /policies/:id/publish error:", error);
    res.status(500).json({ message: "Failed to publish policy" });
  }
});

// ── UNPUBLISH → move back to draft ───────────────────────────────────────────
router.patch("/:id/unpublish", auth, async (req, res) => {
  try {
    const policy = await prisma.policy.update({
      where: { id: req.params.id },
      data: { published: false },
    });
    res.json(policy);
  } catch (error) {
    console.error("PATCH /policies/:id/unpublish error:", error);
    res.status(500).json({ message: "Failed to unpublish policy" });
  }
});

// ── DELETE policy ─────────────────────────────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const existing = await prisma.policy.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Policy not found" });

    await prisma.policy.delete({ where: { id: req.params.id } });
    res.json({ message: "Policy deleted successfully" });
  } catch (error) {
    console.error("DELETE /policies/:id error:", error);
    res.status(500).json({ message: "Failed to delete policy" });
  }
});

export default router;