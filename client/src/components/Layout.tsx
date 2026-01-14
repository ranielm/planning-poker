import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User, Plus, Home } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { useI18n } from '../i18n';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img src="/poker-chip.svg" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">Planning Poker</span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
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

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
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
                <span>{user?.displayName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.nav.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
