// audit-log.ts
export interface AuditLogEvent {
  time: string;
  username: string;
  section: string;
  action: string;
  details: string;
}

export function logAction(username: string, section: string, action: string, details = ''): void {
  if (typeof window === 'undefined') return;
  
  const event: AuditLogEvent = {
    time: new Date().toISOString(),
    username,
    section,
    action,
    details
  };
  
  try {
    const logs = JSON.parse(localStorage.getItem('rf_audit_log') || '[]') as AuditLogEvent[];
    logs.push(event);
    // Keep only last 1000 entries to prevent localStorage from growing too large
    if (logs.length > 1000) {
      logs.shift();
    }
    localStorage.setItem('rf_audit_log', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to log action:', e);
  }
}

export function getAuditLogs(): AuditLogEvent[] {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem('rf_audit_log') || '[]');
  } catch (e) {
    console.error('Failed to get audit logs:', e);
    return [];
  }
}

export function clearAuditLogs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('rf_audit_log');
}
