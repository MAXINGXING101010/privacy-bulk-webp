import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Users, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TIER_STYLES = {
  free: { bg: 'bg-gray-100', text: 'text-gray-700' },
  personal: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  pro: { bg: 'bg-amber-50', text: 'text-amber-700' },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function AdminPage({ getAllUsers, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    window.scrollTo(0, 0);
    setUsers(getAllUsers());
  }, [getAllUsers]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...users].sort((a, b) => {
    const va = a[sortKey] || '';
    const vb = b[sortKey] || '';
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortHeader = ({ label, field }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-emerald-600 select-none"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === field && (
          <ArrowUpDown className={`w-3 h-3 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
        )}
      </span>
    </th>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.tool')}</span>
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-gray-900">{t('brand')}</span>
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-gray-400">admin@privacybulkwebp.com</span>
              <button
                onClick={onLogout}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {t('admin.title', 'Admin Panel')}
            </h1>
            <p className="text-sm text-gray-500">
              {t('admin.subtitle', 'Manage registered users')} — {users.length} {t('admin.users', 'users')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: t('admin.totalUsers', 'Total Users'), value: users.length, color: 'text-gray-900' },
            { label: t('admin.freeUsers', 'Free'), value: users.filter(u => u.tier === 'free').length, color: 'text-gray-600' },
            { label: t('admin.personalUsers', 'Personal'), value: users.filter(u => u.tier === 'personal').length, color: 'text-emerald-600' },
            { label: t('admin.proUsers', 'Pro'), value: users.filter(u => u.tier === 'pro').length, color: 'text-amber-600' },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* User Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <SortHeader label={t('admin.email', 'Email')} field="email" />
                  <SortHeader label={t('admin.tier', 'Tier')} field="tier" />
                  <SortHeader label={t('admin.registered', 'Registered')} field="createdAt" />
                  <SortHeader label={t('admin.subStart', 'Sub Start')} field="subscriptionStart" />
                  <SortHeader label={t('admin.subEnd', 'Sub End')} field="subscriptionEnd" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                      {t('admin.noUsers', 'No registered users yet')}
                    </td>
                  </tr>
                ) : (
                  sorted.map((u) => {
                    const ts = TIER_STYLES[u.tier] || TIER_STYLES.free;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ts.bg} ${ts.text}`}>
                            {u.tier.charAt(0).toUpperCase() + u.tier.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.subscriptionStart)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.subscriptionEnd)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
