import React from 'react';
import { router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';

type AddToCartButtonProps = {
  productId?: number | string;
  product?: any;
  label?: string;
  onAdded?: () => void;
  className?: string;
  disabled?: boolean;
  buyNow?: boolean;
};

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId, product, label = 'Add to cart', onAdded, className, disabled, buyNow = false }) => {
  const { auth } = usePage().props as any;
  const [isLoading, setIsLoading] = React.useState(false);
  const isProcessingRef = React.useRef(false); // Use ref for immediate synchronous check
  
  // Check if user is authenticated and is a regular customer (not ERP staff)
  const user = auth?.user;
  const userRole = user?.role?.toUpperCase();
  const isERPStaff = userRole && ['HR', 'FINANCE_STAFF', 'FINANCE_MANAGER', 'FINANCE', 'CRM', 'MANAGER', 'STAFF'].includes(userRole);
  const isAuthenticated = Boolean(user && !isERPStaff);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // CRITICAL: Check ref FIRST before any state updates - this is synchronous and immediate
    if (disabled || isLoading || isProcessingRef.current) {
      console.log('[CartActions] Click blocked - already processing');
      return;
    }
    
    // Set BOTH ref and state immediately
    isProcessingRef.current = true;
    setIsLoading(true);

    if (!isAuthenticated) {
      try {
        window.dispatchEvent(new CustomEvent('cart:guest:add-attempt', { detail: { productId } }));
      } catch (err) {}
      setIsLoading(false);
      return;
    }

    const pid = Number(productId ?? (product && product.id) ?? 0);
    const addQty = (typeof product?.qty === 'number') ? product.qty : 1;
    const size = product?.size ?? null;
    const color = product?.color ?? null;
    const selectedImage = product?.selectedImage ?? product?.primary ?? (product?.images && product.images[0]) ?? null;

    try {
      // Add to database via API
      // Include the selected image and color in options to distinguish between color variants
      const response = await axios.post('/api/cart/add', {
        product_id: pid,
        quantity: addQty,
        size: size,
        options: { 
          image: selectedImage,
          color: color
        },
      });

      if (response.data.success) {
        // Update localStorage for immediate UI feedback
        const key = 'ss_cart';
        const raw = localStorage.getItem(key);
        const cart = raw ? JSON.parse(raw) : [];
        
        // Create unique ID based on product + size + color + image (for color variants)
        const optsPart = size ? `::size=${size}` : '';
        const colorPart = color ? `::color=${encodeURIComponent(color)}` : '';
        const imgPart = selectedImage ? `::img=${encodeURIComponent(selectedImage)}` : '';
        const localId = `${pid}${optsPart}${colorPart}${imgPart}`;
        
        const existing = cart.find((c: any) => String(c.id) === localId);
        if (existing) {
          existing.qty += addQty;
        } else {
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
            size: size,
            color: color,
            image: selectedImage,
            stock_quantity: product?.stock_quantity || product?.stockQuantity || 0,
          });
        }
        
        localStorage.setItem(key, JSON.stringify(cart));

        // Notify with the new total count from server
        const total = response.data.total_count || cart.reduce((s: number, it: any) => s + (it.qty || 0), 0);
        const ev = new CustomEvent('cart:added', { detail: { added: addQty, total } });
        window.dispatchEvent(ev);

        // If Buy Now, redirect to checkout immediately
        if (buyNow) {
          router.visit('/checkout');
          return;
        }

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Added to Cart!',
          text: `${product?.name || 'Product'} has been added to your cart`,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          toast: true,
          position: 'top-end',
        });

        // Scroll to the cart icon
        const el = document.getElementById('cart-icon');
        if (el) {
          el.classList.add('cart-pulse');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          window.setTimeout(() => el.classList.remove('cart-pulse'), 1200);
        }

        if (onAdded) onAdded();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to add item to cart';
      
      if (error.response?.status === 400) {
        // Stock error
        Swal.fire({
          icon: 'warning',
          title: 'Stock Limit',
          text: errorMsg,
          showConfirmButton: true,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
          showConfirmButton: true,
        });
      }
    } finally {
      isProcessingRef.current = false; // Reset ref
      setIsLoading(false);
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleClick} 
      onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      className={className || 'btn btn-primary'}
      disabled={disabled || isLoading}
      style={{ 
        pointerEvents: isLoading ? 'none' : 'auto',
        opacity: isLoading ? 0.6 : 1,
        cursor: isLoading ? 'not-allowed' : 'pointer'
      }}
    >
      {isLoading ? '⏳ Adding...' : label}
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
