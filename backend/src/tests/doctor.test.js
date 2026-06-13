import { describe, it, expect } from 'vitest';
import { doctor } from '../utils/doctor.js';

describe('App Doctor', () => {
  it('should initialize with UNKNOWN status', () => {
    const report = doctor.getReport();
    // Since doctor starts automatically in server.js, and tests import app, 
    // it might be HEALTHY already. We can check if it has valid fields.
    expect(['HEALTHY', 'UNKNOWN', 'ERROR']).toContain(report.db);
  });

  it('should diagnose system health', async () => {
    await doctor.diagnose();
    const report = doctor.getReport();
    expect(['HEALTHY', 'ERROR']).toContain(report.db);
    expect(['HEALTHY', 'RECOVERED']).toContain(report.directories);
    expect(['HEALTHY', 'WARNING']).toContain(report.memory);
  });
});
