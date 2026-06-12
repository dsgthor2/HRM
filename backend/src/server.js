import "dotenv/config"; // Restarted to sync Prisma schema
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use("/uploads", express.static("uploads"));
["uploads", "uploads/documents", "uploads/pdfs", "uploads/temp"].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
const serveProtected = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if (!token) return res.status(401).json({ message: "Unauthorized access to file" });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token for file access" });
  }
};

app.use("/uploads/pdfs", serveProtected, (req, res, next) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment");
  next();
}, express.static(path.join(__dirname, "../uploads/pdfs")));
app.use("/uploads/documents", serveProtected, express.static(path.join(__dirname, "../uploads/documents")));
app.use("/uploads/temp", serveProtected, express.static(path.join(__dirname, "../uploads/temp")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

import authRouter from "./routes/auth.js";
import employeesRouter from "./routes/employees.js";
import documentsRouter from "./routes/documents.js";
import attendanceRouter from "./routes/attendance.js";
import payslipRouter from "./routes/payslip.js";
import candidatesRouter from "./routes/candidates.js";
import onboardingRouter from "./routes/onboarding.js";
import lettersRouter from "./routes/letters.js";
import policiesRouter from "./routes/policies.js";
import leavesRouter from "./routes/leaves.js";
import companyRouter from "./routes/company.js";
import dashboardRouter from "./routes/dashboard.js";
import uploadRouter from "./routes/upload.js";
import timesheetsRouter from "./routes/timesheets.js";

app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/payslip", payslipRouter);
app.use("/api/candidates", candidatesRouter);
app.use("/api/onboarding", onboardingRouter);
app.use("/api/letters", lettersRouter);
app.use("/api/policies", policiesRouter);
app.use("/api/leaves", leavesRouter);
app.use("/api/company", companyRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/timesheets", timesheetsRouter);

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", app: "DefenseBlu HRMS", time: new Date() })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 DefenseBlu HRMS running on http://localhost:${PORT}\n`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌  Port ${PORT} is already in use.\n   Close the other process and save any file to trigger nodemon restart.\n`);
    process.exit(1);
  } else {
    throw err;
  }
});