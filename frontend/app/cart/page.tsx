'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest, StoreProduct } from '@/app/api';

type CartItem = {
  id: string | number;
  _id?: string;
  productId?: string | null;
  quantity?: number;
  title: string;
  category: string;
  image: string;
  price: string | number;
};

type Receipt = {
  transactionId: string;
  date: string;
  totalItems: number;
  totalPrice: string;
  method: string;
  paymentStatus: string;
  customerName: string;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();


  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('chapa');
  const [shippingAddress, setShippingAddress] = useState({ fullName: '', phone: '', city: '', street: '' });
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState<Receipt | null>(null);

  useEffect(() => {
    void Promise.resolve().then(() => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
      apiRequest<StoreProduct[]>('/api/products').then((products) => {
        const migratedCart = savedCart.map((item) => {
          const savedId = item.productId || item._id || String(item.id);
          const product = products.find((candidate) => candidate._id === savedId || candidate.title.toLowerCase() === item.title.toLowerCase());
          return product ? {
            ...item,
            id: product._id,
            _id: product._id,
            productId: product._id,
            title: product.title,
            category: product.category,
            image: product.image,
            price: product.price,
            quantity: item.quantity || 1,
          } : item;
        });
        setCart(migratedCart);
        localStorage.setItem('cart', JSON.stringify(migratedCart));
      }).catch(() => setCart(savedCart));
    });
  }, []);

  useEffect(() => {
    if (localStorage.getItem('buyNow') === '1' && cart.length > 0) {
      setIsPaymentOpen(true);
      localStorage.removeItem('buyNow');
    }
  }, [cart.length]);

  const removeFromCart = (indexToRemove: number) => {
    const updatedCart = cart.filter((_, index) => index !== indexToRemove);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const changeQuantity = (indexToChange: number, amount: number) => {
    const updatedCart = cart.map((item, index) => index === indexToChange
      ? { ...item, quantity: Math.max(1, (item.quantity || 1) + amount) }
      : item);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };


  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

 
  const subtotal = cart.reduce((sum, item) => {
    const numericPrice = Number(String(item.price).replace(/[^0-9.-]+/g, '')) || 0;
    return sum + numericPrice * (item.quantity || 1);
  }, 0);

  const deliveryFee = subtotal > 0 ? 0 : 0;
  const totalPrice = subtotal + deliveryFee;


  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      router.push('/');
      return;
    }
    setCheckoutError('');
    setIsSubmitting(true);
    try {
      const order = await apiRequest<{ _id: string; paymentStatus: string }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: item.productId || item._id || item.id, quantity: item.quantity || 1 })),
          shippingAddress,
          paymentMethod,
        }),
      });
      setReceiptDetails({
        transactionId: order._id,
        date: new Date().toLocaleString(),
        totalItems: cart.reduce((sum, item) => sum + (item.quantity || 1), 0),
        totalPrice: `ETB ${totalPrice.toLocaleString()}`,
        method: paymentMethod,
        paymentStatus: order.paymentStatus,
        customerName: shippingAddress.fullName,
      });
      setIsSuccess(true);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        cartCount={cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
        user={user}
        searchTerm=""
        onSearchChange={() => {}}
      />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold text-indigo-950">
     (Shopping Cart) 🛒
          </h1>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:underline cursor-pointer font-semibold"
            >
              Clear All Items
            </button>
          )}
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* የጋሪው እቃዎች ዝርዝር */}
            <div className="md:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-bold text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-xs font-extrabold text-gray-900 mt-1">{item.price}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button aria-label={`Decrease ${item.title} quantity`} onClick={() => changeQuantity(index, -1)} className="h-7 w-7 border border-gray-300 text-gray-700">-</button>
                        <span className="min-w-5 text-center text-sm">{item.quantity || 1}</span>
                        <button aria-label={`Increase ${item.title} quantity`} onClick={() => changeQuantity(index, 1)} className="h-7 w-7 border border-gray-300 text-gray-700">+</button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-red-200 transition cursor-pointer font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {

            }
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">
                Order Summary
              </h2>
              
              <div className="space-y-3 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-bold text-gray-800">{cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} items</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-gray-800">ETB {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between text-base font-extrabold text-gray-900 border-t border-gray-100 pt-4 mb-6">
                <span>Total Amount:</span>
                <span className="text-indigo-600 text-lg">ETB {totalPrice.toLocaleString()}</span>
              </div>

              <button
                onClick={() => setIsPaymentOpen(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition cursor-pointer shadow-md"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 font-semibold mb-4">ጋሪዎ ባዶ ነው!</p>
            <Link
              href="/products"
              className="bg-indigo-600 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
            >
              Back to Products
            </Link>
          </div>
        )}
      </main>

      {/* የክፍያ እና የደረሰኝ መስኮት (Payment & Receipt Modal) */}
      {isPaymentOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            {!isSuccess ? (
              <>
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <h3 className="text-base font-bold text-gray-900">የክፍያ መፈጸሚያ (Checkout)</h3>
                  <button
                    onClick={() => {
                      setIsPaymentOpen(false);
                      setCheckoutError('');
                    }}
                    className="text-gray-400 hover:text-gray-600 font-bold text-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-indigo-50 p-3 rounded-xl mb-4 text-center border border-indigo-100">
                  <p className="text-xs text-indigo-700 font-medium">Order total:</p>
                  <p className="text-xl font-black text-indigo-900 mt-0.5">ETB {totalPrice.toLocaleString()}</p>
                </div>

                <form onSubmit={handleConfirmPayment} className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
                  {checkoutError && <p role="alert" className="text-sm text-red-700">{checkoutError}</p>}
                  <label className="block text-xs font-bold text-gray-700">Recipient name<input required value={shippingAddress.fullName} onChange={(event) => setShippingAddress({ ...shippingAddress, fullName: event.target.value })} className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm" /></label>
                  <label className="block text-xs font-bold text-gray-700">Phone number<input required type="tel" value={shippingAddress.phone} onChange={(event) => setShippingAddress({ ...shippingAddress, phone: event.target.value })} className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm" /></label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-bold text-gray-700">City<input required value={shippingAddress.city} onChange={(event) => setShippingAddress({ ...shippingAddress, city: event.target.value })} className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm" /></label>
                    <label className="block text-xs font-bold text-gray-700">Street / area<input required value={shippingAddress.street} onChange={(event) => setShippingAddress({ ...shippingAddress, street: event.target.value })} className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm" /></label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Payment method</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('chapa')}
                        className={`p-3 border text-xs font-bold transition ${
                          paymentMethod === 'chapa'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        Chapa
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('telebirr')}
                        className={`p-3 border text-xs font-bold transition ${
                          paymentMethod === 'telebirr'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        Telebirr
                      </button>
                      <button type="button" onClick={() => setPaymentMethod('card')} className={`p-3 border text-xs font-bold transition ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>Card</button>
                    </div>
                  </div>
                  <p className="text-xs text-amber-800">Payment will remain pending until a provider payment flow is configured and confirms it.</p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer shadow-md"
                  >
                    {isSubmitting ? 'Placing order...' : `Place order · ETB ${totalPrice.toLocaleString()}`}
                  </button>
                </form>
              </>
            ) : (
             
              <div className="py-2">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Order placed</h3>
                  <p className="text-[11px] text-amber-700">Payment pending · confirmation is  yet available</p>
                </div>

                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-xs space-y-2.5 mb-5">
                  <div className="flex justify-between text-gray-500">
                    <span>Order ID:</span>
                    <span className="font-mono font-bold text-gray-800">{receiptDetails?.transactionId}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Date & Time:</span>
                    <span className="text-gray-800">{receiptDetails?.date}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Customer:</span>
                    <span className="font-semibold text-gray-800">{receiptDetails?.customerName}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Payment Method:</span>
                    <span className="font-bold text-indigo-600">{receiptDetails?.method}</span>
                  </div>
                  <div className="flex justify-between text-gray-500"><span>Payment status:</span><span className="font-bold capitalize text-amber-700">{receiptDetails?.paymentStatus}</span></div>
                  <hr className="border-gray-200 my-2" />
                  <div className="flex justify-between text-gray-700">
                    <span>Total Items:</span>
                    <span className="font-bold">{receiptDetails?.totalItems} items</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
                    <span>Order total:</span>
                    <span>{receiptDetails?.totalPrice}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    🖨️ Print Receipt
                  </button>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setIsPaymentOpen(false);
                      setCart([]);
                      localStorage.removeItem('cart');
                      router.push('/orders');
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Done ()
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}