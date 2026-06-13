import express from "express";
import { prisma } from "../lib/prisma.js";
import auth from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/:employeeId", auth, async (req, res) => {
  const docs = await prisma.document.findMany({
    where: { employeeId: req.params.employeeId },
    orderBy: { createdAt: "desc" }
  });
  res.json(docs);
});

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const dbFile = await prisma.fileStorage.create({
      data: {
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        data: req.file.buffer
      }
    });

    const doc = await prisma.document.create({
      data: {
        employeeId: req.body.employeeId,
        type: req.body.type || "OTHER",
        name: req.body.name || req.file.originalname,
        fileUrl: `/api/upload/file/${dbFile.id}`
      }
    });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put("/:id/verify", auth, async (req, res) => {
  const doc = await prisma.document.update({
    where: { id: req.params.id },
    data: { verified: true }
  });
  res.json(doc);
});

router.delete("/:id", auth, async (req, res) => {
  await prisma.document.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

export default router;