import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Bell, MessageSquare, Search, User, LogOut, Shield, ChevronDown, Sun, Moon } from 'lucide-react';
import { useEffect } from 'react';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCounts = async () => {
      try {
        const [notifsRes, msgsRes] = await Promise.all([
          api.get('/notifications?limit=1&unread=true'),
          api.get('/messages/unread'),
        ]);
        setUnreadNotifs(notifsRes.data.unreadCount || 0);
        setUnreadMessages(msgsRes.data.unreadCount || 0);
      } catch {
        // Silent - don't spam errors for background polling
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SX</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">SkillX</span>
            </Link>
          </div>

          {user && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/marketplace"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Search className="w-4 h-4 inline mr-1" />
                Marketplace
              </Link>
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/matching"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Matches
              </Link>
              <Link
                to="/messages"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative"
              >
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Messages
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>
              <Link
                to="/notifications"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative"
              >
                <Bell className="w-4 h-4 inline mr-1" />
                Alerts
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadNotifs > 9 ? '9+' : unreadNotifs}
                  </span>
                )}
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <span className="text-primary-700 font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to={`/profile/${user._id}`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && user && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <Link to="/marketplace" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
              Marketplace
            </Link>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
              Dashboard
            </Link>
            <Link to="/matching" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
              Matches
            </Link>
            <Link to="/messages" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
              Messages
            </Link>
            <Link to="/notifications" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
              Notifications
            </Link>
            <button onClick={() => { toggleTheme(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <Link to={`/profile/${user._id}`} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
              My Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
