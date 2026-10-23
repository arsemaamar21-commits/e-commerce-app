'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, StoreUser } from '@/app/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await apiRequest<{ user: StoreUser; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push(result.user.role === 'admin' ? '/admin' : '/products');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-[center_20%] bg-no-repeat px-4"
      style={{ backgroundImage: "url('/img.bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-xl backdrop-blur-sm">
        <h2 className="text-3xl font-extrabold text-indigo-950 text-center mb-2">E-Store AI</h2>
        <p className="text-sm text-gray-500 text-center mb-8">Please sign in to your account</p>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none text-sm text-gray-900 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none text-sm text-gray-900 bg-gray-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition duration-200 shadow-md cursor-pointer"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}