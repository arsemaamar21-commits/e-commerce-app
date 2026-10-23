'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest, StoreUser } from '@/app/api';

export default function SignInPage() {
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
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-indigo-700 p-2">
      <div className="relative z-10 pt-4 text-center">
        <h2 className="rounded-full border border-white/10 bg-black/25 px-4 py-1.5 text-lg font-bold tracking-wider text-white shadow-md backdrop-blur-sm md:text-xl">
          🌟 Welcome to E-Commerce 🌟
        </h2>
      </div>

      {

      }
      <div className="relative z-10 w-full max-w-[260px] bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-white/20 my-auto">
        <div className="text-center mb-3">
          <h1 className="text-sm font-bold text-gray-900 tracking-wide">
            Login
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-2.5">
          {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-[10px] text-gray-400">
              ✉
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Username/Email"
              className="w-full bg-white border border-gray-300 rounded-md pl-7 pr-2 py-1.5 text-[11px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800"
              required
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-[10px] text-gray-400">
              🔒
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white border border-gray-300 rounded-md pl-7 pr-2 py-1.5 text-[11px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800"
              required
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-[10px] text-gray-500 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#23170f] hover:bg-black text-white font-medium py-2 rounded-md text-[11px] transition shadow cursor-pointer mt-0.5"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-2.5">
          <p className="text-[10px] text-gray-600">
            First time?{' '}
            <Link href="/signup" className="underline font-medium text-gray-900">
              Create Account
            </Link>
          </p>
        </div>
      </div>

      {

      }
      <div className="relative z-10 w-full text-right pb-1 pr-3">
        <p className="text-[10px] font-light italic text-white/90 drop-shadow">
          <span className="font-semibold"> </span> Profile Interface | © 2024
        </p>
      </div>
    </div>
  );
}