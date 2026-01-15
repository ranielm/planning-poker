import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User, Plus, Home, Menu, X } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { useI18n } from '../i18n';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 light:bg-slate-50 flex flex-col transition-colors">
      {/* Header */}
      <header className="bg-slate-800 dark:bg-slate-800 light:bg-white border-b border-slate-700 dark:border-slate-700 light:border-slate-200 transition-colors">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <img src="/poker-chip.svg" alt="Logo" className="h-7 w-7 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900">Planning Poker</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-2">
              <Link
                to="/"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-100 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>{t.nav.home}</span>
              </Link>
              <Link
                to="/create"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{t.home.createRoom}</span>
              </Link>
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector />
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-100 transition-colors"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="max-w-[120px] truncate">{user?.displayName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.nav.logout}</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 dark:border-slate-700 light:border-slate-200">
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-600 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-100"
              >
                <Home className="h-4 w-4" />
                <span>{t.nav.home}</span>
              </Link>
              <Link
                to="/create"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-primary-600 text-white"
              >
                <Plus className="h-4 w-4" />
                <span>{t.home.createRoom}</span>
              </Link>
              <div className="border-t border-slate-700 dark:border-slate-700 light:border-slate-200 pt-2 mt-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-600"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="h-6 w-6 rounded-full" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span>{user?.displayName}</span>
                </Link>
                <div className="flex items-center justify-between px-3 py-2">
                  <LanguageSelector />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-slate-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t.nav.logout}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-900 dark:bg-slate-900 light:bg-slate-50 transition-colors">
        <Outlet />
      </main>
    </div>
  );
}
