import express from "express";
const router = express.Router();
import prisma from "../prismaClient.js";

// --- GOALS ---

// GET /api/performance/goals -> List all goals
router.get("/goals", async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      include: { employee: { select: { id: true, name: true, department: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// GET /api/performance/goals/employee/:employeeId
router.get("/goals/employee/:employeeId", async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { employeeId: req.params.employeeId },
      orderBy: { createdAt: "desc" }
    });
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch employee goals" });
  }
});

// POST /api/performance/goals
router.post("/goals", async (req, res) => {
  try {
    const { employeeId, title, description, dueDate } = req.body;
    const goal = await prisma.goal.create({
      data: { 
        employeeId, 
        title, 
        description, 
        dueDate: dueDate ? new Date(dueDate) : null 
      }
    });
    res.status(201).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// PUT /api/performance/goals/:id/progress
router.put("/goals/:id/progress", async (req, res) => {
  try {
    const { progress, status } = req.body;
    const goal = await prisma.goal.update({
      where: { id: req.params.id },
      data: { progress: parseInt(progress), status }
    });
    res.json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update goal progress" });
  }
});

// --- REVIEWS ---

// GET /api/performance/reviews
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await prisma.performanceReview.findMany({
      include: { 
        employee: { select: { name: true, department: true } },
        reviewer: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /api/performance/reviews
router.post("/reviews", async (req, res) => {
  try {
    const { employeeId, reviewerId, reviewPeriod, rating, feedback } = req.body;
    const review = await prisma.performanceReview.create({
      data: { employeeId, reviewerId, reviewPeriod, rating: parseInt(rating), feedback }
    });
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

export default router;
