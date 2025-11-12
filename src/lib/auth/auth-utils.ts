// auth-utils.ts
import type { User } from './types';

// Mock user database for demonstration
const mockUsers: User[] = [
  {
    username: 'boss',
    displayName: 'Boss Director',
    passwordHash: 'mock-hash-boss',
    primarySection: 'Admin',
    sections: ['Admin', 'Production', 'Logistics'],
    roles: {
      Admin: 'SuperAdmin',
      Production: 'SuperAdmin',
      Logistics: 'SuperAdmin'
    }
  },
  {
    username: 'admin',
    displayName: 'Lina Ops',
    passwordHash: 'mock-hash-admin',
    primarySection: 'Admin',
    sections: ['Admin', 'Production', 'Logistics'],
    roles: {
      Admin: 'SuperAdmin',
      Production: 'StationLead',
      Logistics: 'StationLead'
    }
  },
  {
    username: 'cnc',
    displayName: 'Marta Jansone',
    passwordHash: 'mock-hash-cnc',
    primarySection: 'Production',
    sections: ['Production'],
    roles: {
      Admin: 'Viewer',
      Production: 'Operator',
      Logistics: 'Viewer'
    },
    stations: ['CNC']
  },
  {
    username: 'sanding',
    displayName: 'Igor Petrovs',
    passwordHash: 'mock-hash-sanding',
    primarySection: 'Production',
    sections: ['Production'],
    roles: {
      Admin: 'Viewer',
      Production: 'Operator',
      Logistics: 'Viewer'
    },
    stations: ['SANDING']
  },
  {
    username: 'logistics',
    displayName: 'Ravi Nair',
    passwordHash: 'mock-hash-logistics',
    primarySection: 'Logistics',
    sections: ['Logistics', 'Production'],
    roles: {
      Admin: 'Viewer',
      Production: 'Viewer',
      Logistics: 'StationLead'
    },
    stations: ['LOGISTICS']
  }
];

/**
 * Mock authentication function
 * In production, this would verify credentials against a backend
 */
export async function fakeAuth(username: string, password: string): Promise<User | null> {
  // Simple mock - accept any password for demo purposes
  const user = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
  return user || null;
}

/**
 * Get user from localStorage
 */
export function loadStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('rf_auth_user');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load stored user:', e);
  }
  return null;
}

/**
 * Save user to localStorage
 */
export function saveUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  
  if (user) {
    localStorage.setItem('rf_auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('rf_auth_user');
  }
}
