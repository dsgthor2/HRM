import express from "express";
import { prisma } from "../lib/prisma.js";
import { generateProfessionalLetter } from "../utils/pdfGenerator.js";
import { sendEmail } from "../utils/mailer.js";
import auth from "../middleware/auth.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
router.use(auth);

// ─── GET /letters/templates ────────────────────────────────────────────────────
router.get("/templates", async (req, res) => {
  try {
    const templates = await prisma.letterTemplate.findMany({
      orderBy: { name: "asc" },
    });
    res.json(templates);
  } catch (err) {
    console.error("[TEMPLATES ERROR]", err);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// ─── POST /letters/preview ─────────────────────────────────────────────────────
router.post("/preview", async (req, res) => {
  try {
    const { type, data, templateId, salaryData } = req.body;

    const company = (await prisma.company.findFirst()) || undefined;
    const template = templateId
      ? await prisma.letterTemplate.findUnique({ where: { id: templateId } })
      : null;

    // ─── Calculate Next Reference Number (Preview) ───────────────────────────
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const letterCount = await prisma.letter.count({
      where: {
        createdAt: { gte: startOfYear },
        metadata: { path: ["refNum"], not: null },
      },
    });
    const refNum = String(letterCount + 1).padStart(4, "0");


    const pdfUrl = await generateProfessionalLetter({
      type: type || "OFFER",
      data: { ...(data || {}), refNum },
      company,
      template,
      salaryData,
      isPreview: true,
    });


    res.json({ pdfUrl });
  } catch (err) {
    console.error("[PREVIEW ERROR]", err);
    res.status(500).json({ error: "Preview generation failed" });
  }
});

// ─── POST /letters/generate-advanced ─────────────────────────────────────────
router.post("/generate-advanced", async (req, res) => {
  try {
    const { candidateId, employeeId, type, data, templateId, salaryData, sendEmail: shouldSendEmail } = req.body;

    const company = (await prisma.company.findFirst()) || undefined;
    const template = templateId
      ? await prisma.letterTemplate.findUnique({ where: { id: templateId } })
      : null;

    // ─── Calculate Next Reference Number ──────────────────────────────────────
    // Count letters created this year that have a refNum in metadata
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const letterCount = await prisma.letter.count({
      where: {
        createdAt: { gte: startOfYear },
        metadata: { path: ["refNum"], not: null },
      },
    });
    const refNum = String(letterCount + 1).padStart(4, "0");
    let targetInfo = { ...data, refNum };


    if (employeeId) {

      const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
      if (emp) {
        targetInfo = {
          name: emp.name,
          designation: emp.designation,
          department: emp.department,
          contact: emp.email,
          email: emp.email,
          ...targetInfo, // keep any overrides from the form
          employeeIdNum: emp.employeeId, // always use DB value e.g. "EMP0020"
        };
      }
    } else if (candidateId) {
      const cand = await prisma.candidate.findUnique({ where: { id: candidateId } });
      if (cand) {
        targetInfo = {
          name: cand.name,
          designation: cand.position,
          contact: cand.email,
          email: cand.email,
          ...targetInfo,
          candidateDbId: candidateId,
        };
      }
    }

    // Inject IDs for reference number generation
    targetInfo.candidateId = candidateId || targetInfo.candidateId || null;
    targetInfo.employeeId = employeeId || targetInfo.employeeId || null;


    const pdfUrl = await generateProfessionalLetter({
      type: type || "OFFER",
      data: targetInfo,
      company,
      template,
      salaryData,
      isPreview: false,
    });

    const letter = await prisma.letter.create({
      data: {
        employeeId: employeeId || null,
        candidateId: candidateId || null,
        type: type || "OFFER",
        content: template?.content || "Generated via Hub",
        metadata: targetInfo,
        pdfUrl,
        sentByEmail: false,
      },
    });

    // ─── Sync Offered CTC to Candidate Record ────────────────────────────────
    if (candidateId && (type === "OFFER" || type === "INTERNSHIP" || type === "CONTRACT") && (salaryData?.totalCTC || salaryData?.annualCTC)) {
      try {
        const ctcToSync = salaryData.annualCTC || salaryData.totalCTC;
        await prisma.candidate.update({
          where: { id: candidateId },
          data: { offeredCTC: parseFloat(ctcToSync) },
        });
        console.log(`[SYNC] Updated candidate ${candidateId} offeredCTC to ${ctcToSync}`);
      } catch (syncErr) {
        console.error("[SYNC ERROR]", syncErr);
      }
    }

    // ─── Sync Gross, Percentages, and Tax overrides to Employee Record ────────
    if (employeeId && ["OFFER", "INCREMENT", "PROBATION", "EXIT", "RELIEVING"].includes(type)) {
      try {
        const m = targetInfo;

        // Prefer explicit monthlyGross; fall back to salaryData.grossMonthly; last resort: annualCTC/12
        const rawGross =
          parseFloat(m.monthlyGross) ||
          parseFloat(salaryData?.grossMonthly) ||
          (parseFloat(m.annualCTC || m.ctc) > 150000 ? Math.round(parseFloat(m.annualCTC || m.ctc) / 12) : 0);
        const monthlyGross = Math.round(rawGross);

        const updateData = {};
        if (monthlyGross > 0)           updateData.salary       = monthlyGross;
        if (m.basicPct)                 updateData.basicPct     = parseFloat(m.basicPct);
        if (m.hraPct)                   updateData.hraPct       = parseFloat(m.hraPct);
        if (m.gratuityPct)              updateData.gratuityPct  = parseFloat(m.gratuityPct);
        if (m.designation)              updateData.designation  = m.designation;
        if (m.department)               updateData.department   = m.department;

        // Personal Details Sync
        if (m.dob) {
          const dt = new Date(m.dob);
          if (!isNaN(dt.getTime())) updateData.dob = dt;
        }
        if (m.gender)    updateData.gender  = m.gender;
        if (m.pan)       updateData.pan     = m.pan.toUpperCase();
        if (m.aadhaar)   updateData.aadhaar = m.aadhaar;
        if (m.uan)       updateData.uan     = m.uan;
        if (m.pfNumber)  updateData.pfNumber  = m.pfNumber.toUpperCase();
        if (m.mobile)    updateData.phone   = m.mobile;
        
        // Address Details Sync
        if (m.address1)  updateData.addressLine1 = m.address1;
        if (m.address2)  updateData.addressLine2 = m.address2;
        if (m.city)      updateData.city         = m.city;
        if (m.state)     updateData.state        = m.state;
        if (m.pinCode)   updateData.pincode      = m.pinCode;
        if (m.country)   updateData.country      = m.country;

        // Org Details
        if (m.manager)      updateData.reportingTo  = m.manager;
        if (m.workLocation) updateData.workLocation = m.workLocation;

        // Bank Details (if present in metadata)
        if (m.bankName)     updateData.bankName     = m.bankName;
        if (m.accountNo)    updateData.accountNo    = m.accountNo;
        if (m.ifsc)         updateData.ifsc         = m.ifsc;

        // EPF
        if (m.epfEmployee !== undefined && m.epfEmployee !== null && m.epfEmployee !== "") {
          updateData.epfEmployee = parseFloat(m.epfEmployee);
          updateData.epfEmployer = parseFloat(m.epfEmployerOverride || m.epfEmployee);
        } else if (m.epfEmployerOverride) {
          updateData.epfEmployee = parseFloat(m.epfEmployerOverride);
          updateData.epfEmployer = parseFloat(m.epfEmployerOverride);
        }

        // ESI
        if (m.esiEmployee !== undefined && m.esiEmployee !== null && m.esiEmployee !== "") {
          updateData.esiEmployee = parseFloat(m.esiEmployee);
          updateData.esiEmployer = parseFloat(m.esiEmployerOverride || m.esiEmployee);
        } else if (m.esiEmployerOverride) {
          updateData.esiEmployee = parseFloat(m.esiEmployerOverride);
          updateData.esiEmployer = parseFloat(m.esiEmployerOverride);
        }

        // Professional Tax
        if (m.ptAmount !== undefined && m.ptAmount !== null && m.ptAmount !== "") {
          updateData.ptOverride = parseFloat(m.ptAmount);
        } else if (m.ptOverride) {
          updateData.ptOverride = parseFloat(m.ptOverride);
        }

        if (Object.keys(updateData).length > 0) {
          // Auto-create department if needed (avoid P2003)
          if (updateData.department) {
            await prisma.department.upsert({
              where: { name: updateData.department },
              update: {},
              create: { name: updateData.department },
            });
          }
          if (updateData.designation) {
            await prisma.designation.upsert({
              where: { title: updateData.designation },
              update: {},
              create: { title: updateData.designation },
            });
          }
          if (type === "PROBATION") {
            updateData.status = "ACTIVE";
            if (m.effectiveDate || m.probationEnd) {
              updateData.confirmDate = new Date(m.effectiveDate || m.probationEnd);
            }
          }
          if (["EXIT", "RELIEVING"].includes(type)) {
            updateData.status = "INACTIVE";
          }
          // ── Save salary history snapshot for INCREMENT letters ──────────────
          if (type === "INCREMENT" && updateData.salary) {
            const currentEmp = await prisma.employee.findUnique({ where: { id: employeeId } });
            const now = new Date();
            const monthLabel = now.toLocaleString("en-IN", { month: "short", year: "numeric" });

            // Snapshot common fields
            const snapshot = {
              basicPct:        !isNaN(parseFloat(targetInfo.basicPct)) ? parseFloat(targetInfo.basicPct) : (currentEmp?.basicPct ?? 50),
              hraPct:          !isNaN(parseFloat(targetInfo.hraPct)) ? parseFloat(targetInfo.hraPct) : (currentEmp?.hraPct ?? 40),
              epfEmployee:     !isNaN(parseFloat(targetInfo.epfEmployee)) ? parseFloat(targetInfo.epfEmployee) : (currentEmp?.epfEmployee ?? 0),
              epfEmployer:     !isNaN(parseFloat(targetInfo.epfEmployerOverride ?? targetInfo.epfEmployee)) ? parseFloat(targetInfo.epfEmployerOverride ?? targetInfo.epfEmployee) : (currentEmp?.epfEmployer ?? 0),
              esiEmployee:     !isNaN(parseFloat(targetInfo.esiEmployee)) ? parseFloat(targetInfo.esiEmployee) : (currentEmp?.esiEmployee ?? 0),
              esiEmployer:     !isNaN(parseFloat(targetInfo.esiEmployerOverride ?? targetInfo.esiEmployee)) ? parseFloat(targetInfo.esiEmployerOverride ?? targetInfo.esiEmployee) : (currentEmp?.esiEmployer ?? 0),
              professionalTax: !isNaN(parseFloat(targetInfo.ptOverride)) ? parseFloat(targetInfo.ptOverride) : (currentEmp?.ptOverride ?? null)
            };

            const histCount = await prisma.salaryHistory.count({ where: { employeeId } });
            if (histCount === 0 && currentEmp && currentEmp.salary > 0) {
              await prisma.salaryHistory.create({
                data: {
                  employeeId,
                  salary: currentEmp.salary,
                  label: "Initial CTC",
                  effectiveFrom: currentEmp.joinDate,
                  ...snapshot
                }
              });
            }

            await prisma.salaryHistory.create({
              data: {
                employeeId,
                salary: updateData.salary,
                label: `After Increment - ${monthLabel}`,
                effectiveFrom: new Date(targetInfo.effectiveDate || now),
                ...snapshot
              }
            });
            console.log(`[SALARY HISTORY] Saved full snapshot for ${employeeId}`);
          }
          // ───────────────────────────────────────────────────────────────────
          await prisma.employee.update({ where: { id: employeeId }, data: updateData });
          console.log(`[SYNC] Employee ${employeeId} updated from ${type} letter: salary=${updateData.salary}, basicPct=${updateData.basicPct}, dept=${updateData.department}`);
        }
      } catch (e) {
        console.error("[SYNC EMPLOYEE ERROR]", e);
      }
    }

    if (shouldSendEmail) {
      try {
        const admin = await prisma.user.findUnique({ where: { id: req.user.id } });
        const hasPersonalSmtp = admin?.smtpUser && admin?.smtpPass;
        const recipientEmail = targetInfo.email || targetInfo.contact;
        const recipientName = targetInfo.name || "Candidate";

        if (recipientEmail) {
          const attachments = [];
          if (pdfUrl) {
            const fileId = pdfUrl.split('/').pop();
            const dbFile = await prisma.fileStorage.findUnique({ where: { id: fileId } });
            if (dbFile) {
              attachments.push({
                filename: `${type}_Letter_${recipientName.replace(/\s+/g, "_")}.pdf`,
                content: dbFile.data,
              });
            }
          }

          await sendEmail({
            to: recipientEmail,
            from: `"${req.user?.name || "HR Department"} | DefenseBlu HRMS" <${hasPersonalSmtp ? admin.smtpUser : (req.user?.email || process.env.SMTP_USER)}>`,
            replyTo: hasPersonalSmtp ? admin.smtpUser : (req.user?.email || process.env.SMTP_USER),
            auth: hasPersonalSmtp ? { user: admin.smtpUser, pass: admin.smtpPass } : null,
            subject: `Official Document: ${type} Letter – ${recipientName}`,
            html: `
              <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
                <div style="background: #1e2d4a; padding: 20px 28px; border-radius: 8px; margin-bottom: 24px;">
                  <h2 style="color: #fff; margin: 0; font-size: 18px;">DefenseBlu</h2>
                  <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Human Resources Department</p>
                </div>
                <p style="font-size: 15px; color: #1a1a1a;">Dear <strong>${recipientName}</strong>,</p>
                <p style="font-size: 14px; color: #374151; line-height: 1.6;">
                  Please find attached your official <strong>${type} Letter</strong> from DefenseBlu Private Limited.
                </p>
                <p style="font-size: 14px; color: #374151;">
                  If you have any questions, please reach out to our HR team.
                </p>
                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                  <p style="font-size: 12px; color: #64748b; margin: 0;">This is an automatically generated email. Please do not reply directly to this address.</p>
                </div>
              </div>
            `,
            attachments,
          });

          await prisma.letter.update({
            where: { id: letter.id },
            data: { sentByEmail: true },
          });
          console.log(`[EMAIL SUCCESS] Letter sent to ${recipientEmail}`);
        }
      } catch (emailErr) {
        console.error("[AUTO EMAIL ERROR]", emailErr);
      }
    }

    res.json({ success: true, pdfUrl, letterId: letter.id, emailAttempted: !!shouldSendEmail });
  } catch (err) {
    console.error("[GENERATE ERROR]", err);
    res.status(500).json({ error: "Failed to generate letter" });
  }
});

// ─── GET /letters ──────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { type, employeeId } = req.query;
    const where = {
      ...(type && type !== "ALL" ? { type: String(type) } : {}),
      ...(employeeId ? { employeeId: String(employeeId) } : {}),
    };

    const letters = await prisma.letter.findMany({
      where,
      include: {
        employee: {
          select: {
            name: true,
            employeeId: true,
            designation: true,
            department: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(letters);
  } catch (err) {
    console.error("[LIST ERROR]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /letters/:id ─────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const letter = await prisma.letter.findUnique({
      where: { id: req.params.id },
      include: {
        employee: true,
      },
    });
    if (!letter) return res.status(404).json({ error: "Letter not found" });
    res.json(letter);
  } catch (err) {
    console.error("[GET ONE ERROR]", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ─── PUT /letters/:id ─────────────────────────────────────────────────────────
// Re-generate PDF with updated metadata
router.put("/:id", async (req, res) => {
  try {
    const { metadata, templateId } = req.body;
    const existing = await prisma.letter.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    const company = (await prisma.company.findFirst()) || undefined;
    const template = templateId
      ? await prisma.letterTemplate.findUnique({ where: { id: templateId } })
      : null;

    const mergedData = { ...(existing.metadata || {}), ...(metadata || {}) };

    const pdfUrl = await generateProfessionalLetter({
      type: existing.type,
      data: mergedData,
      company,
      template,
      isPreview: false,
    });

    const updated = await prisma.letter.update({
      where: { id: req.params.id },
      data: { metadata: mergedData, pdfUrl },
    });

    res.json({ success: true, ...updated, pdfUrl });
  } catch (err) {
    console.error("[UPDATE ERROR]", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// ─── POST /letters/:id/send-email ─────────────────────────────────────────────
router.post("/:id/send-email", async (req, res) => {
  try {
    const letter = await prisma.letter.findUnique({
      where: { id: req.params.id },
      include: { employee: true },
    });

    if (!letter) return res.status(404).json({ error: "Letter not found" });

    const admin = await prisma.user.findUnique({ where: { id: req.user.id } });
    const hasPersonalSmtp = admin?.smtpUser && admin?.smtpPass;

    const meta = (letter.metadata || {});
    const recipientEmail =
      letter.employee?.email || meta.email || meta.contact;
    const recipientName =
      letter.employee?.name || meta.name || "Candidate";

    if (!recipientEmail)
      return res.status(400).json({ error: "No recipient email found" });

    const attachments = [];
    if (letter.pdfUrl) {
      const fileId = letter.pdfUrl.split('/').pop();
      const dbFile = await prisma.fileStorage.findUnique({ where: { id: fileId } });
      if (dbFile) {
        attachments.push({
          filename: `${letter.type}_Letter_${recipientName.replace(/\s+/g, "_")}.pdf`,
          content: dbFile.data,
        });
      }
    }

    await sendEmail({
      to: recipientEmail,
      from: `"${req.user?.name || "HR Department"} | DefenseBlu HRMS" <${hasPersonalSmtp ? admin.smtpUser : (req.user?.email || process.env.SMTP_USER)}>`,
      replyTo: hasPersonalSmtp ? admin.smtpUser : (req.user?.email || process.env.SMTP_USER),
      auth: hasPersonalSmtp ? { user: admin.smtpUser, pass: admin.smtpPass } : null,
      subject: `Official Document: ${letter.type} Letter – ${recipientName}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
          <div style="background: #1e2d4a; padding: 20px 28px; border-radius: 8px; margin-bottom: 24px;">
            <h2 style="color: #fff; margin: 0; font-size: 18px;">DefenseBlu</h2>
            <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Human Resources Department</p>
          </div>
          <p style="font-size: 15px; color: #1a1a1a;">Dear <strong>${recipientName}</strong>,</p>
          <p style="font-size: 14px; color: #374151; line-height: 1.6;">
            Please find attached your official <strong>${letter.type} Letter</strong> from DefenseBlu Private Limited.
          </p>
          <p style="font-size: 14px; color: #374151;">
            If you have any questions, please reach out to our HR team at
            <a href="mailto:hr@defenseblu.com" style="color: #2563eb;">hr@defenseblu.com</a>.
          </p>
          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 13px; color: #64748b; margin: 0;">Warm regards,</p>
            <p style="font-size: 14px; font-weight: bold; color: #1e2d4a; margin: 4px 0;">${req.user?.name || "HR Department"}</p>
            <p style="font-size: 12px; color: #64748b; margin: 0;">DefenseBlu Private Limited</p>
          </div>
            <p style="font-size: 13px; color: #64748b; margin: 0;">DefenseBlu Private Limited</p>
          </div>
        </div>
      `,
      attachments,
    });

    await prisma.letter.update({
      where: { id: req.params.id },
      data: { sentByEmail: true },
    });

    res.json({ success: true, message: `Email sent to ${recipientEmail}` });
  } catch (err) {
    console.error("[EMAIL ERROR]", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// ─── DELETE /letters/:id ──────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const letter = await prisma.letter.findUnique({ where: { id: req.params.id } });
    if (!letter) return res.status(404).json({ error: "Not found" });

    // Optionally delete the PDF file
    if (letter.pdfUrl) {
      const absPath = path.join(__dirname, "../../", letter.pdfUrl);
      try {
        if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
      } catch (_) { }
    }

    await prisma.letter.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error("[DELETE ERROR]", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;