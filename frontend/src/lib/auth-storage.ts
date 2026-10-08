const TOKEN_KEY = 'rms_token';
const USER_KEY = 'rms_user';
const REFRESH_KEY = 'rms_refresh';

// Mirrored into cookies so Next.js middleware (Edge runtime) can authorize
// protected routes; localStorage stays the source of truth for API calls.
const TOKEN_COOKIE = 'rms_token';
const USER_COOKIE = 'rms_user';
// Matches ACCESS_TOKEN_EXPIRE_MINUTES (480 minutes) on the backend.
const COOKIE_MAX_AGE = 60 * 60 * 8;

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

function expireCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

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
  writeCookie(TOKEN_COOKIE, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_KEY);
  expireCookie(TOKEN_COOKIE);
  expireCookie(USER_COOKIE);
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
  const json = JSON.stringify(user);
  localStorage.setItem(USER_KEY, json);
  // Mirror into a cookie so Edge middleware can read the user's role
  // (localStorage is not available to middleware).
  writeCookie(USER_COOKIE, encodeURIComponent(json));
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