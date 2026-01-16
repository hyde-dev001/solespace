import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';

const Navigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [underlineLeft, setUnderlineLeft] = useState(0);
  const [underlineWidth, setUnderlineWidth] = useState(0);
  const { url } = usePage();
  const navRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { route: 'landing', label: 'Home' },
    { route: 'products', label: 'Products' },
    { route: 'repair', label: 'Repair' },
    { route: 'services', label: 'Services' },
    { route: 'contact', label: 'Contact' },
    { route: 'register', label: 'Register' }
  ];

  let activeIndex = navItems.findIndex(item => {
    try {
      return url === route(item.route) || url.startsWith(route(item.route));
    } catch {
      return false;
    }
  });
  if (activeIndex === -1 && url === route('login')) {
    activeIndex = navItems.findIndex(item => item.route === 'register');
  }

  useEffect(() => {
    if (navRef.current) {
      const links = navRef.current.querySelectorAll('a');
      const activeLink = links[activeIndex] as HTMLElement;
      if (activeLink) {
        const rect = activeLink.getBoundingClientRect();
        const navRect = navRef.current.getBoundingClientRect();
        setUnderlineLeft(rect.left - navRect.left);
        setUnderlineWidth(rect.width);
      }
    }
  }, [activeIndex, url]);

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

  return (
    <nav className="bg-white border-b border-black sticky top-0 z-50">
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
                className={`text-black text-sm uppercase tracking-wider hover:opacity-70 transition-all duration-300 ease-in-out ${activeIndex === index ? 'font-bold' : 'font-medium'
                  }`}
              >
                {item.label}
              </Link>
            ))}
            <div
              className="absolute bottom-0 h-0.5 bg-black transition-all duration-300 ease-in-out"
              style={{
                left: `${underlineLeft}px`,
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
                  <a
                    href="/user/login"
                    className="block px-4 py-3 text-black text-sm font-medium uppercase tracking-wider hover:bg-gray-100 transition-colors border-b border-gray-200"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    Customer Login
                  </a>
                  <a
                    href="/shop-owner/login"
                    className="block px-4 py-3 text-black text-sm font-medium uppercase tracking-wider hover:bg-gray-100 transition-colors"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    Shop Owner Login
                  </a>
                </div>
              )}
            </div>

            {/* Shopping Cart Icon */}
            <button
              className="text-black p-2 hover:opacity-70 transition-opacity relative"
              aria-label="Shopping cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
              </svg>
              {/* Cart badge */}
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>

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
          <div className="md:hidden py-6 space-y-4 border-t border-black">
            <Link href={route("landing")} className="block text-black text-sm font-medium uppercase tracking-wider">Home</Link>
            <Link href={route("products")} className="block text-black text-sm font-medium uppercase tracking-wider">Products</Link>
            <Link href={route("repair")} className="block text-black text-sm font-medium uppercase tracking-wider">Repair</Link>
            <Link href={route("services")} className="block text-black text-sm font-medium uppercase tracking-wider">Services</Link>
            <Link href={route("contact")} className="block text-black text-sm font-medium uppercase tracking-wider">Contact</Link>
            <Link href={route("login")} className="block text-black text-sm font-medium uppercase tracking-wider">Login</Link>
            <Link href={route("register")} className="block text-black text-sm font-medium uppercase tracking-wider">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
