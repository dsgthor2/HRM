import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../middleware/auth.js";
import { generatePayslipPDF } from "../utils/pdfGenerator.js";

const router = express.Router();
const prisma = new PrismaClient();

// ── GET my own payslips (for employees) ──────────────────────────────────────
router.get("/my", auth, async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({ where: { email: req.user.email } });
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });
    
    const slips = await prisma.payslip.findMany({
      where: { employeeId: employee.id },
      orderBy: { generated: "desc" }
    });
    res.json(slips);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── GET all payslips (filtered by month/year) ─────────────────────────────────
router.get("/", auth, async (req, res) => {
  const { month, year } = req.query;
  const where = {};
  if (month) where.month = month;
  if (year) where.year = parseInt(year);
  try {
    const payslips = await prisma.payslip.findMany({
      where,
      include: {
        employee: {
          select: {
            name: true, employeeId: true, email: true,
            designation: true, department: true,
            accountNo: true, pan: true, bankName: true,
            _count: { select: { salaryHistory: true } }
          }
        }
      },
      orderBy: { generated: "desc" }
    });
    res.json(payslips);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── GET payslips by employee ──────────────────────────────────────────────────
router.get("/employee/:employeeId", auth, async (req, res) => {
  try {
    const slips = await prisma.payslip.findMany({
      where: { employeeId: req.params.employeeId },
      orderBy: [{ year: "desc" }, { month: "desc" }]
    });
    res.json(slips);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── GET salary history for an employee (with auto-sync) ──────────────────────
router.get("/:employeeId/history", auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return res.status(404).json({ message: "Employee not found" });



    const history = await prisma.salaryHistory.findMany({
      where: { employeeId },
      orderBy: { effectiveFrom: "desc" }
    });

    res.json(history);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Helper to find the active salary for a specific month/year ────────────────
async function getActiveSalary(employeeId, month, year) {
  const monthIdx = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ].indexOf(month);
  
  const targetDate = new Date(year, monthIdx + 1, 0); // Last day of month
  
  // Find the latest salary snapshot effective on or before the target month
  const history = await prisma.salaryHistory.findMany({
    where: { 
      employeeId,
      effectiveFrom: { lte: targetDate }
    },
    orderBy: { effectiveFrom: "desc" },
    take: 1
  });

  if (history.length > 0) {
    return history[0];
  }

  // Fallback to employee's current salary if no history exists
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  return employee?.salary || 0;
}

// ── Salary calculation helper ─────────────────────────────────────────────────
async function calcSalary(employee, { workingDays = 26, presentDays, otherAllow = 0, otherDeduct = 0, basicPct: bPctOdl, hraPct: hPctOdl, month, year }) {
  const wd = parseInt(workingDays);
  const pd = presentDays !== undefined ? parseInt(presentDays) : wd;
  
  let activeSnapshot = null;
  if (month && year) {
    activeSnapshot = await getActiveSalary(employee.id, month, year);
  }

  const gross = activeSnapshot?.salary || (employee.salary || 0);
  const lop = Math.max(0, wd - pd);
  const lopDeduct = lop > 0 ? (gross / wd) * lop : 0;
  const effectiveGross = gross - lopDeduct;

  // Global Config Fetch
  const comps = await prisma.salaryComponent.findMany();
  const getVal = (name, fallback) => {
    const c = comps.find(x => x.name.toLowerCase() === name.toLowerCase());
    return c ? c.value : fallback;
  };

  const bP = (Number(bPctOdl) || (activeSnapshot?.basicPct ?? employee.basicPct ?? getVal("Basic", 40))) / 100;
  const basic = effectiveGross * bP;

  // HRA Calculation (Location based or Override)
  let hra = 3000; // fallback
  const hPctO = Number(hPctOdl) || activeSnapshot?.hraPct;
  if (hPctO !== undefined && hPctO !== null) {
    hra = basic * (Number(hPctO) / 100);
  } else {
    try {
      const hraRules = await prisma.hraRule.findMany();
      const locCandidates = [employee.workLocation, employee.state, employee.city].filter(Boolean).map(x => x.trim());
      
      const dbLocs = await prisma.location.findMany();
      const hStates = locCandidates.map(c => dbLocs.find(l => l.city.toLowerCase() === c.toLowerCase())?.state).filter(Boolean);
      const finalHCands = [...new Set([...locCandidates, ...hStates])].map(x => x.toLowerCase());

      let hraMatched = false;
      if (finalHCands.length > 0) {
        for (const loc of finalHCands) {
          const rule = hraRules.find(r => r.state.toLowerCase() === loc || (r.city && r.city.toLowerCase() === loc));
          if (rule) { hra = basic * (rule.value / 100); hraMatched = true; break; }
        }
      }
      if (!hraMatched) {
        const hObj = comps.find(x => x.name.toUpperCase() === "HRA");
        hra = basic * ((hObj ? hObj.value : 40) / 100);
      }
    } catch (err) { console.error("HRA Calculation error:", err); }
  }

  const specialAllow = Math.max(0, effectiveGross - basic - hra);

  // Welfare fetch logic: Prioritize current employee record overrides for consistency with the Edit modal
  const isIntern = employee.status === "INTERN";

  const epfObj = comps.find(x => x.name.toUpperCase() === "EPF");
  const epfP = (epfObj ? epfObj.value : 12) / 100;
  const epf = (employee.epfEmployee !== null && employee.epfEmployee !== undefined) 
    ? Number(employee.epfEmployee) 
    : (activeSnapshot?.epfEmployee !== null && activeSnapshot?.epfEmployee !== undefined)
      ? Number(activeSnapshot.epfEmployee)
      : 0; 

  const esiObj = comps.find(x => x.name.toUpperCase() === "ESI");
  const esiP = (esiObj ? esiObj.value : 0) / 100; 
  const esi = (employee.esiEmployee !== null && employee.esiEmployee !== undefined) 
    ? Number(employee.esiEmployee) 
    : (activeSnapshot?.esiEmployee !== null && activeSnapshot?.esiEmployee !== undefined)
      ? Number(activeSnapshot.esiEmployee)
      : 0;

  const tds = 0; // TDS removed as per user request

  // Professional Tax Calculation
  let pt = 0;
  try {
    if (employee.ptOverride !== null && employee.ptOverride !== undefined) {
      pt = Number(employee.ptOverride);
      console.log(`[PT Calc] Using manual override PT from employee record: ${pt}`);
    } else if (activeSnapshot?.professionalTax !== null && activeSnapshot?.professionalTax !== undefined) {
      pt = Number(activeSnapshot.professionalTax);
      console.log(`[PT Calc] Using snapshot PT: ${pt}`);
    } else {
      pt = 0;
      console.log(`[PT Calc] No manual PT override, defaulting to 0 as per user preference`);
    }

    // pt is already set above to either override, snapshot, or 0.
  } catch (err) {
    console.error(`[PT Calc] Error for employee ${employee.employeeId}:`, err);
  }

  const grossSalary = basic + hra + specialAllow + parseFloat(otherAllow);
  const totalDeduct = epf + esi + tds + pt + parseFloat(otherDeduct);
  const netSalary = grossSalary - totalDeduct;

  return {
    workingDays: wd,
    presentDays: pd,
    basic, hra, specialAllow,
    otherAllow: parseFloat(otherAllow),
    grossSalary, epf, esi, tds,
    professionalTax: pt,
    otherDeduct: parseFloat(otherDeduct),
    totalDeduct, netSalary
  };
}

// ── POST generate single payslip ─────────────────────────────────────────────
router.post("/generate", auth, async (req, res) => {
  try {
    const {
      employeeId, month, year,
      presentDays, workingDays = 26,
      otherAllow = 0, otherDeduct = 0,
      template = "standard",
      basicPct, hraPct, generatedDate,
      salaryHistoryId
    } = req.body;

    let employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // ── Ultra-Robust Salary History Sync ──────────────────────────────────────
    // Removed legacy sync logic from here to prevent duplicate history records
    
    // Refresh employee state
    employee = await prisma.employee.findUnique({ where: { id: employeeId } });

    // If a specific salary snapshot was selected, override employee salary
    if (salaryHistoryId && salaryHistoryId !== "current") {
      const snap = await prisma.salaryHistory.findUnique({ where: { id: salaryHistoryId } });
      if (snap) employee = { ...employee, salary: snap.salary };
    }

    const existing = await prisma.payslip.findFirst({
      where: { employeeId, month, year: parseInt(year) }
    });
    if (existing) return res.status(400).json({ message: "Payslip already generated for this month" });

    const calc = await calcSalary(employee, { 
      workingDays, presentDays, otherAllow, otherDeduct,
      basicPct, hraPct, month, year: parseInt(year)
    });

    const slip = await prisma.payslip.create({
      data: { 
        employeeId, 
        month, 
        year: parseInt(year), 
        ...calc,
        basicPct: basicPct ? parseFloat(basicPct) : null,
        hraPct: hraPct ? parseFloat(hraPct) : null,
        generated: generatedDate ? new Date(generatedDate) : new Date()
      }
    });

    try {
      const pdfUrl = await generatePayslipPDF(slip, employee, template);
      await prisma.payslip.update({ where: { id: slip.id }, data: { pdfUrl } });
      slip.pdfUrl = pdfUrl;
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr.message);
    }

    res.json(slip);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// ── PUT edit existing payslip & regenerate PDF ───────────────────────────────
router.put("/:id", auth, async (req, res) => {
  try {
    const slip = await prisma.payslip.findUnique({
      where: { id: req.params.id },
      include: { employee: true }
    });
    if (!slip) return res.status(404).json({ message: "Payslip not found" });

    const {
      workingDays = slip.workingDays,
      presentDays = slip.presentDays,
      otherAllow = slip.otherAllow,
      otherDeduct = slip.otherDeduct,
      template = "standard",
      basicPct = slip.basicPct,
      hraPct = slip.hraPct,
      generatedDate
    } = req.body;

    let employee = slip.employee;

    // Removed legacy sync logic from here to prevent duplicate history records
    // ─────────────────────────────────────────────────────────────────────────

    const calc = await calcSalary(employee, { 
      workingDays, presentDays, otherAllow, otherDeduct,
      basicPct, hraPct, month: slip.month, year: slip.year
    });

    const updated = await prisma.payslip.update({
      where: { id: req.params.id },
      data: { 
        ...calc, 
        pdfUrl: null,
        basicPct: basicPct ? parseFloat(basicPct) : null,
        hraPct: hraPct ? parseFloat(hraPct) : null,
        generated: generatedDate ? new Date(generatedDate) : slip.generated
      }
    });

    try {
      const pdfUrl = await generatePayslipPDF(updated, slip.employee, template);
      await prisma.payslip.update({ where: { id: updated.id }, data: { pdfUrl } });
      updated.pdfUrl = pdfUrl;
    } catch (pdfErr) {
      console.error("PDF regen error:", pdfErr.message);
    }

    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// ── POST generate PDF for existing payslip ───────────────────────────────────
router.post("/:id/generate-pdf", auth, async (req, res) => {
  try {
    const slip = await prisma.payslip.findUnique({
      where: { id: req.params.id },
      include: { employee: true }
    });
    if (!slip) return res.status(404).json({ message: "Payslip not found" });

    const template = req.body?.template || "standard";
    const pdfUrl = await generatePayslipPDF(slip, slip.employee, template);
    const updated = await prisma.payslip.update({
      where: { id: slip.id }, data: { pdfUrl }
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST bulk generate ────────────────────────────────────────────────────────
router.post("/generate-bulk", auth, async (req, res) => {
  try {
    const { month, year, employeeIds, template = "standard", generatedDate, range } = req.body;
    
    let monthsToGen = [{ month, year: parseInt(year) }];
    if (range && Array.isArray(range)) {
       monthsToGen = range.map(r => ({ month: r.month, year: parseInt(r.year) }));
    }

    const where = { status: { in: ["ACTIVE", "PROBATION", "CONTRACT", "INTERN"] } };
    if (Array.isArray(employeeIds) && employeeIds.length > 0) {
      where.id = { in: employeeIds };
    }

    const employees = await prisma.employee.findMany({ where });
    const results = [];

    for (const mObj of monthsToGen) {
      const curMonth = mObj.month;
      const curYear = mObj.year;

      for (const emp of employees) {
        const existing = await prisma.payslip.findFirst({
          where: { employeeId: emp.id, month: curMonth, year: curYear }
        });

        if (existing) {
          results.push({ employee: emp.name, month: curMonth, year: curYear, status: "already_exists" });
          continue;
        }

        // Calculate issue date based on the month being generated
        let issueDate = new Date();
        if (generatedDate) {
          const baseDate = new Date(generatedDate);
          const monthIdx = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ].indexOf(curMonth);
          
          // Ensure we don't overflow the month (e.g. Feb 30th)
          const lastDayOfMonth = new Date(Date.UTC(curYear, monthIdx + 1, 0)).getUTCDate();
          const targetDay = Math.min(baseDate.getDate(), lastDayOfMonth);
          issueDate = new Date(Date.UTC(curYear, monthIdx, targetDay));
        }

        const calc = await calcSalary(emp, { workingDays: 26, presentDays: 26, month: curMonth, year: curYear });
        const slip = await prisma.payslip.create({
          data: { 
            employeeId: emp.id, 
            month: curMonth, 
            year: curYear, 
            ...calc, 
            generated: issueDate
          }
        });

        try {
          const pdfUrl = await generatePayslipPDF({ ...slip, generatedDate: slip.generated }, emp, template);
          await prisma.payslip.update({ where: { id: slip.id }, data: { pdfUrl } });
        } catch (pdfErr) {
          console.error(`PDF error for ${emp.name} (${curMonth}):`, pdfErr.message);
        }

        results.push({ employee: emp.name, month: curMonth, year: curYear, status: "generated" });
      }
    }

    res.json({ results });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST send payslip via email ───────────────────────────────────────────────
router.post("/:id/send-email", auth, async (req, res) => {
  try {
    const slip = await prisma.payslip.findUnique({
      where: { id: req.params.id },
      include: { employee: true }
    });
    if (!slip) return res.status(404).json({ message: "Payslip not found" });
    if (!slip.pdfUrl) return res.status(400).json({ message: "No PDF generated yet. Generate PDF first." });

    const admin = await prisma.user.findUnique({ where: { id: req.user.id } });
    const hasPersonalSmtp = admin?.smtpUser && admin?.smtpPass;

    const toEmail = req.body.email || slip.employee.email;
    if (!toEmail) return res.status(400).json({ message: "No email address available for this employee." });

    // Dynamically import nodemailer (ESM-safe)
    const nodemailer = (await import("nodemailer")).default;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: hasPersonalSmtp ? admin.smtpUser : process.env.SMTP_USER,
        pass: hasPersonalSmtp ? admin.smtpPass : process.env.SMTP_PASS,
      },
    });

    const fileId = slip.pdfUrl.split('/').pop();
    const dbFile = await prisma.fileStorage.findUnique({ where: { id: fileId } });

    if (!dbFile) {
      return res.status(400).json({ message: "PDF file not found in database. Please regenerate it." });
    }

    await transporter.sendMail({
      from: `"${req.user?.name || "HR Department"} | Fingrow HRMS" <${hasPersonalSmtp ? admin.smtpUser : (req.user?.email || process.env.SMTP_USER)}>`,
      replyTo: hasPersonalSmtp ? admin.smtpUser : (req.user?.email || process.env.SMTP_USER),
      to: toEmail,
      subject: `Your Payslip for ${slip.month} ${slip.year} – Fingrow Consulting Services`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1e2d4a;padding:24px;border-radius:8px 8px 0 0;">
            <h2 style="color:#fff;margin:0;font-size:20px;">Fingrow Consulting Services</h2>
            <p style="color:#94a3b8;margin:4px 0 0;font-size:13px;">HR Management System</p>
          </div>
          <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;">
            <p style="color:#374151;font-size:15px;">Dear <strong>${slip.employee.name}</strong>,</p>
            <p style="color:#374151;font-size:14px;">
              Please find attached your payslip for <strong>${slip.month} ${slip.year}</strong>.
            </p>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0;color:#64748b;font-size:13px;">Net Salary</p>
              <p style="margin:4px 0 0;color:#0f766e;font-size:24px;font-weight:800;">
                ₹${Number(slip.netSalary).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <p style="color:#64748b;font-size:13px;">
              If you have any queries regarding your payslip, please reach out to HR.
            </p>
          </div>
          <div style="background:#1e2d4a;padding:12px 24px;border-radius:0 0 8px 8px;text-align:center;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">This is a computer generated email. Please do not reply.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Payslip_${slip.employee.employeeId}_${slip.month}_${slip.year}.pdf`,
          content: dbFile.data,
        },
      ],
    });

    res.json({ message: `Payslip sent to ${toEmail}` });
  } catch (e) {
    console.error("Email error:", e.message);
    res.status(500).json({ message: e.message });
  }
});

// ── DELETE payslip ────────────────────────────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    await prisma.payslip.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

export default router;