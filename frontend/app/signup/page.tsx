'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest, StoreUser } from '@/app/api';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const result = await apiRequest<{ user: StoreUser; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: fullName, email, password }),
      });
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push(result.user.role === 'admin' ? '/admin' : '/products');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-[center_20%] bg-no-repeat flex flex-col justify-between items-center relative p-2"
      style={{
        backgroundImage: `url('/img.bg.png')`
      }}
    >
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px]"></div>
      <div></div>

      <div className="relative z-10 w-full max-w-[280px] bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-white/20 my-auto">
        <div className="text-center mb-3">
          <h1 className="text-sm font-bold text-gray-900 tracking-wide">
            Arsema - Create Account
          </h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-2">
          {error && <p role="alert" className="text-[11px] text-red-700">{error}</p>}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-[10px] text-gray-400">
              👤
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-white border border-gray-300 rounded-md pl-7 pr-2 py-1.5 text-[11px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800"
              required
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-[10px] text-gray-400">
              ✉
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
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

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-[10px] text-gray-400">
              🔒
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full bg-white border border-gray-300 rounded-md pl-7 pr-2 py-1.5 text-[11px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#23170f] hover:bg-black text-white font-medium py-2 rounded-md text-[11px] transition shadow cursor-pointer mt-1"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-2.5">
          <p className="text-[10px] text-gray-600">
            Already have an account?{' '}
            <Link href="/" className="underline font-medium text-gray-900">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full text-right pb-1 pr-3">
        <p className="text-[10px] text-white/90 font-light italic drop-shadow">
          <span className="font-semibold"> </span> Profile Interface | © 2024
        </p>
      </div>
    </div>
  );
}