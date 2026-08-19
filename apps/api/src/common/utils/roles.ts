import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = new Set<UserRole>([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

export function isAdminRole(role?: string | null): boolean {
  return !!role && ADMIN_ROLES.has(role as UserRole);
}

export function hasRole(role: string | undefined, required: UserRole[]): boolean {
  return !!role && required.includes(role as UserRole);
}