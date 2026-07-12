import data from './rbac.json';

export type Resource = (typeof data.resources)[number];
export type Level = (typeof data.levels)[number];

export const ROLE_PERMISSIONS = data.roles as Record<
  string,
  Record<Resource, Level>
>;

const LEVELS: Record<Level, number> = { none: 0, read: 1, full: 2 };

export function can(
  role: string | null | undefined,
  resource: Resource,
  level: Level = 'read',
): boolean {
  if (!role) return false;
  const granted = ROLE_PERMISSIONS[role]?.[resource] ?? 'none';
  return LEVELS[granted] >= LEVELS[level];
}

export const canView = (role: string | null | undefined, resource: Resource) =>
  can(role, resource, 'read');
export const canWrite = (role: string | null | undefined, resource: Resource) =>
  can(role, resource, 'full');
