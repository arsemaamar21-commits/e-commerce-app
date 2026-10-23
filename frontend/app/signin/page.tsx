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
    <div
      className="min-h-screen bg-cover bg-[center_20%] bg-no-repeat flex flex-col justify-between items-center relative p-3"
      style={{
        backgroundImage: `url('/img.bg.png')`
      }}
    >
      {

      }
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px]"></div>

      <div></div>

      {

      }
      <div className="relative z-10 w-full max-w-xs bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/20 my-auto">
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold text-gray-900 tracking-wide">
             Login
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-gray-400">
              ✉
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Username/Email"
              className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800"
              required
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-gray-400">
              🔒
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800"
              required
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-[11px] text-gray-500 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#23170f] hover:bg-black text-white font-medium py-2.5 rounded-lg text-xs transition shadow cursor-pointer mt-1"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="text-[11px] text-gray-600">
            First time?{' '}
            <Link href="/signup" className="underline font-medium text-gray-900">
              Create Account
            </Link>
          </p>
        </div>
      </div>

      {}
      <div className="relative z-10 w-full text-right pb-1 pr-3">
        <p className="text-[11px] text-white/90 font-light italic drop-shadow">
          <span className="font-semibold"> </span> Profile Interface | © 2024
        </p>
      </div>
    </div>
  );
}