import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navigation from './Navigation';
import Swal from 'sweetalert2';
import axios from 'axios';

type CartItem = {
  id: string;
  name: string;
  price: number;
  size?: string;
  color?: string;
  qty: number;
  image?: string;
  stock_quantity?: number;
  pid?: string;
  options?: any;
};

const Checkout: React.FC = () => {
  const { auth } = usePage().props as any;
  const user = auth?.user;
  
  // Items state starts empty; load from localStorage on client mount
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [payLink, setPayLink] = useState<string>('');
  const [qtyUpdating, setQtyUpdating] = useState<Record<string, boolean>>({});
  const qtyUpdatingRef = useRef<Record<string, boolean>>({});
  
  // Customer information
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const subtotal = items.filter(item => selectedItems.has(item.id)).reduce((s, it) => s + it.price * it.qty, 0);
  const FREE_SHIP_THRESHOLD = 4400;
  const freeShipRemaining = Math.max(0, Math.round(FREE_SHIP_THRESHOLD - subtotal));
  const progressPct = FREE_SHIP_THRESHOLD > 0 ? Math.min(100, Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100)) : 0;

  // Load cart function (moved outside useEffect so it can be reused)
  const loadCart = async () => {
      if (!user) {
        // If not authenticated, load from localStorage
        try {
          const raw = localStorage.getItem('ss_cart');
          const cart = raw ? JSON.parse(raw) : [];
          const parsed = (cart || []).map((c: any) => {
            const price = (typeof c.price === 'number') ? c.price : (parseFloat(String(c.price).replace(/[^0-9.-]+/g, '')) || 0);
            const size = c.size || c.shoe_size || (c.options && c.options.size) || (c.meta && c.meta.size) || (c.attributes && c.attributes.size) || undefined;
            const color = c.color || (c.options && c.options.color) || undefined;
            return { 
              id: String(c.id), 
              name: c.name || '', 
              price, 
              size,
              color,
              qty: Number(c.qty || 1), 
              image: c.image || undefined,
              stock_quantity: c.stock_quantity || undefined,
              pid: c.pid || String(c.id)
            };
          });
          setItems(parsed);
          setSelectedItems(new Set(parsed.map(item => item.id)));
        } catch (e) {
          setItems([]);
        }
        return;
      }

      try {
        // Sync localStorage cart to database first
        const raw = localStorage.getItem('ss_cart');
        if (raw) {
          const localCart = JSON.parse(raw);
          if (localCart && localCart.length > 0) {
            await axios.post('/api/cart/sync', { items: localCart });
            // Clear localStorage after successful sync
            localStorage.removeItem('ss_cart');
          }
        }

        // Load cart from database
        const response = await axios.get('/api/cart');
        if (response.data.items) {
          const parsed = response.data.items.map((item: any) => {
            // Extract color from options if available
            const options = item.options ? (typeof item.options === 'string' ? JSON.parse(item.options) : item.options) : {};
            return {
              id: String(item.id),
              name: item.name || '',
              price: item.price || 0,
              size: item.size,
              color: options.color || undefined,
              qty: item.quantity || item.qty || 1,
              image: item.image,
              stock_quantity: item.stock_quantity,
              pid: item.product_id || item.pid,
              options: item.options, // Keep original options
            };
          });
          setItems(parsed);
          setSelectedItems(new Set(parsed.map(item => item.id)));
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
        // Fallback to localStorage
        try {
          const raw = localStorage.getItem('ss_cart');
          const cart = raw ? JSON.parse(raw) : [];
          const parsed = (cart || []).map((c: any) => {
            const price = (typeof c.price === 'number') ? c.price : (parseFloat(String(c.price).replace(/[^0-9.-]+/g, '')) || 0);
            const size = c.size || undefined;
            const color = c.color || undefined;
            return { 
              id: String(c.id), 
              name: c.name || '', 
              price, 
              size,
              color,
              qty: Number(c.qty || 1), 
              image: c.image || undefined,
              stock_quantity: c.stock_quantity || undefined,
              pid: c.pid || String(c.id)
            };
          });
          setItems(parsed);
          setSelectedItems(new Set(parsed.map(item => item.id)));
        } catch (e) {
          setItems([]);
        }
      }
    };

  // Load cart from database on mount
  useEffect(() => {
    loadCart();
    
    // Pre-fill user information if logged in
    if (user) {
      setCustomerName(user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim());
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');
      setShippingAddress(user.address || '');
    }
  }, [user]);

  useEffect(() => {
    const envLink = (import.meta as any)?.env?.VITE_PAYMONGO_PAYMENT_LINK;
    const storedLink = typeof window !== 'undefined' ? localStorage.getItem('ss_paymongo_link') : '';
    setPayLink(envLink || storedLink || '');
  }, []);

  const increment = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (qtyUpdatingRef.current[id]) return;

    if (item.stock_quantity !== undefined && item.qty >= item.stock_quantity) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock limit reached',
        text: `Cannot add more. Only ${item.stock_quantity} items in stock.`,
      });
      return;
    }

    qtyUpdatingRef.current[id] = true;
    setQtyUpdating(prev => ({ ...prev, [id]: true }));

    if (user) {
      // Update via API
      try {
        await axios.post('/api/cart/update', {
          id: id,
          quantity: item.qty + 1,
        });
        setItems((prev) => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
        window.dispatchEvent(new CustomEvent('cart:added'));
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || 'Failed to update cart';
        Swal.fire({
          icon: 'error',
          title: 'Unable to update cart',
          text: errorMsg,
        });
        console.error('Failed to update cart:', error);
        // Refresh cart to get correct quantities
        loadCart();
      } finally {
        qtyUpdatingRef.current[id] = false;
        setQtyUpdating(prev => ({ ...prev, [id]: false }));
      }
    } else {
      // Update localStorage
      try {
        setItems((prev) => {
          const next = prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
          try {
            const raw = localStorage.getItem('ss_cart');
            const cart = raw ? JSON.parse(raw) : [];
            const cartItem = cart.find((c: any) => String(c.id) === id);
            if (cartItem) {
              cartItem.qty = (cartItem.qty || 0) + 1;
            }
            localStorage.setItem('ss_cart', JSON.stringify(cart));
            window.dispatchEvent(new CustomEvent('cart:added'));
          } catch (e) {}
          return next;
        });
      } finally {
        qtyUpdatingRef.current[id] = false;
        setQtyUpdating(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const decrement = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || item.qty <= 1) return;

    if (user) {
      // Update via API
      try {
        await axios.post('/api/cart/update', {
          id: id,
          quantity: item.qty - 1,
        });
        setItems((prev) => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i));
        window.dispatchEvent(new CustomEvent('cart:added'));
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || 'Failed to update cart';
        alert(errorMsg);
        console.error('Failed to update cart:', error);
        // Refresh cart to get correct quantities
        loadCart();
      }
    } else {
      // Update localStorage
      setItems((prev) => {
        const next = prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i);
        try {
          const raw = localStorage.getItem('ss_cart');
          const cart = raw ? JSON.parse(raw) : [];
          const cartItem = cart.find((c: any) => String(c.id) === id);
          if (cartItem) {
            cartItem.qty = Math.max(1, (cartItem.qty || 1) - 1);
          }
          localStorage.setItem('ss_cart', JSON.stringify(cart));
          window.dispatchEvent(new CustomEvent('cart:added'));
        } catch (e) {}
        return next;
      });
    }
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter(i => i.id !== id));
  
  // persist remove to storage or database
  const removeItemPersist = async (id: string) => {
    if (user) {
      // Remove via API
      try {
        await axios.post('/api/cart/remove', { id });
        setItems((prev) => prev.filter(i => i.id !== id));
        window.dispatchEvent(new CustomEvent('cart:added'));
      } catch (error) {
        console.error('Failed to remove cart item:', error);
      }
    } else {
      // Remove from localStorage
      setItems((prev) => {
        const next = prev.filter(i => i.id !== id);
        try {
          const raw = localStorage.getItem('ss_cart');
          const cart = raw ? JSON.parse(raw) : [];
          const nextCart = cart.filter((c: any) => String(c.id) !== id);
          localStorage.setItem('ss_cart', JSON.stringify(nextCart));
          window.dispatchEvent(new CustomEvent('cart:added'));
        } catch (e) {}
        return next;
      });
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(i => i.id)));
    }
  };

  const handleCheckout = async () => {
    // Validate customer information
    if (!customerName.trim()) {
      Swal.fire('Required', 'Please enter your name', 'warning');
      return;
    }
    if (!customerEmail.trim()) {
      Swal.fire('Required', 'Please enter your email', 'warning');
      return;
    }
    if (!shippingAddress.trim()) {
      Swal.fire('Required', 'Please enter your shipping address', 'warning');
      return;
    }
    
    // Get selected cart items
    const selectedCartItems = items.filter(item => selectedItems.has(item.id));
    
    if (selectedCartItems.length === 0) {
      Swal.fire('No Items Selected', 'Please select at least one item to checkout', 'warning');
      return;
    }
    
    setIsPaying(true);
    setPayError(null);
    
    try {
      // First, create the order in the database
      const orderResponse = await fetch('/api/checkout/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          items: selectedCartItems,
          total_amount: subtotal,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: shippingAddress,
          payment_method: 'paymongo',
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error(orderData.message || 'Order creation failed');
      }

      // Clear cart after successful order creation
      localStorage.removeItem('ss_cart');
      try { window.dispatchEvent(new CustomEvent('cart:added', { detail: { total: 0 } })); } catch (e) {}

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        html: `
          <p>Your order has been successfully placed.</p>
          <p class="mt-2"><strong>Order Number${orderData.orders.length > 1 ? 's' : ''}:</strong></p>
          <ul class="text-sm mt-1">
            ${orderData.orders.map((o: any) => `<li>${o.order_number} - ₱${o.total.toLocaleString()}</li>`).join('')}
          </ul>
        `,
        confirmButtonText: 'View My Orders',
        confirmButtonColor: '#000000',
      });

      // Redirect to my orders page
      window.location.href = '/my-orders';
      
    } catch (err: any) {
      setPayError(err?.message || 'Unable to place order');
      setIsPaying(false);
      
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: err?.message || 'Unable to place order. Please try again.',
        confirmButtonColor: '#000000',
      });
    }
  };

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
                  <div className="col-span-1 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === items.length && items.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                    />
                  </div>
                  <div className="col-span-5">Product</div>
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
                      <div className="md:col-span-1 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                        />
                      </div>
                      <div className="md:col-span-5 flex items-center space-x-6">
                        <div className="w-24 h-24 bg-gray-50 rounded overflow-hidden flex items-center justify-center border">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-black">{item.name}</div>
                          <div className="text-sm text-black/70 mt-1">₱{item.price.toLocaleString()}</div>
                          <div className="flex gap-2 mt-1">
                            {item.size && <div className="text-sm text-black/70">Size: {item.size}</div>}
                            {item.color && <div className="text-sm text-black/70">Color: {item.color}</div>}
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-3 flex flex-col items-center">
                        <div className="inline-flex items-center border rounded-md overflow-hidden">
                          <button onClick={() => decrement(item.id)} className="px-3 py-2 text-sm text-black">-</button>
                          <div className="px-5 py-2 text-sm text-black">{item.qty}</div>
                          <button 
                            onClick={() => increment(item.id)} 
                            disabled={qtyUpdating[item.id] || (item.stock_quantity !== undefined && item.qty >= item.stock_quantity)}
                            className={`px-3 py-2 text-sm ${(qtyUpdating[item.id] || (item.stock_quantity !== undefined && item.qty >= item.stock_quantity)) ? 'text-gray-400 cursor-not-allowed' : 'text-black'}`}
                          >+</button>
                        </div>
                        {item.stock_quantity !== undefined && item.qty >= item.stock_quantity && (
                          <div className="text-xs text-orange-600 mt-1">Max stock reached</div>
                        )}
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
            <div className="border border-gray-100 rounded p-6 bg-white mb-4">
              <h3 className="text-lg font-semibold text-black mb-4">Shipping Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+63 912 345 6789"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Shipping Address *</label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="123 Street Name, Barangay, City, Province, ZIP Code"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black resize-none"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="border border-gray-100 rounded p-6 bg-white">
              <div className="flex items-baseline justify-between mb-4">
                <div className="text-lg font-semibold text-black">Total</div>
                <div className="text-2xl font-extrabold text-black">₱{subtotal.toLocaleString()} PHP</div>
              </div>

              <p className="text-xs text-black/60 mb-4 leading-relaxed">Shipping fees are not included and are handled by the buyer. The shipping cost depends on the delivery location and will be paid directly by the buyer.</p>

              <textarea placeholder="Order note for carrier pickup branch" className="w-full border rounded p-3 mb-4 text-sm h-24 resize-none text-black" />

              {payError && (
                <div className="text-xs text-red-600 mb-3">{payError}</div>
              )}

              <button
                onClick={handleCheckout}
                disabled={selectedItems.size === 0 || isPaying}
                className={`w-full flex items-center justify-center gap-3 py-3 rounded-md ${selectedItems.size === 0 || isPaying ? 'bg-gray-300 text-gray-600' : 'bg-gray-900 text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V17M9 14h6"/></svg>
                {isPaying ? 'Placing Order…' : `Place Order (${selectedItems.size} ${selectedItems.size === 1 ? 'item' : 'items'})`}
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
