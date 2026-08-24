import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, User, CreditCard, LogOut, Lock, Eye, EyeOff, X, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/* ──────────────────── HELPERS ──────────────────── */

/**
 * Format a date for billing display (e.g. "June 15, 2026").
 */
function formatBillingDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

/* ──────────────────── TIER BADGE CONFIG ──────────────────── */

const TIER_STYLES = {
  free: { bg: 'bg-gray-100', text: 'text-gray-700', ring: 'ring-gray-200' },
  personal: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  pro: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
};

const STATUS_STYLES = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  expired: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

/* ──────────────────── COMPONENT ──────────────────── */

export default function DashboardPage({
  user,
  tier = 'free',
  subscription,
  onLogout,
  onChangePassword,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* ── Scroll to top ─ */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // Change Password Modal State
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleOpenPwdModal = () => {
    setShowPwdModal(true);
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setPwdError(''); setPwdSuccess(false); setPwdLoading(false);
  };

  const handleClosePwdModal = () => setShowPwdModal(false);

  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();
    setPwdError(''); setPwdSuccess(false);
    if (!currentPwd) { setPwdError(t('dashboard.currentPasswordRequired', 'Please enter your current password')); return; }
    if (!newPwd) { setPwdError(t('dashboard.newPasswordRequired', 'Please enter a new password')); return; }
    if (newPwd.length < 8) { setPwdError(t('dashboard.passwordMinLength', 'New password must be at least 8 characters')); return; }
    if (newPwd !== confirmPwd) { setPwdError(t('dashboard.passwordsDoNotMatch', 'Passwords do not match')); return; }
    if (newPwd === currentPwd) { setPwdError(t('dashboard.passwordSameAsCurrent', 'New password must be different from current password')); return; }
    setPwdLoading(true);
    try {
      await onChangePassword(currentPwd, newPwd);
      setPwdSuccess(true);
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setTimeout(() => { setShowPwdModal(false); setPwdSuccess(false); }, 1500);
    } catch (err) {
      setPwdError(err.message || t('dashboard.changePasswordFailed', 'Failed to change password'));
    } finally {
      setPwdLoading(false);
    }
  };

  /* ── Derived data ── */
  const safeUser = user || { email: 'Guest', id: null };
  const safeTier = tier || 'free';
  const safeSub = subscription || {};

  /* ── Tier badge ── */
  const tierStyle = TIER_STYLES[safeTier] || TIER_STYLES.free;
  const tierLabel = safeTier.charAt(0).toUpperCase() + safeTier.slice(1);

  /* ─ Subscription status ── */
  const subStatus = (safeSub.status || 'active').toLowerCase();
  const statusStyle = STATUS_STYLES[subStatus] || STATUS_STYLES.active;
  const statusLabel = subStatus.charAt(0).toUpperCase() + subStatus.slice(1);

  /* ── PayPal manage URL ── */
  const paypalManageUrl = safeSub.paypalSubscriptionId
    ? `https://www.paypal.com/myaccount/autopay/connect/${safeSub.paypalSubscriptionId}`
    : 'https://www.paypal.com/myaccount/autopay/';

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ───────── HEADER ────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
        </div>
      </header>

      {/* ────────── MAIN CONTENT ────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-6">

          {/* ── 1. Welcome Section ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {t('dashboard.welcome', 'Welcome back')},{' '}
                <span className="text-emerald-600">{safeUser.email}</span>
              </h1>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ring-1 ring-inset ${tierStyle.bg} ${tierStyle.text} ${tierStyle.ring}`}
            >
              {tierLabel}
            </span>
          </div>

          {/* ── 2. Subscription Card ── */}
          <section className="rounded-xl border border-gray-100 bg-white shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {t('dashboard.subscription', 'Subscription')}
              </h2>
            </div>

            {safeTier === 'free' ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {t('dashboard.freePlan', 'Free Plan')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('dashboard.freeDescription', 'Basic conversion with limited features. Upgrade for more power.')}
                  </p>
                </div>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
                >
                  {t('dashboard.upgrade', 'Upgrade Plan')}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {t(`pricing.${safeTier}.name`, tierLabel)} —{' '}
                      {t(`pricing.${safeTier}.price`, '')}
                      {t(`pricing.${safeTier}.period`, '')}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                    {statusLabel}
                  </span>
                </div>

                {(safeSub.currentPeriodEnd || safeSub.currentPeriodStart) && (
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                    {safeSub.currentPeriodStart && (
                      <p>
                        {t('dashboard.subStart', 'Start date')}: {' '}
                        <span className="font-medium text-gray-700">
                          {formatBillingDate(safeSub.currentPeriodStart)}
                        </span>
                      </p>
                    )}
                    {safeSub.currentPeriodEnd && (
                      <p>
                        {t('dashboard.subEnd', 'End date')}: {' '}
                        <span className="font-medium text-gray-700">
                          {formatBillingDate(safeSub.currentPeriodEnd)}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={paypalManageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                  >
                    {t('dashboard.manageSubscription', 'Manage Subscription')}
                  </a>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                  >
                    {t('dashboard.changePlan', 'Change Plan')}
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* ── 3. Account Settings Card ── */}
          <section className="rounded-xl border border-gray-100 bg-white shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {t('dashboard.accountSettings', 'Account Settings')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  {t('dashboard.email', 'Email')}
                </label>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-sm text-gray-800">{safeUser.email}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {t('dashboard.readOnly', 'Read-only')}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleOpenPwdModal}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                >
                  {t('dashboard.changePassword', 'Change Password')}
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-red-200 bg-white text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('dashboard.logout', 'Logout')}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Change Password Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleClosePwdModal}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleClosePwdModal} className="absolute top-4 right-4 z-10 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center pt-8 pb-4 px-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.changePassword', 'Change Password')}</h2>
            </div>

            <form onSubmit={handleSubmitChangePassword} className="px-6 pb-6 space-y-4">
              {pwdSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  {t('dashboard.passwordChangedSuccess', 'Password changed successfully')}
                </div>
              )}
              {pwdError && !pwdSuccess && (
                <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {pwdError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('dashboard.currentPassword', 'Current Password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    autoComplete="current-password"
                    disabled={pwdLoading}
                  />
                  <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('dashboard.newPassword', 'New Password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder={t('dashboard.passwordPlaceholder', 'At least 8 characters')}
                    className="w-full pl-10 pr-11 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    autoComplete="new-password"
                    disabled={pwdLoading}
                  />
                  <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('dashboard.confirmNewPassword', 'Confirm New Password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    autoComplete="new-password"
                    disabled={pwdLoading}
                  />
                  <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {pwdLoading ? t('dashboard.changingPassword', 'Changing...') : t('dashboard.confirmChange', 'Confirm Change')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
