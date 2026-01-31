import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navigation from './Navigation';

type CartItem = {
  id: string;
  name: string;
  price: number;
  size?: string;
  qty: number;
  image?: string;
};

const Checkout: React.FC = () => {
  // Items state starts empty; load from localStorage on client mount
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ss_cart');
      const cart = raw ? JSON.parse(raw) : [];
      const parsed = (cart || []).map((c: any) => {
        const price = (typeof c.price === 'number') ? c.price : (parseFloat(String(c.price).replace(/[^0-9.-]+/g, '')) || 0);
        // support a few possible places size might be stored coming from different add-to-cart flows
        const size = c.size || c.shoe_size || (c.options && c.options.size) || (c.meta && c.meta.size) || (c.attributes && c.attributes.size) || undefined;
        return { id: String(c.id), name: c.name || '', price, size, qty: Number(c.qty || 1), image: c.image || undefined };
      });
      setItems(parsed);
    } catch (e) {
      setItems([]);
    }
  }, []);

  const increment = (id: string) => {
    setItems((prev) => {
      const next = prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
      try {
        const raw = localStorage.getItem('ss_cart');
        const cart = raw ? JSON.parse(raw) : [];
        const item = cart.find((c: any) => String(c.id) === id);
        if (item) item.qty = (item.qty || 0) + 1;
        localStorage.setItem('ss_cart', JSON.stringify(cart));
        try { window.dispatchEvent(new CustomEvent('cart:added')); } catch (e) {}
      } catch (e) {}
      return next;
    });
  };
  const decrement = (id: string) => {
    setItems((prev) => {
      const next = prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i);
      try {
        const raw = localStorage.getItem('ss_cart');
        const cart = raw ? JSON.parse(raw) : [];
        const item = cart.find((c: any) => String(c.id) === id);
        if (item) item.qty = Math.max(1, (item.qty || 1) - 1);
        localStorage.setItem('ss_cart', JSON.stringify(cart));
        try { window.dispatchEvent(new CustomEvent('cart:added')); } catch (e) {}
      } catch (e) {}
      return next;
    });
  };
  const removeItem = (id: string) => setItems((prev) => prev.filter(i => i.id !== id));
  // persist remove to storage
  const removeItemPersist = (id: string) => {
    setItems((prev) => {
      const next = prev.filter(i => i.id !== id);
      try {
        const raw = localStorage.getItem('ss_cart');
        const cart = raw ? JSON.parse(raw) : [];
        const nextCart = cart.filter((c: any) => String(c.id) !== id);
        localStorage.setItem('ss_cart', JSON.stringify(nextCart));
        try { window.dispatchEvent(new CustomEvent('cart:added')); } catch (e) {}
      } catch (e) {}
      return next;
    });
  };

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const FREE_SHIP_THRESHOLD = 4400;
  const freeShipRemaining = Math.max(0, Math.round(FREE_SHIP_THRESHOLD - subtotal));
  const progressPct = FREE_SHIP_THRESHOLD > 0 ? Math.min(100, Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100)) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Head title="Cart" />

      <Navigation />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-12 px-6 text-black">
        {items.length > 0 && (
          <>
            <h1 className="text-3xl font-bold text-center mb-2 text-black">Cart</h1>

            <p className="text-center text-sm text-black/70 mb-4">
              {freeShipRemaining > 0 ? (
                <>You are <span className="font-semibold">₱{freeShipRemaining.toLocaleString()}</span> away to get free shipping within the Philippines!</>
              ) : (
                <span className="font-semibold text-green-600">You&apos;ve qualified for free shipping!</span>
              )}
            </p>

            <div className="max-w-3xl mx-auto mb-8">
              <div className="h-2 bg-gray-200 rounded overflow-hidden">
                <div className="h-full bg-gray-800" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: cart items (span 2 on md) */}
          <div className={items.length === 0 ? 'md:col-span-3' : 'md:col-span-2'}>
            <div className={items.length === 0 ? 'rounded bg-white' : 'border border-gray-100 rounded'}>
              {items.length > 0 && (
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b text-sm font-medium text-black">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>
              )}

              <div>
                {items.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-black">
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l1 5h13l1-4H7" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 16a2 2 0 11-4 0 2 2 0 014 0zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">{items.length}</span>
                    </div>

                    <h2 className="mt-6 text-xl font-semibold text-black">Your cart is empty</h2>

                    <Link href="/products" className="mt-6 bg-black text-white px-6 py-3 rounded-md inline-block">Continue shopping</Link>
                  </div>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-6 border-b last:border-b-0">
                      <div className="md:col-span-6 flex items-center space-x-6">
                        <div className="w-24 h-24 bg-gray-50 rounded overflow-hidden flex items-center justify-center border">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-black">{item.name}</div>
                          <div className="text-sm text-black/70 mt-1">₱{item.price.toLocaleString()}</div>
                          {item.size && <div className="text-sm text-black/70 mt-1">Size: {item.size}</div>}
                        </div>
                      </div>

                      <div className="md:col-span-3 flex flex-col items-center">
                        <div className="inline-flex items-center border rounded-md overflow-hidden">
                          <button onClick={() => decrement(item.id)} className="px-3 py-2 text-sm text-black">-</button>
                          <div className="px-5 py-2 text-sm text-black">{item.qty}</div>
                          <button onClick={() => increment(item.id)} className="px-3 py-2 text-sm text-black">+</button>
                        </div>
                        <button onClick={() => removeItemPersist(item.id)} className="mt-2 text-xs text-black underline">Remove</button>
                      </div>

                      <div className="md:col-span-3 text-right font-semibold">₱{(item.price * item.qty).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: summary (only when items exist) */}
          {items.length > 0 && (
            <aside>
            <div className="border border-gray-100 rounded p-6 bg-white">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-black/70">Subtotal</div>
                <div className="text-sm text-black/70">₱{subtotal.toLocaleString()}</div>
              </div>

              <div className="flex items-baseline justify-between mb-4">
                <div className="text-lg font-semibold text-black">Total</div>
                <div className="text-2xl font-extrabold text-black">₱{subtotal.toLocaleString()} PHP</div>
              </div>

              <p className="text-xs text-black/60 mb-4">Taxes and shipping calculated at checkout</p>

              <textarea placeholder="Order note, LBC Pickup Branch" className="w-full border rounded p-3 mb-4 text-sm h-24 resize-none text-black" />

              <button disabled={items.length === 0} className={`w-full flex items-center justify-center gap-3 py-3 rounded-md ${items.length === 0 ? 'bg-gray-300 text-gray-600' : 'bg-gray-900 text-white'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V17M9 14h6"/></svg>
                Checkout
              </button>
            </div>
          </aside>
          )}
        </div>
        </div>
      </main>

      <CheckoutFooter />
    </div>
  );
};

export default Checkout;

// Footer: replicated SoleSpace footer used across the site
// If a shared footer component exists later, replace this markup with that component.
export const CheckoutFooter: React.FC = () => {
  return (
    <footer className="mt-32 bg-gray-100 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4">SoleSpace</div>
            <p className="text-sm text-slate-700 max-w-sm">Your premier destination for premium footwear and expert repair services. Experience the perfect blend of style, comfort, and craftsmanship.</p>

            <div className="flex gap-3 mt-6">
              <button className="w-10 h-10 border border-slate-300 rounded flex items-center justify-center text-slate-700">f</button>
              <button className="w-10 h-10 border border-slate-300 rounded flex items-center justify-center text-slate-700">t</button>
              <button className="w-10 h-10 border border-slate-300 rounded flex items-center justify-center text-slate-700">ig</button>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm uppercase text-slate-700 font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-col gap-3 text-sm text-slate-700">
              <a href="/products">Products</a>
              <a href="/repair-services">Repair Services</a>
              <a href="/services">Services</a>
              <a href="/contact">Contact</a>
            </nav>
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm uppercase text-slate-700 font-semibold mb-4">Services</h3>
            <nav className="flex flex-col gap-3 text-sm text-slate-700">
              <a href="#">Shoe Repair</a>
              <a href="#">Custom Fitting</a>
              <a href="#">Maintenance</a>
              <a href="#">Consultation</a>
            </nav>
          </div>
        </div>

        <div className="border-t border-slate-300 mt-10 pt-6 text-sm text-slate-700 flex items-center justify-between">
          <div>© 2024 SoleSpace. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
