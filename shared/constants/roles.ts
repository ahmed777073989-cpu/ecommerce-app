export const ROLE_SUPER_ADMIN = 'super_admin';
export const ROLE_ADMIN = 'admin';
export const ROLE_USER = 'user';

export const ROLES = {
  SUPER_ADMIN: ROLE_SUPER_ADMIN,
  ADMIN: ROLE_ADMIN,
  USER: ROLE_USER,
} as const;

export type Role = typeof ROLE_SUPER_ADMIN | typeof ROLE_ADMIN | typeof ROLE_USER;
