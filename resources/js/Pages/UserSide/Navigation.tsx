import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { route } from 'ziggy-js';

const Navigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [underlineTranslateX, setUnderlineTranslateX] = useState(0);
  const [underlineWidth, setUnderlineWidth] = useState(0);
  const [previousActiveIndex, setPreviousActiveIndex] = useState(-1);
  const page = usePage();
  const { url } = page;
  const { auth } = page.props as any;
  const isAuthenticated = Boolean(auth && auth.user);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Log out',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch('/user/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        await router.visit(url, { preserveState: true, preserveScroll: true });
        await Swal.fire('Logged out', 'You have been logged out.', 'success');
      } else {
        await Swal.fire('Error', 'Logout failed. Please try again.', 'error');
      }
    } catch (e) {
      await Swal.fire('Error', 'Logout failed. Please try again.', 'error');
    }
  };
  const navRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { route: 'landing', label: 'Home' },
    { route: 'products', label: 'Products' },
    { route: 'repair', label: 'Repair' },
    { route: 'services', label: 'Services' },
    { route: 'login', label: 'ACCOUNT' }
  ];

  let activeIndex = -1;

  // Map URLs to nav items
  const urlToRouteMap: Record<string, string> = {
    '/': 'landing',
    '/products': 'products',
    '/repair-services': 'repair',
    '/services': 'services',
    '/register': 'login', // Register page should highlight ACCOUNT
    '/login': 'login', // Login page should highlight ACCOUNT
    '/user/login': 'login', // User login page should highlight ACCOUNT
    '/shop-owner/login': 'login', // Shop Owner Login should highlight ACCOUNT
    '/shop-owner-register': 'services', // Shop Owner Registration should highlight Services
    '/shop/register': 'services', // Alternative Shop Owner Registration URL
    '/shop-owner/register': 'services' // Another possible URL
  };

  const cleanUrl = url.split('?')[0]; // Remove query params
  let currentRoute = urlToRouteMap[url] || urlToRouteMap[cleanUrl];
  // Treat product detail pages (e.g. /products/product-02) as the `products` route
  if (!currentRoute && cleanUrl.startsWith('/products')) {
    currentRoute = 'products';
  }
  if (currentRoute) {
    activeIndex = navItems.findIndex(item => item.route === currentRoute);
  } else if (url.includes('shop-owner') && url.includes('register')) {
    // Special case for shop owner registration pages
    activeIndex = navItems.findIndex(item => item.route === 'services');
  }

  useEffect(() => {
    if (navRef.current && activeIndex !== -1) {
      const links = navRef.current.querySelectorAll('a');
      const activeLink = links[activeIndex] as HTMLElement;

      if (activeLink) {
        const rect = activeLink.getBoundingClientRect();
        const navRect = navRef.current.getBoundingClientRect();

        // Calculate new position relative to nav container
        const newTranslateX = rect.left - navRect.left;
        const newWidth = rect.width;

        // If this is the first load or same index, set position immediately
        if (previousActiveIndex === -1 || previousActiveIndex === activeIndex) {
          setUnderlineTranslateX(newTranslateX);
          setUnderlineWidth(newWidth);
        } else {
          // Animate from current position to new position
          // The CSS transition will handle the smooth movement
          setUnderlineTranslateX(newTranslateX);
          setUnderlineWidth(newWidth);
        }

        // Update previous active index for next change
        setPreviousActiveIndex(activeIndex);
      }
    }
  }, [activeIndex, url, previousActiveIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for cart additions from other components
  useEffect(() => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }

    // Initialize from localStorage for authenticated users
    try {
      const raw = localStorage.getItem('ss_cart');
      const cart = raw ? JSON.parse(raw) : [];
      const total = cart.reduce((s: number, it: any) => s + (it.qty || 0), 0);
      setCartCount(total);
    } catch (e) {
      // ignore
    }

    const handler = (e: Event) => {
      // Recompute total from localStorage to stay in sync
      try {
        const raw = localStorage.getItem('ss_cart');
        const cart = raw ? JSON.parse(raw) : [];
        const total = cart.reduce((s: number, it: any) => s + (it.qty || 0), 0);
        setCartCount(total);
      } catch (err) {
        // fallback: increment by 1
        const ce = e as CustomEvent;
        const added = (ce && ce.detail && typeof ce.detail.added === 'number') ? ce.detail.added : 1;
        setCartCount((c) => c + added);
      }
    };

    window.addEventListener('cart:added', handler as EventListener);
    return () => window.removeEventListener('cart:added', handler as EventListener);
  }, [isAuthenticated]);

  return (
    <nav className="bg-white border-b border-transparent sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <Link href={route("landing")} className="text-2xl font-bold text-black tracking-tight hover:opacity-70 transition-opacity">
            SoleSpace
          </Link>
          <div className="hidden md:flex items-center space-x-10 relative" ref={navRef}>
            {navItems.map((item, index) => (
              <Link
                key={item.route}
                href={route(item.route)}
                aria-current={activeIndex === index ? "page" : undefined}
                className={`text-sm uppercase tracking-wider transition-all duration-300 ease-in-out pb-2 ${
                  activeIndex === index
                    ? 'font-semibold text-gray-900'
                    : 'font-medium text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {/* Animated underline indicator that moves from previous to current active item */}
            <div
              className="absolute bottom-0 h-0.5 bg-gray-900 transition-all duration-300 ease-in-out"
              style={{
                transform: `translateX(${underlineTranslateX}px)`,
                width: `${underlineWidth}px`,
              }}
            />
          </div>
          <div className="flex items-center space-x-4">
            {/* User Icon with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="text-black p-2 hover:opacity-70 transition-opacity"
                aria-label="User account"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-black shadow-lg rounded z-50">
                  {isAuthenticated ? (
                    <button
                      className="block w-full text-left px-4 py-3 text-black text-sm font-medium uppercase tracking-wider hover:bg-gray-100 transition-colors"
                      onClick={() => { setUserDropdownOpen(false); handleLogout(); }}
                    >
                      Log out
                    </button>
                  ) : (
                    <a
                      href="/user/login"
                      className="block px-4 py-3 text-black text-sm font-medium uppercase tracking-wider hover:bg-gray-100 transition-colors border-b border-gray-200"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Customer Login
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Icon */}
            <Link id="cart-icon" href="/checkout" className="text-black p-2 hover:opacity-70 transition-opacity relative" aria-label="Shopping cart">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
              </svg>
              {/* Cart badge (only for authenticated users) */}
              {isAuthenticated && (
                <span id="cart-badge" className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-black p-2"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen ? "true" : "false"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-gray-200">
            <Link
              href={route("landing")}
              aria-current={activeIndex === 0 ? "page" : undefined}
              className={`block text-sm font-medium uppercase tracking-wider transition-all duration-300 ease-in-out ${
                activeIndex === 0 ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Home
            </Link>
            <Link
              href={route("products")}
              aria-current={activeIndex === 1 ? "page" : undefined}
              className={`block text-sm font-medium uppercase tracking-wider transition-all duration-300 ease-in-out ${
                activeIndex === 1 ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Products
            </Link>
            <Link
              href={route("repair")}
              aria-current={activeIndex === 2 ? "page" : undefined}
              className={`block text-sm font-medium uppercase tracking-wider transition-all duration-300 ease-in-out ${
                activeIndex === 2 ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Repair
            </Link>
            <Link
              href={route("services")}
              aria-current={activeIndex === 3 ? "page" : undefined}
              className={`block text-sm font-medium uppercase tracking-wider transition-all duration-300 ease-in-out ${
                activeIndex === 3 ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Services
            </Link>
            {/* Contact removed from navbar */}
            {isAuthenticated ? (
              <button
                onClick={() => handleLogout()}
                className="block text-sm font-medium uppercase tracking-wider transition-all duration-300 ease-in-out text-gray-500 hover:text-gray-700"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  href={route("login")}
                  className={`block text-sm font-medium uppercase tracking-wider transition-all duration-300 ease-in-out ${
                    (activeIndex === 4 || url === '/login') ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href={route("register")}
                  aria-current={activeIndex === 4 ? "page" : undefined}
                  className={`block text-sm font-medium uppercase tracking-wider transition-all duration-300 ease-in-out ${
                    activeIndex === 4 ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
