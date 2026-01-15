import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [underlineLeft, setUnderlineLeft] = useState(0);
  const [underlineWidth, setUnderlineWidth] = useState(0);
  const { url } = usePage();
  const navRef = useRef(null);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/repair-services', label: 'Repair' },
    { path: '/services', label: 'Services' },
    { path: '/contact', label: 'Contact' },
    { path: '/register', label: 'Register' }
  ];

  let activeIndex = navItems.findIndex(item => item.path === url);
  if (activeIndex === -1 && url === '/login') {
    activeIndex = navItems.findIndex(item => item.path === '/register');
  }

  useEffect(() => {
    if (navRef.current) {
      const links = navRef.current.querySelectorAll('a');
      const activeLink = links[activeIndex];
      if (activeLink) {
        const rect = activeLink.getBoundingClientRect();
        const navRect = navRef.current.getBoundingClientRect();
        setUnderlineLeft(rect.left - navRect.left);
        setUnderlineWidth(rect.width);
      }
    }
  }, [activeIndex]);

  return (
    <nav className="bg-white border-b border-black sticky top-0 z-50">
      <div className="max-w-480 mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="text-2xl font-bold text-black tracking-tight hover:opacity-70 transition-opacity">
            SoleSpace
          </Link>
          <div className="hidden md:flex items-center space-x-10 relative" ref={navRef}>
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-black text-sm uppercase tracking-wider hover:opacity-70 transition-all duration-300 ease-in-out ${
                  activeIndex === index ? 'font-bold' : 'font-medium'
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
            <button
              className="text-black p-2 hover:opacity-70 transition-opacity"
              aria-label="User account"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            <button
              className="text-black p-2 hover:opacity-70 transition-opacity relative"
              aria-label="Shopping cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
              </svg>
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
            <Link href="/" className="block text-black text-sm font-medium uppercase tracking-wider">Home</Link>
            <Link href="/products" className="block text-black text-sm font-medium uppercase tracking-wider">Products</Link>
            <Link href="/repair-services" className="block text-black text-sm font-medium uppercase tracking-wider">Repair</Link>
            <Link href="/services" className="block text-black text-sm font-medium uppercase tracking-wider">Services</Link>
            <Link href="/contact" className="block text-black text-sm font-medium uppercase tracking-wider">Contact</Link>
            <Link href="/login" className="block text-black text-sm font-medium uppercase tracking-wider">Login</Link>
            <Link href="/register" className="block text-black text-sm font-medium uppercase tracking-wider">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
