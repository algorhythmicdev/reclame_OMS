export type Diff<T> = {
  key: string;
  label?: string;
  before?: T;
  after?: T;
  changed: boolean;
};

export function diffKeyValues<T extends string | number | boolean | null | undefined>(
  before: Record<string, T | undefined>,
  after: Record<string, T | undefined>
): Diff<T>[] {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  return Array.from(keys).map((key) => ({
    key,
    before: before?.[key],
    after: after?.[key],
    changed: before?.[key] !== after?.[key]
  }));
}
