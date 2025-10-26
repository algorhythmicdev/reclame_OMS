import { describe, it, expect } from 'vitest';
import { diffKeyValues } from './diff';

describe('diffKeyValues', () => {
  it('detects changes across maps', () => {
    const a = { x: '1', y: '2' };
    const b = { x: '1', y: '3', z: '9' };
    const rows = diffKeyValues(a, b);
    const y = rows.find((r) => r.key === 'y');
    expect(y?.changed).toBe(true);
    const x = rows.find((r) => r.key === 'x');
    expect(x?.changed).toBe(false);
  });
});
