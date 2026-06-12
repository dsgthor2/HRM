import express from "express";
import { prisma } from "../lib/prisma.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
router.use(auth);

// ── Generate next employee ID ─────────────────────────────────────
async function generateEmployeeId() {
  const last = await prisma.employee.findFirst({
    orderBy: { createdAt: "desc" },
    select: { employeeId: true },
  });
  if (!last?.employeeId) return "0001";
  const num = parseInt(last.employeeId.replace(/\D/g, ""), 10) || 0;
  return String(num + 1).padStart(4, "0");
}

// ── Sanitize incoming body ────────────────────────────────────────
function sanitize(body) {
  const d = { ...body };

  // Remove fields Prisma doesn't know about
  delete d.id;
  delete d.employeeId;
  delete d.createdAt;
  delete d.updatedAt;
  delete d._count;
  delete d.letters;
  delete d.payslips;
  delete d.documents;
  delete d.attendances;
  delete d.leaveRecords;
  delete d.departmentRel;
  delete d.designationRel;

  // Parse floats
  const floatFields = [
    "salary", "basicPct", "hraPct", "gratuityPct",
    "epfEmployer", "epfEmployee", "esiEmployer", "esiEmployee", "ptOverride",
  ];
  for (const f of floatFields) {
    if (d[f] !== undefined && d[f] !== null && String(d[f]).trim() !== "") {
      const val = parseFloat(d[f]);
      d[f] = isNaN(val) ? (f === "salary" ? 0 : null) : val;
    } else {
      d[f] = (f === "salary" ? 0 : null);
    }
  }

  // Parse dates
  const dateFields = ["dob", "joinDate", "confirmDate"];
  for (const f of dateFields) {
    if (d[f] && String(d[f]).trim() !== "") {
      const date = new Date(d[f]);
      d[f] = isNaN(date.getTime()) ? null : date;
    } else {
      d[f] = null;
    }
  }

  // Remove empty strings → null for optional fields
  const optionalStrings = [
    "phone", "gender", "pan", "aadhaar", "uan", "pfNumber", "bankName", "accountNo", "ifsc",
    "reportingTo", "workLocation", "addressLine1", "addressLine2",
    "city", "state", "pincode", "country",
  ];
  for (const f of optionalStrings) {
    if (d[f] === "" || d[f] === undefined) d[f] = null;
  }

  return d;
}

// ── GET /employees ────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { status, search = "", department } = req.query;

    const orConditions = [];
    if (String(search).trim()) {
      orConditions.push(
        { name:        { contains: search, mode: "insensitive" } },
        { email:       { contains: search, mode: "insensitive" } },
        { employeeId:  { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
        { department:  { contains: search, mode: "insensitive" } }
      );
    }

    let statusFilter = undefined;
    if (status) {
      const statuses = String(status).split(",").map(s => s.trim()).filter(Boolean);
      statusFilter = statuses.length === 1 ? statuses[0] : { in: statuses };
    }

    const where = {
      ...(statusFilter !== undefined && { status: statusFilter }),
      ...(department    && { department }),
      ...(orConditions.length > 0 && { OR: orConditions }),
    };

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { 
        _count: { select: { payslips: true, documents: true, letters: true, salaryHistory: true } },
        letters: { select: { type: true } }
      },
    });

    res.json(employees);
  } catch (err) {
    console.error("GET /employees error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

// ── GET /employees/me ─────────────────────────────────────────────
router.get("/me", async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { email: req.user.email },
    });
    if (!employee) return res.status(404).json({ error: "Not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /employees/:id ────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        letters:  { orderBy: { createdAt: "desc" }, take: 5 },
        payslips: { orderBy: { generated: "desc" }, take: 3 },
        _count:   { select: { payslips: true, documents: true, letters: true } },
      },
    });
    if (!employee) return res.status(404).json({ error: "Not found" });
    res.json(employee);
  } catch (err) {
    console.error("GET /employees/:id error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

// ── GET /employees/:id/active-salary ──────────────────────────────
router.get("/:id/active-salary", async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ error: "month and year are required" });

    const monthIdx = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ].indexOf(month);
    
    if (monthIdx === -1) return res.status(400).json({ error: "Invalid month name" });

    const targetDate = new Date(parseInt(year), monthIdx + 1, 0); // Last day of month
    
    // Find letters that might contain salary info
    const letters = await prisma.letter.findMany({
      where: { 
        employeeId: req.params.id,
        type: { in: ['OFFER', 'INCREMENT', 'APPOINTMENT'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    const employee = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    let activeSalary = employee.salary;
    let source = "current";

    for (const letter of letters) {
      const meta = letter.metadata || {};
      const effectiveDate = meta.effectiveDate ? new Date(meta.effectiveDate) : letter.createdAt;
      
      if (effectiveDate <= targetDate) {
        const sal = parseFloat(meta.monthlyGross) || parseFloat(meta.revisedCtc) || parseFloat(meta.revisedCtcOffer);
        if (sal) {
          activeSalary = sal;
          source = letter.type;
          break;
        }
      }
    }

    res.json({ salary: activeSalary, source });
  } catch (err) {
    console.error("GET active-salary error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/", async (req, res) => {
  try {
    const employeeId = await generateEmployeeId();
    const data = sanitize(req.body);

    // Required field guard
    if (!data.name || !data.email || !data.joinDate) {
      return res.status(400).json({ message: "name, email, and joinDate are required" });
    }

    // Default country
    if (!data.country) data.country = "India";

    // Default fallback structural columns to avoid foreign key errors on empty UI updates
    data.department = data.department || "Engineering";
    data.designation = data.designation || "Software Engineer";

    // Auto-create department/designation if missing to avoid P2003
    if (data.department) {
      await prisma.department.upsert({
        where: { name: data.department },
        update: {},
        create: { name: data.department }
      });
    }
    if (data.designation) {
      await prisma.designation.upsert({
        where: { title: data.designation },
        update: {},
        create: { title: data.designation }
      });
    }

    const { department, designation, ...otherData } = data;

    const employee = await prisma.employee.create({
      data: { 
        ...otherData, 
        employeeId,
        departmentRel: department ? { connect: { name: department } } : undefined,
        designationRel: designation ? { connect: { title: designation } } : undefined
      },
    });
    res.status(201).json(employee);
  } catch (err) {
    console.error("POST /employees error:", err);
    // Unique constraint (duplicate email)
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] || "field";
      return res.status(400).json({ message: `An employee with this ${field} already exists.` });
    }
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

// ── PUT /employees/:id ────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const data = sanitize(req.body);

    // If joinDate passed as null/empty in a PUT, we preserve the original
    if (data.joinDate === null) delete data.joinDate;
    
    if (data.department === "") delete data.department;
    if (data.designation === "") delete data.designation;

    // Auto-create department/designation if missing to avoid P2003
    if (data.department) {
      await prisma.department.upsert({
        where: { name: data.department },
        update: {},
        create: { name: data.department }
      });
    }
    if (data.designation) {
      await prisma.designation.upsert({
        where: { title: data.designation },
        update: {},
        create: { title: data.designation }
      });
    }

    const { department, designation, ...otherData } = data;

    const oldEmployee = await prisma.employee.findUnique({ where: { id: req.params.id } });

    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data: {
        ...otherData,
        departmentRel: department ? { connect: { name: department } } : undefined,
        designationRel: designation ? { connect: { title: designation } } : undefined
      },
    });

    if (oldEmployee && otherData.salary !== undefined && Number(otherData.salary) !== Number(oldEmployee.salary)) {
      await prisma.salaryHistory.create({
        data: {
          employeeId: req.params.id,
          salary: Number(otherData.salary),
          label: "Manual Profile Update",
          effectiveFrom: new Date(),
          basicPct: otherData.basicPct ?? oldEmployee.basicPct ?? 50,
          hraPct: otherData.hraPct ?? oldEmployee.hraPct ?? 40,
          epfEmployee: otherData.epfEmployee ?? oldEmployee.epfEmployee ?? 0,
          epfEmployer: otherData.epfEmployer ?? oldEmployee.epfEmployer ?? 0,
          esiEmployee: otherData.esiEmployee ?? oldEmployee.esiEmployee ?? 0,
          esiEmployer: otherData.esiEmployer ?? oldEmployee.esiEmployer ?? 0,
          professionalTax: otherData.ptOverride ?? oldEmployee.ptOverride ?? 0
        }
      });
    }

    res.json(employee);
  } catch (err) {
    console.error("PUT /employees/:id error:", err);
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] || "field";
      return res.status(400).json({ message: `An employee with this ${field} already exists.` });
    }
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

// ── DELETE /employees/:id ─────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await prisma.employee.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /employees/:id error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

export default router;

// ─── CAREER HISTORY ROUTES ────────────────────────────────────────────────────

// Get career history for employee
router.get("/:id/career-history", async (req, res) => {
  try {
    const { id } = req.params;
    const history = await prisma.salaryHistory.findMany({
      where: { employeeId: id },
      orderBy: { effectiveFrom: "desc" }
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add career history entry
router.post("/:id/career-history", async (req, res) => {
  try {
    const { id } = req.params;
    const { salary, designation, department, remarks, effectiveFrom, effectiveTo, label } = req.body;
    const entry = await prisma.salaryHistory.create({
      data: {
        employeeId: id,
        salary: Number(salary) || 0,
        designation,
        department,
        remarks,
        label: label || "Career Update",
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null
      }
    });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete career history entry
router.delete("/career-history/:histId", async (req, res) => {
  try {
    const { histId } = req.params;
    await prisma.salaryHistory.delete({ where: { id: histId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
