import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Menu, X, LogIn, User, Crown, LogOut, LayoutDashboard, Settings } from 'lucide-react';

const TIER_LABELS = {
  free: 'Free',
  personal: 'Personal',
  pro: 'Pro',
};

const TIER_COLORS = {
  pro: 'bg-amber-50 text-amber-700 border-amber-200',
  personal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  free: 'bg-gray-50 text-gray-500 border-gray-200',
};

export default function Header({ currentTier, isAuthenticated, user, isAdmin, onOpenAuth, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNav = (key) => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    if (key === 'pricing') {
      navigate('/pricing');
    } else if (key === 'tool') {
      navigate('/');
    } else if (key === 'about') {
      navigate('/about');
    }
  };

  const navItems = [
    { key: 'tool' },
    { key: 'pricing' },
    { key: 'about' },
  ];

  const tierLabel = TIER_LABELS[currentTier] || 'Free';
  const tierColor = TIER_COLORS[currentTier] || TIER_COLORS.free;
  const userEmail = user?.email || '';
  const displayEmail = userEmail.length > 20 ? userEmail.slice(0, 18) + '\u2026' : userEmail;

  const handleLogout = () => {
    setUserMenuOpen(false);
    onLogout?.();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-gray-900 tracking-tight hidden sm:inline">
              {t('brand')}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
              >
                {t(`nav.${item.key}`)}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${tierColor}`}>
                  {currentTier === 'pro' && <Crown className="w-3 h-3" />}
                  {tierLabel}
                </span>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span className="max-w-[120px] truncate">{displayEmail}</span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          {t('nav.dashboard')}
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-emerald-500" />
                            {t('nav.adminPanel', 'Admin Panel')}
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('nav.logout')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth?.()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t('nav.login')}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1.5 text-gray-600 hover:text-emerald-600"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden py-3 border-t border-gray-100">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className="block w-full text-left py-2 text-sm font-medium text-gray-600 hover:text-emerald-600"
              >
                {t(`nav.${item.key}`)}
              </button>
            ))}

            <div className="border-t border-gray-100 mt-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-1 py-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${tierColor}`}>
                      {currentTier === 'pro' && <Crown className="w-3 h-3" />}
                      {tierLabel}
                    </span>
                    <span className="text-xs text-gray-500 truncate">{userEmail}</span>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-left py-2 text-sm font-medium text-emerald-600"
                  >
                    {t('nav.dashboard')}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-left py-2 text-sm font-medium text-emerald-700"
                    >
                      {t('nav.adminPanel', 'Admin Panel')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-sm font-medium text-red-600"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); onOpenAuth?.(); }}
                  className="block w-full text-left py-2 text-sm font-medium text-gray-600 hover:text-emerald-600"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
