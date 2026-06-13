import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

class AppDoctor {
  constructor() {
    this.healthStatus = {
      db: "UNKNOWN",
      memory: "UNKNOWN",
      directories: "UNKNOWN",
      lastCheck: null,
      issues: []
    };
    this.interval = null;
  }

  start(intervalMs = 60000) {
    console.log("🩺 App Doctor started. Monitoring system health...");
    this.interval = setInterval(() => this.diagnose(), intervalMs);
    // Run an initial diagnosis immediately
    this.diagnose();
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  async diagnose() {
    this.healthStatus.issues = [];
    
    // 1. Check DB Connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      this.healthStatus.db = "HEALTHY";
    } catch (error) {
      this.healthStatus.db = "ERROR";
      this.healthStatus.issues.push({ type: "DB_CONNECTION", error: error.message });
      console.error("🩺 App Doctor: DB Connection dropped! Triggering auto-recovery...");
      await this.healDatabase();
    }

    // 2. Check Required Directories
    const requiredDirs = ["uploads"];
    let dirsHealthy = true;
    for (const dir of requiredDirs) {
      const dirPath = path.resolve(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        dirsHealthy = false;
        try {
          fs.mkdirSync(dirPath, { recursive: true });
          console.log(`🩺 App Doctor: Auto-provisioned missing directory: ${dirPath}`);
        } catch (error) {
          this.healthStatus.issues.push({ type: "DIRECTORY_ERROR", error: `Could not create ${dirPath}: ${error.message}` });
        }
      }
    }
    this.healthStatus.directories = dirsHealthy ? "HEALTHY" : "RECOVERED";

    // 3. Memory Health
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    
    // Warning threshold > 80% of total heap
    if (heapUsedMB > heapTotalMB * 0.8) {
      this.healthStatus.memory = "WARNING";
      this.healthStatus.issues.push({ type: "MEMORY_WARNING", message: `Heap usage high: ${heapUsedMB}MB / ${heapTotalMB}MB` });
      console.warn("🩺 App Doctor: Memory warning threshold reached.");
    } else {
      this.healthStatus.memory = "HEALTHY";
    }

    this.healthStatus.lastCheck = new Date().toISOString();
  }

  async healDatabase() {
    try {
      await prisma.$disconnect();
      await prisma.$connect();
      console.log("🩺 App Doctor: DB auto-recovery successful.");
    } catch (error) {
      console.error("🩺 App Doctor: DB auto-recovery failed:", error.message);
    }
  }

  getReport() {
    return this.healthStatus;
  }
}

export const doctor = new AppDoctor();
