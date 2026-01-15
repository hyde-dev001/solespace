/**
 * Super Admin Layout Component (Complete Version)
 * 
 * Full-featured layout with:
 * - Collapsible sidebar with animations
 * - Dark mode support
 * - User profile dropdown
 * - Mobile responsive
 * - Active route highlighting
 * - Smooth transitions
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Link, router } from '@inertiajs/react';

// Dark Mode Context
const DarkModeContext = createContext();

function DarkModeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      console.log('Initial theme from localStorage:', savedTheme);
      return savedTheme || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    console.log('Theme changed to:', theme);
    // Save theme to localStorage and apply to DOM
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      console.log('Dark mode activated');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Light mode activated');
    }
  }, [theme]);

  const toggleTheme = () => {
    console.log('Toggle theme clicked, current:', theme);
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('Switching to:', newTheme);
      return newTheme;
    });
  };

  const isDark = theme === 'dark';

  return (
    <DarkModeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </DarkModeContext.Provider>
  );
}

function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) throw new Error('useDarkMode must be used within DarkModeProvider');
  return context;
}

// Main Layout Component
function SuperAdminLayout({ children, auth }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState('admin');
  const { isDark, toggleTheme } = useDarkMode();

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const isActive = (path) => currentPath === path;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen && !event.target.closest('.user-dropdown')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      router.post('/admin/logout');
    }
  };

  const menuItems = [
    {
      name: 'Admin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      subItems: [
        { name: 'Shop Registrations', path: '/admin/shop-registrations' },
        { name: 'Registered Shops', path: '/admin/registered-shops' },
        { name: 'Flagged Accounts', path: '/admin/flagged-accounts' },
        { name: 'Data Reports', path: '/admin/data-reports' },
        { name: 'Notifications', path: '/admin/notifications' },
        { name: 'User Management', path: '/admin/user-management' },
        { name: 'Admin Management', path: '/admin/admin-management' },
        { name: 'System Monitoring', path: '/admin/system-monitoring' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-50 ${
          isSidebarExpanded ? 'w-[280px]' : 'w-20'
        } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-gray-200 dark:border-gray-700 ${isSidebarExpanded ? 'px-6' : 'px-4'}`}>
          {isSidebarExpanded ? (
            <>
              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="hidden lg:flex p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Collapse sidebar"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1 flex justify-center">
                <Link href="/" className="flex items-center space-x-2 group">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    SoleSpace
                  </span>
                </Link>
              </div>
              <div className="w-9"></div>
            </>
          ) : (
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="hidden lg:flex mx-auto p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              title="Expand sidebar"
            >
              <svg
                className="w-5 h-5 transition-transform duration-300 rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="mb-3">
            <p className={`text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-3 ${!isSidebarExpanded && 'text-center'}`}>
              {isSidebarExpanded ? 'Menu' : '•••'}
            </p>
          </div>

          {menuItems.map((item, index) => (
            <div key={item.name}>
              <button
                onClick={() => setOpenSubmenu(openSubmenu === item.name.toLowerCase() ? null : item.name.toLowerCase())}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  openSubmenu === item.name.toLowerCase()
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                } ${!isSidebarExpanded && 'justify-center px-3'}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isSidebarExpanded && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${openSubmenu === item.name.toLowerCase() ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>

              {/* Submenu */}
              {item.subItems && isSidebarExpanded && (
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openSubmenu === item.name.toLowerCase() ? 'max-h-96 mt-2' : 'max-h-0'
                  }`}
                >
                  <div className="ml-11 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        onClick={() => console.log('Navigating to:', subItem.path, subItem.name)}
                        className={`block px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                          isActive(subItem.path)
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium border-l-2 border-blue-600 dark:border-blue-400 pl-3'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>


      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarExpanded ? 'lg:ml-[280px]' : 'lg:ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-200">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <div className="hidden lg:block">
              <div className="space-y-1">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentPath === '/admin/shop-registrations' && 'Shop Registrations'}
                  {currentPath === '/admin/registered-shops' && 'Registered Shops'}
                  {currentPath === '/admin/flagged-accounts' && 'Flagged Accounts'}
                  {currentPath === '/admin/data-reports' && 'Data Reports'}
                  {currentPath === '/admin/notifications' && 'Notifications'}
                  {currentPath === '/admin/user-management' && 'User Management'}
                  {currentPath === '/admin/system-monitoring' && 'System Monitoring'}
                  {currentPath === '/admin/profile' && 'Profile'}
                  {!currentPath.startsWith('/admin/') && 'Admin Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex-1" />

            {/* Dark Mode Toggle - Desktop */}
            <button
              onClick={toggleTheme}
              className="hidden lg:flex p-2.5 mr-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Dark Mode Toggle - Mobile */}
            <button
              onClick={toggleTheme}
              className="lg:hidden p-2 mr-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative user-dropdown">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-sm">
                    {auth?.user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {auth?.user?.name || 'Super Admin'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                </div>
                <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {auth?.user?.name || 'Super Admin'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {auth?.user?.email || 'admin@thesis.com'}
                    </p>
                  </div>
                  <Link
                    href="/admin/profile"
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="transition-colors duration-200">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Export with DarkMode provider wrapper
export default function SuperAdminLayoutWithProviders({ children, auth }) {
  return (
    <DarkModeProvider>
      <SuperAdminLayout auth={auth}>
        {children}
      </SuperAdminLayout>
    </DarkModeProvider>
  );
}
