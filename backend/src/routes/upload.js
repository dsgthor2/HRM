import express from "express";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
router.use(auth);

// Storage config: Use memory storage so we can stream to the database
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            "image/jpeg", "image/png", "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("File type not allowed"));
        }
    },
});

// POST /upload/document
router.post("/document", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        // Save the file to the database
        const dbFile = await prisma.fileStorage.create({
            data: {
                filename: req.file.originalname,
                mimeType: req.file.mimetype,
                data: req.file.buffer
            }
        });

        const fileUrl = `/api/upload/file/${dbFile.id}`;
        res.json({
            success: true,
            url: fileUrl,
            fileUrl,
            originalName: req.file.originalname,
            size: req.file.size,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Failed to upload file to database" });
    }
});

// GET /upload/file/:id
router.get("/file/:id", async (req, res) => {
    try {
        const file = await prisma.fileStorage.findUnique({
            where: { id: req.params.id }
        });

        if (!file) {
            return res.status(404).send("File not found");
        }

        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
        res.send(file.data);
    } catch (error) {
        console.error("Download error:", error);
        res.status(500).send("Failed to retrieve file");
    }
});

export default router;