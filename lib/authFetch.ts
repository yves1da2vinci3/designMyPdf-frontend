import { authApi } from '@/api/authApi';

/** JSON headers plus Bearer token from localStorage session (for Next API routes). */
export function authJsonHeaders(): HeadersInit {
  const token = authApi.getUserSession()?.accessToken;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
