const TOKEN_KEY = 'rms_token';
const USER_KEY = 'rms_user';
const REFRESH_KEY = 'rms_refresh';

export interface StoredUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  profile_picture: string | null;
}

export type UserRole = 'tenant' | 'landlord' | 'admin' | 'property_manager';

export type User = StoredUser;

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setUser(user: StoredUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function hasRole(allowedRoles: UserRole[]): boolean {
  const user = getUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

export function isTenant(): boolean {
  return hasRole(['tenant']);
}

export function isLandlord(): boolean {
  return hasRole(['landlord']);
}

export function isAdmin(): boolean {
  return hasRole(['admin']);
}

export function isOwnerOrAdmin(): boolean {
  return hasRole(['landlord', 'admin']);
}

export function isCaretakerOrAbove(): boolean {
  return hasRole(['property_manager', 'landlord', 'admin']);
}