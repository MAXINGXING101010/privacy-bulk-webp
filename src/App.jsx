import { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Zap,
  Lock,
  Download,
  Settings2,
  Tag,
  DownloadCloud,
  AlertCircle,
} from 'lucide-react';

import Header from './components/Header';
import DropZone from './components/DropZone';
import ImageGrid, { FileCard, ResultCard } from './components/ImageGrid';
import PricingModal from './components/Pricing';
import AuthModal from './components/AuthModal';
import UpgradeModal from './components/UpgradeModal';
import Footer from './components/Footer';
import SidebarAd from './components/ads/SidebarAd';
import BottomAd from './components/ads/BottomAd';
import LegalPage from './pages/LegalPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import { privacyPolicy, termsOfService, cookiePolicy, refundPolicy } from './pages/legalContent';
import { useAuth } from './hooks/useAuth';
import { useConverter } from './hooks/useConverter';
import { downloadZip } from './utils/imageConverter';
import { TIER_CONFIG } from './utils/tierConfig';
import { trackPageView, track } from './utils/analytics';

/* ──────────────────── HOME PAGE ──────────────────── */
function HomePage({ openPricing, showPricing, closePricing, handleUpgrade, auth, showAds }) {
  const { t } = useTranslation();
  const tierKey = auth.tier || 'free';
  const tier = TIER_CONFIG[tierKey] || TIER_CONFIG.free;
  const converter = useConverter(tier);
  const converterRef = useRef(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleLockedClick = useCallback((feature) => {
    track.feature_locked(feature);
    setUpgradeFeature(feature || 'premium');
    if (!auth.isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowUpgradeModal(true);
    }
  }, [auth.isAuthenticated]);

  const handleDownloadZip = () => {
    if (!tier.hasZipDownload) {
      handleLockedClick('zip');
      return;
    }
    track.download('zip');
    downloadZip(converter.results);
  };

  // Check file limit for free users
  const handleAddFiles = (files) => {
    const totalFiles = converter.files.length + files.length;
    if (totalFiles > tier.maxImages && tier.maxImages !== Infinity) {
      handleLockedClick('batch_limit');
      return;
    }
    converter.addFiles(files);
  };

  const features = [
    { icon: Shield, key: 'privacy', color: 'text-emerald-600 bg-emerald-50' },
    { icon: Zap, key: 'batch', color: 'text-blue-600 bg-blue-50' },
    { icon: Settings2, key: 'quality', color: 'text-purple-600 bg-purple-50' },
    { icon: Download, key: 'zip', color: 'text-orange-600 bg-orange-50' },
    { icon: Tag, key: 'rename', color: 'text-cyan-600 bg-cyan-50' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        currentTier={tierKey}
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        isAdmin={auth.isAdmin}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={auth.logout}
      />

      {/* ===== SINGLE SCREEN — unified background ===== */}
      <main className="flex-1 flex flex-col lg:flex-row bg-white" ref={converterRef}>
        {/* LEFT — Hero + Converter, centered */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="w-full max-w-xl">
            {/* Hero */}
            <div className="mb-5 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-2">
                <Lock className="w-3.5 h-3.5" />
                {t('privacy.badge')}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-0.5">
                {t('hero.title')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* Converter Tool */}
            <div id="converter">
              {/* No files — full drop zone */}
              {converter.files.length === 0 && (
                <DropZone
                  onFilesAdded={handleAddFiles}
                  disabled={converter.converting}
                  fileCount={0}
                  maxFiles={tier.maxImages}
                />
              )}

              {/* Has files — progress + unified grid */}
              {converter.files.length > 0 && (
                <>
                  {/* Progress / Summary */}
                  <ImageGrid
                    files={converter.files}
                    results={converter.results}
                    converting={converter.converting}
                    progress={converter.progress}
                  />

                  {/* Unified grid: compact DropZone + cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {/* DropZone always first */}
                    <DropZone
                      onFilesAdded={handleAddFiles}
                      disabled={converter.converting}
                      fileCount={converter.files.length}
                      maxFiles={tier.maxImages}
                    />

                    {/* File cards or Result cards */}
                    {converter.results.length > 0
                      ? converter.results.map((result, i) => (
                          <ResultCard
                            key={`r-${i}`}
                            result={result}
                            t={t}
                            onRemove={() => converter.removeResult(i)}
                          />
                        ))
                      : converter.files.map((file, i) => (
                          <FileCard
                            key={`f-${file.name}-${i}`}
                            file={file}
                            index={i}
                            onRemove={() => converter.removeFile(i)}
                          />
                        ))
                    }
                  </div>

                  {/* Bottom Ad - shown only for free users */}
                  {showAds && converter.results.length > 0 && (
                    <BottomAd showAds={showAds} />
                  )}
                </>
              )}

              {/* Compression Settings */}
              {converter.files.length > 0 && (
                <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/40 p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-emerald-600" />
                    {t('tool.settings.title')}
                  </h3>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      {t('tool.settings.mode')}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['standard', 'lossy', 'lossless', 'custom'].map((mode) => {
                        const isActive = converter.compressionMode === mode;
                        const isLocked = !tier.compressionModes.includes(mode);
                        return (
                          <button
                            key={mode}
                            onClick={() => {
                              if (isLocked) { handleLockedClick(mode); return; }
                              converter.setCompressionMode(mode);
                            }}
                            className={`
                              px-3 py-1.5 text-sm rounded-lg border font-medium transition-all flex items-center gap-1.5
                              ${isActive
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200'
                                : isLocked
                                  ? 'bg-amber-50/60 text-amber-600 border-amber-300 border-dashed hover:bg-amber-100'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
                              }
                            `}
                          >
                            {isLocked && <Lock className="w-3.5 h-3.5" />}
                            {t(`tool.settings.${mode}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quality Controls */}
                  <div className="relative">
                    <div
                      className={`rounded-xl border p-3 transition-all ${
                        converter.compressionMode === 'custom'
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-gray-100 bg-white'
                      } ${!tier.compressionModes.includes('custom') ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">
                        {t('tool.settings.quality')}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={converter.quality}
                          onChange={(e) => {
                            const v = Math.max(1, Math.min(100, Number(e.target.value) || 1));
                            converter.setQuality(v);
                            if (converter.compressionMode !== 'custom') converter.setCompressionMode('custom');
                          }}
                          className="w-14 text-center text-sm font-bold text-emerald-700 border border-emerald-200 rounded-lg px-1.5 py-0.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                        <span className="text-xs font-medium text-gray-500">%</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={converter.quality}
                      onChange={(e) => {
                        converter.setQuality(Number(e.target.value));
                        if (converter.compressionMode !== 'custom') converter.setCompressionMode('custom');
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />

                    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 px-0.5">
                      <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        { label: 'Low', value: 40 },
                        { label: 'Medium', value: 65 },
                        { label: 'High', value: 85 },
                        { label: 'Max', value: 100 },
                      ].map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => {
                            converter.setQuality(preset.value);
                            converter.setCompressionMode('custom');
                          }}
                          className={`
                            px-2.5 py-0.5 text-xs rounded-md border transition-colors
                            ${converter.quality === preset.value && converter.compressionMode === 'custom'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300'
                            }
                          `}
                        >
                          {preset.label} <span className="opacity-60">{preset.value}%</span>
                        </button>
                      ))}
                    </div>
                  </div>

                    {!tier.compressionModes.includes('custom') && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-[1px]">
                        <button
                          onClick={() => handleLockedClick('custom')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          {t('tool.limits.lockedFeature', { tier: 'Personal' })}
                        </button>
                      </div>
                    )}
                  </div>

                  {converter.compressionMode !== 'custom' && (
                    <p className="text-xs text-gray-400 mt-2">
                      {converter.compressionMode === 'standard' && `${t('tool.settings.standard')} — 82% quality`}
                      {converter.compressionMode === 'lossy' && `${t('tool.settings.lossy')} — 65% quality`}
                      {converter.compressionMode === 'lossless' && `${t('tool.settings.lossless')} — 100% quality`}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {converter.files.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <button
                    onClick={converter.convert}
                    disabled={converter.converting || converter.files.length === 0}
                    className="btn-primary flex-1"
                  >
                    {converter.converting ? t('tool.actions.converting') : t('tool.actions.convert')}
                  </button>

                  {converter.results.length > 0 && tier.hasZipDownload && (
                    <button onClick={handleDownloadZip} className="btn-secondary">
                      <DownloadCloud className="w-4 h-4 mr-2" />
                      {t('tool.actions.downloadAll')}
                    </button>
                  )}

                  {converter.results.length > 0 && !tier.hasZipDownload && (
                    <button
                      onClick={() => handleLockedClick('zip')}
                      className="btn-secondary border-dashed border-amber-400 text-amber-600 hover:bg-amber-50"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {t('tool.limits.upgradeZip')}
                    </button>
                  )}

                  <button
                    onClick={converter.clearAll}
                    className="btn-secondary text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
                  >
                    {t('tool.actions.clearAll')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Features + Sidebar Ad (sticky) */}
        <aside className="lg:w-[320px] xl:w-[360px] shrink-0 lg:sticky lg:top-14 lg:self-start p-5 lg:p-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            {t('features.title')}
          </h2>
          <div className="flex flex-col gap-2.5">
            {features.map(({ icon: Icon, key, color }) => (
              <div
                key={key}
                className="flex items-start gap-3 py-2.5"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 leading-tight">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {t(`features.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Ad - shown only for free users */}
          {showAds && <SidebarAd showAds={showAds} />}
        </aside>
      </main>

      {/* ===== FOOTER ===== */}
      <Footer onOpenPricing={openPricing} />

      {/* ===== PRICING MODAL ===== */}
      <PricingModal
        open={showPricing}
        onClose={closePricing}
        currentTier={tierKey}
        onUpgrade={handleUpgrade}
        userEmail={auth.user?.email}
      />

      {/* ===== AUTH MODAL ===== */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={async (email, password) => {
          await auth.login(email, password);
          setShowAuthModal(false);
        }}
        onRegister={async (email, password) => {
          await auth.register(email, password);
          setShowAuthModal(false);
        }}
      />

      {/* ===== UPGRADE MODAL ===== */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          openPricing();
        }}
        onViewPlans={() => {
          setShowUpgradeModal(false);
          navigate('/pricing');
        }}
        feature={upgradeFeature}
        userEmail={auth.user?.email}
      />
    </div>
  );
}

/* ──────────────────── APP (ROUTER) ──────────────────── */
export default function App() {
  const [showPricing, setShowPricing] = useState(false);
  const auth = useAuth();
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname + location.hash);
  }, [location]);

  const openPricing = useCallback(() => setShowPricing(true), []);
  const closePricing = useCallback(() => setShowPricing(false), []);

  const handleUpgrade = useCallback((newTier) => {
    // In production, this triggers PayPal flow
    console.log('Upgrade to:', newTier);
  }, []);

  // Determine if ads should be shown (only for free users)
  const showAds = auth.showAds;
  const tierKey = auth.tier || 'free';

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            openPricing={openPricing}
            showPricing={showPricing}
            closePricing={closePricing}
            handleUpgrade={handleUpgrade}
            auth={auth}
            showAds={showAds}
          />
        }
      />
      <Route
        path="/pricing"
        element={
          <PricingPage
            onOpenPricing={(tier) => {
              if (!auth.isAuthenticated) {
                window.location.hash = '/?auth=login';
              } else {
                console.log('Subscribe to:', tier);
              }
            }}
            isAuthenticated={auth.isAuthenticated}
            currentTier={tierKey}
            userEmail={auth.user?.email}
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          auth.isAuthenticated ? (
            <DashboardPage
              user={auth.user}
              tier={tierKey}
              subscription={auth.subscription}
              onLogout={auth.logout}
              onChangePassword={auth.changePassword}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/admin"
        element={
          auth.isAdmin ? (
            <AdminPage
              getAllUsers={auth.getAllUsers}
              onLogout={auth.logout}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="/privacy" element={<LegalPage {...privacyPolicy} />} />
      <Route path="/terms" element={<LegalPage {...termsOfService} />} />
      <Route path="/cookies" element={<LegalPage {...cookiePolicy} />} />
      <Route path="/refund" element={<LegalPage {...refundPolicy} />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
