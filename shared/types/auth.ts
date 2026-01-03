import { Role } from '../constants/roles';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  salaryRange?: string;
  interestedCategories?: string[];
}

export interface AccessCode {
  id: string;
  code: string;
  role: Role;
  validFrom: Date;
  validUntil: Date;
  usesAllowed: number;
  usesCount: number;
  isUsed: boolean;
  issuedBy?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ActivateRequest {
  accessCode: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  phone: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface GenerateAccessCodeRequest {
  role: Role;
  validDays: number;
  usesAllowed: number;
  count?: number;
  note?: string;
}
