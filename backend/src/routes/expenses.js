import express from "express";
const router = express.Router();
import prisma from "../prismaClient.js";

// GET /api/expenses -> List all expenses (for HR/Manager)
router.get("/", async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        employee: {
          select: { id: true, name: true, employeeId: true, department: true }
        }
      },
      orderBy: { date: "desc" }
    });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// GET /api/expenses/employee/:employeeId -> List expenses for a specific employee
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { employeeId: req.params.employeeId },
      orderBy: { date: "desc" }
    });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch employee expenses" });
  }
});

// POST /api/expenses -> Submit an expense
router.post("/", async (req, res) => {
  try {
    const { employeeId, category, amount, date, description, receiptUrl } = req.body;
    const expense = await prisma.expense.create({
      data: { 
        employeeId, 
        category, 
        amount: parseFloat(amount), 
        date: new Date(date), 
        description, 
        receiptUrl 
      }
    });
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit expense" });
  }
});

// PUT /api/expenses/:id/status -> Approve/Reject expense
router.put("/:id/status", async (req, res) => {
  try {
    const { status, approvedBy } = req.body; // status: APPROVED, REJECTED, REIMBURSED
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: { status, approvedBy }
    });
    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update expense status" });
  }
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

export default router;
