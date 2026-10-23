export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request failed');
  return payload as T;
}

export type StoreUser = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
};

export type StoreProduct = {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  price: number;
  stock: number;
};