'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

type SavedProduct = { id: string | number; title: string; category: string; image: string; price: string | number };

export default function WishlistPage() {
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    void Promise.resolve().then(() => {
      setProducts(JSON.parse(localStorage.getItem('wishlist') || '[]'));
      setUser(JSON.parse(localStorage.getItem('user') || 'null'));
      const cart = JSON.parse(localStorage.getItem('cart') || '[]') as { quantity?: number }[];
      setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
    });
  }, []);

  const removeProduct = (id: SavedProduct['id']) => {
    const next = products.filter((product) => product.id !== id);
    setProducts(next);
    localStorage.setItem('wishlist', JSON.stringify(next));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} user={user} searchTerm="" onSearchChange={() => {}} />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Wishlist <span className="text-base font-normal text-gray-500">{products.length}</span></h1>
        {!products.length ? <p className="border-y border-gray-200 py-8 text-sm text-gray-600">Your wishlist is empty. <Link href="/products" className="font-semibold text-emerald-700 underline">Browse products</Link></p> : (
          <div className="grid grid-cols-1 gap-5 border-t border-gray-200 py-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="bg-white">
                <img src={product.image} alt={product.title} className="h-48 w-full object-cover" />
                <div className="p-4">
                  <p className="text-xs font-semibold text-emerald-800">{product.category}</p>
                  <h2 className="mt-1 font-semibold text-gray-900">{product.title}</h2>
                  <p className="mt-2 text-sm font-bold text-gray-900">{typeof product.price === 'number' ? `ETB ${product.price.toLocaleString()}` : product.price}</p>
                  <button onClick={() => removeProduct(product.id)} className="mt-4 text-sm text-red-700 underline">Remove</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}