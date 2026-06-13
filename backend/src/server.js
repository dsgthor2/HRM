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

app.use(cors({ 
  origin: function(origin, callback) {
    callback(null, true);
  }, 
  credentials: true 
}));
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
import assetsRouter from "./routes/assets.js";
import expensesRouter from "./routes/expenses.js";
import performanceRouter from "./routes/performance.js";

import superadminRouter from "./routes/superadmin.js";
import doctorRouter from "./routes/doctor.js";
import { doctor } from "./utils/doctor.js";

// Start the App Doctor self-healing daemon
doctor.start();

app.use("/api/auth", authRouter);
app.use("/api/superadmin", superadminRouter);
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
app.use("/api/assets", assetsRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/performance", performanceRouter);
app.use("/api/doctor", doctorRouter);

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", app: "DefenseBlu HRMS", time: new Date() })
);

import { ApiError } from "./utils/ApiError.js";
import { Prisma } from "@prisma/client";
import { prisma } from "./lib/prisma.js";

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack || err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }

  // Handle Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "A record with that value already exists." });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found." });
    }
    return res.status(400).json({ success: false, message: "Database operation failed." });
  }

  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || "Internal server error" 
  });
});

const PORT = process.env.PORT || 5000;
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
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
}

// Prevent crash on unhandled errors
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  if (doctor.healthStatus) doctor.healthStatus.issues.push({ type: "UNCAUGHT_EXCEPTION", error: err.message });
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
  if (doctor.healthStatus) doctor.healthStatus.issues.push({ type: "UNHANDLED_REJECTION", error: err?.message || err });
});

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  doctor.stop();
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await prisma.$disconnect();
      console.log("Database pool disconnected.");
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;