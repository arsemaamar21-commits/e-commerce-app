'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { apiRequest, StoreUser } from '@/app/api';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoreUser | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    void Promise.resolve().then(() => {
      const savedUser = localStorage.getItem('user');
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]') as { quantity?: number }[];
      setCartCount(savedCart.reduce((sum, item) => sum + (item.quantity || 1), 0));
      if (!savedUser || !localStorage.getItem('token')) {
        router.replace('/');
        return;
      }
      const currentUser = JSON.parse(savedUser) as StoreUser;
      setUser(currentUser);
      setName(currentUser.name);
      setEmail(currentUser.email);
    });
  }, [router]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      const result = await apiRequest<{ user: StoreUser }>('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ name, email }),
      });
      localStorage.setItem('user', JSON.stringify(result.user));
      setUser(result.user);
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update profile.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} user={user} searchTerm="" onSearchChange={() => {}} />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Your profile</h1>
        <form onSubmit={saveProfile} className="max-w-xl space-y-5 border-t border-gray-200 py-6">
          <label className="block text-sm font-medium text-gray-700">
            Full name
            <input className="mt-2 w-full border border-gray-300 bg-white px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Email address
            <input className="mt-2 w-full border border-gray-300 bg-white px-3 py-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <p className="text-sm text-gray-600">Account type: {user?.role || 'customer'}</p>
          <button className="bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black" type="submit">Save changes</button>
          {message && <p role="status" className="text-sm text-gray-700">{message}</p>}
        </form>
      </main>
    </div>
  );
}