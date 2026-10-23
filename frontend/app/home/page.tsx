'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import { useCart } from '@/app/CartContext';

export default function HomePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const { cart, addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const [products] = useState([
    {
      id: 1,
      category: 'ELECTRONICS',
      title: 'High-Performance Laptop',
      description: 'Powerful laptop for programming, gaming, and professional work.',
      price: 'ETB 45000',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'
    },
    {
      id: 2,
      category: 'ELECTRONICS',
      title: 'Latest Smartphone Pro',
      description: 'Advanced camera, fast processor, and all-day battery life.',
      price: 'ETB 32000',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
    },
    {
      id: 3,
      category: 'VEHICLES',
      title: 'Mountain Bicycle',
      description: 'Sturdy and durable bike for mountain trails and city commuting.',
      price: 'ETB 15000',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500'
    },
    {
      id: 4,
      category: 'AUTOMOTIVE',
      title: 'Smart Car Dash Cam & GPS',
      description: 'HD night vision car camera for safety and route tracking.',
      price: 'ETB 6500',
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c351?w=500'
    }
  ]);

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        cartCount={cart?.length || 0}
        user={user}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Hero Section */}
      <div className="bg-purple-700 text-white py-10 px-6 text-center shadow-inner">
        <h1 className="text-3xl font-extrabold mb-2">Full-Stack E-Commerce Store</h1>
        <p className="text-purple-200 text-xs">Explore Laptops, Phones, Bicycles, Cars and more!</p>
        
        {user && (
          <div className="mt-4 inline-block bg-purple-800 text-purple-100 text-xs px-4 py-1.5 rounded-full border border-purple-500">
            Welcome back, <span className="font-bold text-white">{user.name}</span>! 🎉
          </div>
        )}
      </div>

      {/* Main Products List */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-indigo-950 mb-6">
          Featured Products ({filteredProducts.length})
        </h2>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-44 object-cover"
                />
                <div className="p-4">
                  <span className="text-xs font-semibold text-indigo-600 tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="text-sm font-bold text-gray-800 mt-1 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between">
                <span className="text-sm font-extrabold text-gray-900">
                  {product.price}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition cursor-pointer"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}