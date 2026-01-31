import React from 'react';
import { router, usePage } from '@inertiajs/react';

type AddToCartButtonProps = {
  productId?: number | string;
  product?: any;
  label?: string;
  onAdded?: () => void;
  className?: string;
};

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId, product, label = 'Add to cart', onAdded, className }) => {
  const { auth } = usePage().props as any;
  const isAuthenticated = Boolean(auth && auth.user);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      try {
        window.dispatchEvent(new CustomEvent('cart:guest:add-attempt', { detail: { productId } }));
      } catch (err) {}
      return;
    }

    if (productId) {
      // Optional: send a request to add the product to server-side cart endpoint.
      // If your project uses a different endpoint, change `/cart/add` accordingly.
      try {
        router.post('/cart/add', { id: productId }, { preserveState: true });
      } catch (err) {
        // ignore failure here; main feature is the UX/navigation
      }
    }

    // Also persist to localStorage so the cart is visible across pages without server round-trips
    try {
      const key = 'ss_cart';
      const raw = localStorage.getItem(key);
      const cart = raw ? JSON.parse(raw) : [];
      const pid = String(productId ?? (product && product.id) ?? '');
      // include selected size (or other distinguishing options) in the local storage id
        // build an options object with distinguishing attributes so different designs/variants stay separate
        const size = product?.size ?? (product && product.options && product.options.size) ?? null;
        const img = product?.primary ?? (product?.images && product.images[0]) ?? '';
        const sku = product?.sku ?? product?.variant ?? null;
        const opts: Record<string, any> = {};
        if (size) opts.size = String(size);
        if (img) opts.img = String(img);
        if (sku) opts.sku = String(sku);
        const optsPart = Object.keys(opts).length ? `::opts=${encodeURIComponent(JSON.stringify(opts))}` : '';
        const localId = `${pid}${optsPart}`;
      const addQty = (typeof product?.qty === 'number') ? product.qty : 1;
      const existing = cart.find((c: any) => String(c.id) === localId);
      if (existing) {
        existing.qty = (existing.qty || 0) + addQty;
      } else {
        // Normalize price to a number (strip currency symbols/commas)
        let price = 0;
        if (product && typeof product.price !== 'undefined' && product.price !== null) {
          if (typeof product.price === 'number') price = product.price;
          else price = parseFloat(String(product.price).replace(/[^0-9.-]+/g, '')) || 0;
        }

        cart.push({
          id: localId,
          pid: pid,
          qty: addQty,
          name: product?.name ?? null,
          price: price,
          size: product?.size ?? null,
          image: product?.primary ?? (product?.images && product.images[0]) ?? null,
        });
      }
      localStorage.setItem(key, JSON.stringify(cart));

      // Notify with the new total count
      const total = cart.reduce((s: number, it: any) => s + (it.qty || 0), 0);
      const ev = new CustomEvent('cart:added', { detail: { added: addQty, total } });
      window.dispatchEvent(ev);
    } catch (e) {
      // ignore storage errors
    }

    // Scroll to the cart icon and add a temporary pulse animation class
    const el = document.getElementById('cart-icon');
    if (el) {
      el.classList.add('cart-pulse');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => el.classList.remove('cart-pulse'), 1200);
    }

    if (onAdded) onAdded();
    // already notified via localStorage update block above
  };

  return (
    <button type="button" onClick={handleClick} className={className || 'btn btn-primary'}>
      {label}
    </button>
  );
};

type CartIconProps = {
  checkoutUrl?: string;
  className?: string;
};

export const CartIcon: React.FC<CartIconProps> = ({ checkoutUrl = '/checkout', className }) => {
  const navigateToCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.visit(checkoutUrl);
  };

  return (
    <div id="cart-icon" onClick={navigateToCheckout} role="button" className={className || 'cart-icon'} style={{cursor: 'pointer', display: 'inline-flex', alignItems: 'center'}}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M6 6H21L20 11H9L6 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 18C7 18.5523 6.55228 19 6 19C5.44772 19 5 18.5523 5 18C5 17.4477 5.44772 17 6 17C6.55228 17 7 17.4477 7 18Z" fill="currentColor" />
        <path d="M20 18C20 18.5523 19.5523 19 19 19C18.4477 19 18 18.5523 18 18C18 17.4477 18.4477 17 19 17C19.5523 17 20 17.4477 20 18Z" fill="currentColor" />
      </svg>
    </div>
  );
};

export default AddToCartButton;
