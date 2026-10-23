'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, StoreProduct, StoreUser } from '@/app/api';

type Order = { _id: string; status: string; total: number; createdAt: string; customer?: { name: string; email: string } };
type Summary = { users: number; products: number; orders: number; revenue: number; bestSellers: { title: string; units: number }[] };
type AdminTab = 'overview' | 'products' | 'orders' | 'customers';

const blankProduct = { title: '', category: '', description: '', image: '', price: '', stock: '0' };

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [user, setUser] = useState<StoreUser | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<StoreUser[]>([]);
  const [form, setForm] = useState(blankProduct);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = async () => {
    const [nextSummary, nextProducts, nextOrders, nextCustomers] = await Promise.all([
      apiRequest<Summary>('/api/admin/summary'),
      apiRequest<StoreProduct[]>('/api/products'),
      apiRequest<Order[]>('/api/orders'),
      apiRequest<StoreUser[]>('/api/admin/users'),
    ]);
    setSummary(nextSummary);
    setProducts(nextProducts);
    setOrders(nextOrders);
    setCustomers(nextCustomers);
  };

  useEffect(() => {
    void Promise.resolve().then(() => {
      const savedUser = localStorage.getItem('user');
      if (!savedUser || !localStorage.getItem('token')) {
        router.replace('/');
        return;
      }
      setUser(JSON.parse(savedUser));
      loadData().catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load admin data.');
        if (requestError instanceof Error && requestError.message.includes('Administrator')) router.replace('/products');
      });
    });
  }, [router]);

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      await apiRequest(editingId ? `/api/products/${editingId}` : '/api/products', {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      setForm(blankProduct);
      setEditingId('');
      setNotice(editingId ? 'Product updated.' : 'Product added.');
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save product.');
    }
  };

  const editProduct = (product: StoreProduct) => {
    setEditingId(product._id);
    setForm({ ...product, price: String(product.price), stock: String(product.stock) });
    setTab('products');
  };

  const archiveProduct = async (id: string) => {
    if (!window.confirm('Remove this product from the catalog?')) return;
    try {
      await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to remove product.');
    }
  };

  const updateOrder = async (id: string, status: string) => {
    try {
      await apiRequest(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update order.');
    }
  };

  const updateUserRole = async (id: string, role: StoreUser['role']) => {
    try {
      const updatedUser = await apiRequest<StoreUser>(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setCustomers((current) => current.map((customer) => customer.id === id ? updatedUser : customer));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update user.');
    }
  };

  const tabs: AdminTab[] = ['overview', 'products', 'orders', 'customers'];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div><p className="text-xs font-semibold uppercase text-emerald-800">E-Store</p><h1 className="text-xl font-bold">Store administration</h1></div>
          <div className="flex items-center gap-4 text-sm"><span>{user?.name}</span><button onClick={() => router.push('/products')} className="underline">View store</button></div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-7">
        <nav className="mb-7 flex gap-6 border-b border-gray-200" aria-label="Admin sections">
          {tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-1 pb-3 text-sm capitalize ${tab === item ? 'border-emerald-700 font-semibold text-emerald-800' : 'border-transparent text-gray-600'}`}>{item}</button>)}
        </nav>
        {error && <p role="alert" className="mb-5 border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="mb-5 border-l-4 border-emerald-600 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}

        {tab === 'overview' && <section>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[['Customers', summary?.users ?? '—'], ['Active products', summary?.products ?? '—'], ['Orders', summary?.orders ?? '—'], ['Paid revenue', `ETB ${(summary?.revenue ?? 0).toLocaleString()}`]].map(([label, value]) => <div key={label} className="border-t-2 border-emerald-700 bg-white p-5"><p className="text-sm text-gray-600">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}
          </div>
          <h2 className="mt-10 border-b border-gray-200 pb-3 text-lg font-semibold">Best sellers</h2>
          <div className="divide-y divide-gray-200">{summary?.bestSellers.map((item) => <div key={item.title} className="flex justify-between py-3 text-sm"><span>{item.title}</span><span>{item.units} sold</span></div>)}</div>
        </section>}

        {tab === 'products' && <section className="grid gap-8 lg:grid-cols-[minmax(260px,360px)_1fr]">
          <form onSubmit={saveProduct} className="space-y-3 border-t border-gray-200 pt-4">
            <h2 className="font-semibold">{editingId ? 'Edit product' : 'Add product'}</h2>
            <input className="w-full border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Product name" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            <input className="w-full border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value.toUpperCase() })} required />
            <textarea className="w-full border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required rows={3} />
            <input className="w-full border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Image URL" type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-gray-600">Price (ETB)<input className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label>
              <label className="text-xs text-gray-600">Stock<input className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm" type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required /></label>
            </div>
            <div className="flex gap-3"><button className="bg-gray-900 px-4 py-2 text-sm font-semibold text-white" type="submit">{editingId ? 'Save product' : 'Add product'}</button>{editingId && <button className="px-4 py-2 text-sm underline" type="button" onClick={() => { setEditingId(''); setForm(blankProduct); }}>Cancel</button>}</div>
          </form>
          <div className="overflow-x-auto border-t border-gray-200">
            <table className="w-full min-w-[580px] text-left text-sm"><thead><tr className="border-b border-gray-200 text-xs uppercase text-gray-500"><th className="py-3">Product</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product._id} className="border-b border-gray-100"><td className="py-3"><span className="font-medium">{product.title}</span><span className="block text-xs text-gray-500">{product.category}</span></td><td>ETB {product.price.toLocaleString()}</td><td>{product.stock}</td><td className="space-x-3"><button className="underline" onClick={() => editProduct(product)}>Edit</button><button className="text-red-700 underline" onClick={() => archiveProduct(product._id)}>Remove</button></td></tr>)}</tbody></table>
          </div>
        </section>}

        {tab === 'orders' && <div className="overflow-x-auto border-t border-gray-200"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b border-gray-200 text-xs uppercase text-gray-500"><th className="py-3">Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id} className="border-b border-gray-100"><td className="py-3 font-mono text-xs">{order._id.slice(-8)}</td><td>{order.customer?.name || order.customer?.email || 'Customer'}</td><td>ETB {order.total.toLocaleString()}</td><td><select aria-label={`Status for order ${order._id}`} value={order.status} onChange={(event) => updateOrder(order._id, event.target.value)} className="border border-gray-300 bg-white px-2 py-1"><option>Pending</option><option>Approved</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select></td></tr>)}</tbody></table></div>}

        {tab === 'customers' && <div className="overflow-x-auto border-t border-gray-200"><table className="w-full min-w-[500px] text-left text-sm"><thead><tr className="border-b border-gray-200 text-xs uppercase text-gray-500"><th className="py-3">Name</th><th>Email</th><th>Role</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id} className="border-b border-gray-100"><td className="py-3">{customer.name}</td><td>{customer.email}</td><td><select aria-label={`Role for ${customer.email}`} value={customer.role} onChange={(event) => updateUserRole(customer.id, event.target.value as StoreUser['role'])} className="border border-gray-300 bg-white px-2 py-1 capitalize"><option value="customer">Customer</option><option value="admin">Admin</option></select></td></tr>)}</tbody></table></div>}
      </main>
    </div>
  );
}