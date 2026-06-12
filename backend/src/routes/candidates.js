import express from "express";
import { prisma } from "../lib/prisma.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
router.use(auth);
 
// ── Generate next candidate ID ─────────────────────────────────────
async function generateCandidateId() {
  const last = await prisma.candidate.findFirst({
    orderBy: { createdAt: "desc" },
    select: { candidateId: true },
  });
  if (!last?.candidateId) return "0001";
  const num = parseInt(last.candidateId.replace(/\D/g, ""), 10) || 0;
  return String(num + 1).padStart(4, "0");
}

// GET /candidates?stage=OFFER_SENT,HIRED&search=john
router.get("/", async (req, res) => {
  try {
    const { stage, search = "" } = req.query;

    const orConditions = [];
    if (search.trim()) {
      orConditions.push(
        { name: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } }
      );
    }

    let stageFilter = undefined;
    if (stage) {
      const stages = String(stage).split(",").map((s) => s.trim()).filter(Boolean);
      stageFilter = stages.length === 1 ? stages[0] : { in: stages };
    }

    const where = {
      ...(stageFilter !== undefined && { stage: stageFilter }),
      ...(orConditions.length > 0 && { OR: orConditions }),
    };

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const mapped = candidates.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      designation: c.position,
      joiningDate: c.joiningDate,
      joined: c.stage === "HIRED",
      employmentType: "Full-Time",
      stage: c.stage,
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function sanitizeCandidate(body) {
  const d = { ...body };
  delete d.id;
  delete d.createdAt;
  delete d.updatedAt;

  const dateFields = ["interviewDate", "joiningDate"];
  for (const f of dateFields) {
    if (d[f] && String(d[f]).trim() !== "") {
      const dt = new Date(d[f]);
      d[f] = isNaN(dt.getTime()) ? null : dt;
    } else {
      d[f] = null;
    }
  }

  const numFields = ["expectedCTC", "offeredCTC"];
  for (const f of numFields) {
    if (d[f] !== undefined && d[f] !== null && String(d[f]).trim() !== "") {
      const val = parseFloat(d[f]);
      d[f] = isNaN(val) ? null : val;
    } else {
      d[f] = null;
    }
  }

  // Remove fields not in Candidate model
  const allowed = ["candidateId", "name", "email", "phone", "position", "department", "stage", "resumeUrl", "notes", "expectedCTC", "offeredCTC", "interviewDate", "joiningDate"];
  Object.keys(d).forEach(k => {
    if (!allowed.includes(k)) delete d[k];
  });

  return d;
}

router.get("/:id", async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.params.id },
    });
    if (!candidate) return res.status(404).json({ error: "Not found" });
    res.json(candidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = sanitizeCandidate(req.body);
    // Auto-generate candidateId if not provided
    if (!data.candidateId) {
      data.candidateId = await generateCandidateId();
    }
    const candidate = await prisma.candidate.create({ data });
    res.status(201).json(candidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = sanitizeCandidate(req.body);
    const candidate = await prisma.candidate.update({
      where: { id: req.params.id },
      data,
    });
    res.json(candidate);
  } catch (err) {
    console.error("PUT /candidates error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

router.post("/:id/send-offer-email", async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.params.id },
    });
    if (!candidate) return res.status(404).json({ error: "Not found" });
    console.log(`[EMAIL] Sending offer letter to ${candidate.email}`);
    res.json({ success: true, message: `Offer letter sent to ${candidate.email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.candidate.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/stage", async (req, res) => {
  try {
    const { stage } = req.body;
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).json({ error: "Invalid candidate ID" });
    }
    const exists = await prisma.candidate.findUnique({ where: { id: req.params.id } });
    if (!exists) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    const candidate = await prisma.candidate.update({
      where: { id: req.params.id },
      data: { stage },
    });
    res.json(candidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update stage" });
  }
});

// ── Generate next employee ID ─────────────────────────────────────
async function generateEmployeeId() {
  const last = await prisma.employee.findFirst({
    orderBy: { createdAt: "desc" },
    select: { employeeId: true },
  });
  if (!last?.employeeId) return "EMP001";
  const num = parseInt(last.employeeId.replace(/\D/g, ""), 10) || 0;
  return `EMP${String(num + 1).padStart(3, "0")}`;
}

router.post("/:id/hire", async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.params.id },
    });

    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    if (candidate.stage === "HIRED") {
      return res.status(400).json({ message: "This candidate has already been hired as an employee." });
    }

    // 1. Generate Employee ID
    const employeeId = await generateEmployeeId();

    // 1b. Check if email already exists in Employee table
    if (candidate.email) {
      const existingEmail = await prisma.employee.findUnique({
        where: { email: candidate.email }
      });
      if (existingEmail) {
        return res.status(400).json({ 
          message: `Already exists with name '${existingEmail.name}', mail id '${existingEmail.email}'` 
        });
      }
    }

    // Validate Designation & Department
    let designation = candidate.position || "Software Engineer";
    let department = candidate.department || "Engineering";

    const desCount = await prisma.designation.count({ where: { title: designation } });
    if (desCount === 0) designation = "Software Engineer";

    const depCount = await prisma.department.count({ where: { name: department } });
    if (depCount === 0) department = "Engineering";

    // 2. Fetch latest Offer Letter to extract details if they were set during generation
    let extraDetails = {};
    try {
      const latestOffer = await prisma.letter.findFirst({
        where: { 
          candidateId: candidate.id,
          type: "OFFER"
        },
        orderBy: { createdAt: "desc" }
      });

      if (latestOffer && latestOffer.metadata) {
        const meta = latestOffer.metadata;

        // monthlyGross is the authoritative net monthly salary set during letter generation.
        // meta.ctc is the ANNUAL CTC budget — never use it as monthly salary directly.
        const monthlyGrossRaw = parseFloat(meta.monthlyGross) || 0;

        // EPF: prefer the explicit epfEmployee field (new), fall back to epfEmployerOverride (legacy)
        const epfVal = meta.epfEmployee ?? meta.epfEmployerOverride ?? null;
        // ESI: prefer the explicit esiEmployee field (new), fall back to esiEmployerOverride (legacy)
        const esiVal = meta.esiEmployee ?? meta.esiEmployerOverride ?? null;
        // PT
        const ptVal = meta.ptAmount ?? meta.ptOverride ?? null;

        // Designation / Department from offer form (may be more accurate than candidate table)
        const offerDesignation = meta.designation || null;
        const offerDepartment  = meta.department  || null;

        extraDetails = {
          monthlyGross: monthlyGrossRaw > 0 ? monthlyGrossRaw : undefined,
          workLocation: meta.location || meta.workLocation || "",
          phone: meta.phone || meta.contact || candidate.phone,
          dob: meta.dob || null,
          gender: meta.gender || null,
          addressLine1: meta.address || meta.addressLine1 || "",
          addressLine2: meta.addressLine2 || "",
          city: meta.city || "",
          state: meta.state || "",
          pincode: meta.pinCode || meta.pincode || "",
          country: meta.country || "India",
          pan: meta.pan || "",
          aadhaar: meta.aadhaar || "",
          basicPct:    meta.basicPct    ? String(meta.basicPct)    : undefined,
          hraPct:      meta.hraPct      ? String(meta.hraPct)      : undefined,
          gratuityPct: meta.gratuityPct ? String(meta.gratuityPct) : undefined,
          epfOverride: epfVal ? String(epfVal) : undefined,
          esiOverride: esiVal ? String(esiVal) : undefined,
          ptOverride:  ptVal  ? String(ptVal)  : undefined,
          designation: offerDesignation,
          department:  offerDepartment,
          letterType:  meta.type,
          empType:     meta.empType,
        };
      }
    } catch (err) {
      console.error("[META EXTRACT ERROR]", err);
    }

    // 3. Create Employee
    const monthlyGross = extraDetails.monthlyGross
      ? Math.round(parseFloat(extraDetails.monthlyGross))
      : 0;

    // Use designation/department from offer letter if available (more accurate than candidate record)
    const finalDesignation = extraDetails.designation || designation;
    const finalDepartment  = extraDetails.department  || department;

    // Ensure offer-letter designation/department exist in lookup tables
    if (finalDesignation && finalDesignation !== designation) {
      await prisma.designation.upsert({ where: { title: finalDesignation }, update: {}, create: { title: finalDesignation } });
    }
    if (finalDepartment && finalDepartment !== department) {
      await prisma.department.upsert({ where: { name: finalDepartment }, update: {}, create: { name: finalDepartment } });
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        name: candidate.name || "Newly Hired",
        email: candidate.email || `hired_${employeeId.toLowerCase()}@defenseblu.com`,
        phone: extraDetails.phone || candidate.phone,
        dob: extraDetails.dob ? new Date(extraDetails.dob) : null,
        gender: extraDetails.gender || null,
        designation: finalDesignation,
        department:  finalDepartment,
        joinDate: candidate.joiningDate || new Date(),
        salary: monthlyGross,
        status: (extraDetails.letterType === "INTERNSHIP" || extraDetails.empType?.toLowerCase() === "internship") ? "INTERN" : "PROBATION",
        workLocation: extraDetails.workLocation || "",
        addressLine1: extraDetails.addressLine1 || "",
        addressLine2: extraDetails.addressLine2 || "",
        city: extraDetails.city || "",
        state: extraDetails.state || "",
        pincode: extraDetails.pincode || "",
        country: extraDetails.country || "India",
        pan:      extraDetails.pan    || null,
        aadhaar:  extraDetails.aadhaar || null,
        basicPct:    extraDetails.basicPct    ? parseFloat(extraDetails.basicPct)    : null,
        hraPct:      extraDetails.hraPct      ? parseFloat(extraDetails.hraPct)      : null,
        gratuityPct: extraDetails.gratuityPct ? parseFloat(extraDetails.gratuityPct) : null,
        epfEmployer: extraDetails.epfOverride ? parseFloat(extraDetails.epfOverride) : null,
        epfEmployee: extraDetails.epfOverride ? parseFloat(extraDetails.epfOverride) : null,
        esiEmployer: extraDetails.esiOverride ? parseFloat(extraDetails.esiOverride) : null,
        esiEmployee: extraDetails.esiOverride ? parseFloat(extraDetails.esiOverride) : null,
        ptOverride:  extraDetails.ptOverride  ? parseFloat(extraDetails.ptOverride)  : null,
      },
    });

    if (monthlyGross > 0) {
      await prisma.salaryHistory.create({
        data: {
          employeeId: employee.id,
          salary: monthlyGross,
          label: extraDetails.letterType === "INTERNSHIP" ? "Stipend (Internship)" : "Initial CTC",
          effectiveFrom: employee.joinDate || new Date(),
          basicPct: employee.basicPct ?? 50,
          hraPct: employee.hraPct ?? 40,
          epfEmployee: employee.epfEmployee ?? 0,
          epfEmployer: employee.epfEmployer ?? 0,
          esiEmployee: employee.esiEmployee ?? 0,
          esiEmployer: employee.esiEmployer ?? 0,
          professionalTax: employee.ptOverride ?? 0
        }
      });
    }

    // 3. Update Candidate Stage
    await prisma.candidate.update({
      where: { id: req.params.id },
      data: { stage: "HIRED" },
    });

    res.json({ success: true, employee });
  } catch (err) {
    console.error("[HIRE ERROR DETAILS]", err);
    const msg = err instanceof Error ? err.message : "Internal Error";
    res.status(500).json({ message: `Failed: ${msg}` });
  }
});

export default router;