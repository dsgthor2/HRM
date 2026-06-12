import express from "express";
const router = express.Router();
import { prisma } from "../lib/prisma.js";

// GET /api/assets -> List all assets (with employee info if assigned)
router.get("/", async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        assignedTo: {
          select: { id: true, name: true, employeeId: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

// GET /api/assets/employee/:employeeId -> List assets assigned to specific employee
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: { assignedToId: req.params.employeeId },
      orderBy: { assignedDate: "desc" }
    });
    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch employee assets" });
  }
});

// POST /api/assets -> Create new asset
router.post("/", async (req, res) => {
  try {
    const { name, type, serialNumber, status, notes } = req.body;
    const asset = await prisma.asset.create({
      data: { name, type, serialNumber, status, notes }
    });
    res.status(201).json(asset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create asset" });
  }
});

// PUT /api/assets/:id -> Update asset
router.put("/:id", async (req, res) => {
  try {
    const { name, type, serialNumber, status, notes } = req.body;
    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: { name, type, serialNumber, status, notes }
    });
    res.json(asset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

// POST /api/assets/:id/assign -> Assign asset to employee
router.post("/:id/assign", async (req, res) => {
  try {
    const { employeeId } = req.body;
    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: { 
        assignedToId: employeeId, 
        assignedDate: new Date(),
        status: "ASSIGNED"
      }
    });
    res.json(asset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to assign asset" });
  }
});

// POST /api/assets/:id/unassign -> Unassign asset
router.post("/:id/unassign", async (req, res) => {
  try {
    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: { 
        assignedToId: null, 
        assignedDate: null,
        status: "AVAILABLE"
      }
    });
    res.json(asset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to unassign asset" });
  }
});

// DELETE /api/assets/:id
router.delete("/:id", async (req, res) => {
  try {
    await prisma.asset.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

export default router;
