'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { apiRequest, StoreUser } from '@/app/api';

type Order = {
  _id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
  items: { title: string; quantity: number }[];
};

const progress = ['Pending', 'Approved', 'Shipped', 'Delivered'];

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoreUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void Promise.resolve().then(() => {
      const savedUser = localStorage.getItem('user');
      if (!savedUser || !localStorage.getItem('token')) {
        router.replace('/');
        return;
      }
      setUser(JSON.parse(savedUser));
      apiRequest<Order[]>('/api/orders').then(setOrders).catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load orders.');
      });
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={0} user={user} searchTerm="" onSearchChange={() => {}} />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Your orders</h1>
        {error && <p role="alert" className="border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {!orders.length && !error && <p className="border-t border-gray-200 py-6 text-sm text-gray-600">No orders yet.</p>}
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {orders.map((order) => (
            <article key={order._id} className="py-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-gray-500">Order {order._id}</p>
                  <p className="mt-1 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">ETB {order.total.toLocaleString()}</p>
                  <p className="text-xs capitalize text-gray-500">Payment: {order.paymentStatus} via {order.paymentMethod}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2" aria-label={`Order status: ${order.status}`}>
                {progress.map((step) => {
                  const isCurrentOrPast = progress.indexOf(step) <= progress.indexOf(order.status);
                  return <div key={step} className={`border-t-2 pt-2 text-[11px] ${isCurrentOrPast ? 'border-emerald-600 font-semibold text-emerald-800' : 'border-gray-300 text-gray-500'}`}>{step}</div>;
                })}
              </div>
              {order.status === 'Cancelled' && <p className="mt-3 text-sm font-semibold text-red-700">Cancelled</p>}
              <ul className="mt-4 space-y-1 text-sm text-gray-700">
                {order.items.map((item, index) => <li key={`${item.title}-${index}`}>{item.title} × {item.quantity}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}