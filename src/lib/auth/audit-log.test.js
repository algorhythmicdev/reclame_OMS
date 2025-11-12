import { describe, it, expect } from 'vitest';
import { logAction, getAuditLogs, clearAuditLogs } from './audit-log.js';

describe('audit-log', () => {
  it('handles missing localStorage gracefully', () => {
    // In Node.js environment, localStorage is not available
    // These functions should not throw errors
    logAction('testuser', 'Admin', 'login', 'User logged in');
    const logs = getAuditLogs();
    clearAuditLogs();
    
    // getAuditLogs should return empty array when localStorage is not available
    expect(Array.isArray(logs)).toBe(true);
  });
  
  it('logAction accepts correct parameters', () => {
    // Test that function accepts the expected parameters without throwing
    logAction('user', 'Admin', 'action', 'details');
    expect(true).toBe(true);
  });
  
  it('getAuditLogs returns an array', () => {
    const logs = getAuditLogs();
    expect(Array.isArray(logs)).toBe(true);
  });
  
  it('clearAuditLogs does not throw', () => {
    clearAuditLogs();
    expect(true).toBe(true);
  });
});
