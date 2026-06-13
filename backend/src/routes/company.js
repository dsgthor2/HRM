import express from "express";
import { prisma } from "../lib/prisma.js";
import { auth, isAdmin } from "../middleware/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();


// ── Logo Upload ──────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, "logo_" + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post("/upload-logo", auth, upload.single("logo"), (req, res) => {
  res.json({ logoUrl: `/uploads/${req.file.filename}` });
});

// ── Company ──────────────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    let company = await prisma.company.findFirst();
    if (!company) company = await prisma.company.create({ data: { name: "DefenseBlu Private Limited" } });
    if (company.secondaryEmails && typeof company.secondaryEmails === "string") {
      try { company = { ...company, secondaryEmails: JSON.parse(company.secondaryEmails) }; } catch {}
    }
    res.json(company);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/", auth, async (req, res) => {
  try {
    const { secondaryEmails, ...rest } = req.body;
    const data = { ...rest };
    if (secondaryEmails !== undefined) {
      data.secondaryEmails = Array.isArray(secondaryEmails)
        ? JSON.stringify(secondaryEmails)
        : secondaryEmails;
    }
    let company = await prisma.company.findFirst();
    if (company) {
      company = await prisma.company.update({ where: { id: company.id }, data });
    } else {
      company = await prisma.company.create({ data });
    }
    if (company.secondaryEmails && typeof company.secondaryEmails === "string") {
      try { company = { ...company, secondaryEmails: JSON.parse(company.secondaryEmails) }; } catch {}
    }
    res.json(company);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Departments ──────────────────────────────────────────────────
router.get("/departments", auth, async (req, res) => {
  try { res.json(await prisma.department.findMany({ orderBy: { name: "asc" } })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/departments", auth, async (req, res) => {
  try { res.json(await prisma.department.create({ data: { name: req.body.name } })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/departments/:id", auth, async (req, res) => {
  try { res.json(await prisma.department.update({ where: { id: req.params.id }, data: { name: req.body.name } })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/departments/:id", auth, async (req, res) => {
  try { await prisma.department.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Designations ─────────────────────────────────────────────────
router.get("/designations", auth, async (req, res) => {
  try { res.json(await prisma.designation.findMany({ orderBy: { title: "asc" } })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/designations", auth, async (req, res) => {
  try { res.json(await prisma.designation.create({ data: { title: req.body.title } })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/designations/:id", auth, async (req, res) => {
  try { res.json(await prisma.designation.update({ where: { id: req.params.id }, data: { title: req.body.title } })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/designations/:id", auth, async (req, res) => {
  try { await prisma.designation.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Locations ────────────────────────────────────────────────────
router.get("/locations", auth, async (req, res) => {
  try { res.json(await prisma.location.findMany({ orderBy: { state: "asc" } })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/locations", auth, async (req, res) => {
  try { res.json(await prisma.location.create({ data: { country: req.body.country || "India", state: req.body.state, city: req.body.city } })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/locations/:id", auth, async (req, res) => {
  try { res.json(await prisma.location.update({ where: { id: req.params.id }, data: req.body })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/locations/:id", auth, async (req, res) => {
  try { await prisma.location.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Professional Tax ─────────────────────────────────────────────
router.get("/professional-tax", auth, async (req, res) => {
  try { res.json(await prisma.professionalTax.findMany({ orderBy: [{ state: "asc" }, { payMin: "asc" }] })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/professional-tax", auth, async (req, res) => {
  try { res.json(await prisma.professionalTax.create({ data: req.body })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/professional-tax/:id", auth, async (req, res) => {
  try { res.json(await prisma.professionalTax.update({ where: { id: req.params.id }, data: req.body })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/professional-tax/:id", auth, async (req, res) => {
  try { await prisma.professionalTax.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Letter Templates ─────────────────────────────────────────────
router.get("/letter-templates", auth, async (req, res) => {
  try { res.json(await prisma.letterTemplate.findMany({ orderBy: { name: "asc" } })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/letter-templates", auth, async (req, res) => {
  try { res.json(await prisma.letterTemplate.create({ data: req.body })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/letter-templates/:id", auth, async (req, res) => {
  try { res.json(await prisma.letterTemplate.update({ where: { id: req.params.id }, data: req.body })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/letter-templates/:id", auth, async (req, res) => {
  try { await prisma.letterTemplate.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Salary Components ────────────────────────────────────────────
router.get("/salary-components", auth, async (req, res) => {
  try { res.json(await prisma.salaryComponent.findMany()); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/salary-components/:id", auth, async (req, res) => {
  try { res.json(await prisma.salaryComponent.update({ where: { id: req.params.id }, data: req.body })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/salary-components/customize", auth, async (req, res) => {
  try {
    const { salary, benefits, deductions } = req.body;
    const all = [...(salary || []), ...(benefits || []), ...(deductions || [])];
    
    for (const item of all) {
      await prisma.salaryComponent.upsert({
        where: { name: item.name },
        update: {
          calcType: item.sub,
          active: item.checked,
          amount: Number(item.amount) || 0,
          includeInLetter: item.includeInLetter ?? true
        },
        create: {
          name: item.name,
          type: "allowance", // fallback
          calcType: item.sub,
          value: 0,
          amount: Number(item.amount) || 0,
          includeInLetter: item.includeInLetter ?? true,
          active: item.checked
        }
      });
    }
    res.json({ message: "Saved" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/salary-components", auth, async (req, res) => {
  try {
    const { basicValue, gratuityValue } = req.body;
    // We could save these to a generic config model or update the specific components if they exist
    if (basicValue !== undefined) {
      await prisma.salaryComponent.upsert({
        where: { name: "Basic" },
        update: { value: Number(basicValue) },
        create: { name: "Basic", type: "fixed", calcType: "% of CTC", value: Number(basicValue) }
      });
    }
    if (gratuityValue !== undefined) {
      await prisma.salaryComponent.upsert({
        where: { name: "Gratuity" },
        update: { value: Number(gratuityValue) },
        create: { name: "Gratuity", type: "fixed", calcType: "% of Basic", value: Number(gratuityValue) }
      });
    }
    res.json({ message: "Updated" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── HRA Rules ──────────────────────────────────────────────────
router.get("/hra-rules", auth, async (req, res) => {
  try { res.json(await prisma.hraRule.findMany({ orderBy: [{ state: "asc" }, { city: "asc" }] })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/hra-rules/bulk", auth, async (req, res) => {
  try {
    const { rules } = req.body;
    await prisma.hraRule.deleteMany();
    const created = await Promise.all(rules.map(r => 
      prisma.hraRule.create({ data: { state: r.state, city: r.city, value: Number(r.hra) } })
    ));
    res.json(created);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/hra-rules", auth, async (req, res) => {
  try { res.json(await prisma.hraRule.create({ data: req.body })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/hra-rules/:id", auth, async (req, res) => {
  try { res.json(await prisma.hraRule.update({ where: { id: req.params.id }, data: req.body })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/hra-rules/:id", auth, async (req, res) => {
  try { await prisma.hraRule.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;