'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, LayoutDashboard, PackageSearch, Search, UserRound, X } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  user?: { name?: string; email?: string; role?: string } | null;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchSuggestions?: { id: string | number; title: string; category: string }[];
  onSuggestionSelect?: (title: string) => void;
}

export default function Navbar({
  cartCount,
  user,
  searchTerm,
  onSearchChange,
  searchSuggestions = [],
  onSuggestionSelect,
}: NavbarProps) {
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(-1);
  const visibleSuggestions = searchSuggestions.slice(0, 6);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && visibleSuggestions.length > 0) {
      event.preventDefault();
      setActiveSuggestionIndex((index) => (index + 1) % visibleSuggestions.length);
    } else if (event.key === 'ArrowUp' && visibleSuggestions.length > 0) {
      event.preventDefault();
      setActiveSuggestionIndex((index) =>
        index <= 0 ? visibleSuggestions.length - 1 : index - 1
      );
    } else if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
      event.preventDefault();
      onSuggestionSelect?.(visibleSuggestions[activeSuggestionIndex].title);
      setIsSearchFocused(false);
      setActiveSuggestionIndex(-1);
    } else if (event.key === 'Escape') {
      setIsSearchFocused(false);
      setActiveSuggestionIndex(-1);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <Link href="/products" className="text-xl font-bold text-indigo-900 flex items-center gap-2">
        E-Store AI
      </Link>

      {/* Search Bar */}
      <div className="hidden md:block relative flex-1 max-w-md mx-6">
        <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
          <Search size={17} className="ml-4 shrink-0 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            role="combobox"
            aria-label="Search products"
            aria-autocomplete="list"
            aria-expanded={isSearchFocused && visibleSuggestions.length > 0}
            aria-controls="product-search-suggestions"
            aria-activedescendant={
              activeSuggestionIndex >= 0
                ? `product-search-suggestion-${visibleSuggestions[activeSuggestionIndex].id}`
                : undefined
            }
            value={searchTerm}
            onChange={(event) => {
              onSearchChange(event);
              setActiveSuggestionIndex(-1);
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              setIsSearchFocused(false);
              setActiveSuggestionIndex(-1);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search products..."
            className="w-full bg-transparent text-sm px-3 py-2.5 focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              aria-label="Clear product search"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSuggestionSelect?.('');
                setActiveSuggestionIndex(-1);
              }}
              className="mr-2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {isSearchFocused && visibleSuggestions.length > 0 && (
          <ul
            id="product-search-suggestions"
            role="listbox"
            className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-xl"
          >
            {visibleSuggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                id={`product-search-suggestion-${suggestion.id}`}
                role="option"
                aria-selected={activeSuggestionIndex === index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSuggestionSelect?.(suggestion.title);
                  setIsSearchFocused(false);
                  setActiveSuggestionIndex(-1);
                }}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm ${
                  activeSuggestionIndex === index ? 'bg-indigo-50' : 'hover:bg-gray-50'
                }`}
              >
                <Search size={15} className="shrink-0 text-gray-400" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate font-medium text-gray-800">
                  {suggestion.title}
                </span>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  {suggestion.category}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-gray-700">
        <Link href="/products" className="hover:text-emerald-800">Shop</Link>
        <Link href="/wishlist" className="hover:text-emerald-800">Wishlist</Link>
        {user && <Link href="/orders" className="hover:text-emerald-800">Orders</Link>}
        {user && <Link href="/account" className="hover:text-emerald-800">Profile</Link>}
        {user?.role === 'admin' && <Link href="/admin" className="font-semibold text-emerald-800">Admin</Link>}
      </div>

      <div className="flex items-center gap-2 text-gray-700 lg:hidden">
        <Link href="/wishlist" aria-label="Wishlist" title="Wishlist" className="p-2"><Heart size={17} /></Link>
        {user && <Link href="/orders" aria-label="Orders" title="Orders" className="p-2"><PackageSearch size={17} /></Link>}
        {user && <Link href="/account" aria-label="Profile" title="Profile" className="p-2"><UserRound size={17} /></Link>}
        {user?.role === 'admin' && <Link href="/admin" aria-label="Admin dashboard" title="Admin dashboard" className="p-2"><LayoutDashboard size={17} /></Link>}
      </div>

      {/* Cart and User Actions */}
      <div className="flex items-center gap-4">
        <Link href="/cart" className="relative p-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition">
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          )}
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <span className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </span>
              <span>{user.name || user.email?.split('@')[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg border border-red-200 transition font-medium cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/"
            className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}