import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Check, ArrowRight, X, Sparkles } from 'lucide-react';
import { TIER_CONFIG } from '../utils/tierConfig';

// Map feature keys to their upgrade translation keys and target tier
const FEATURE_INFO = {
  batch_limit: { msgKey: 'featureBatchLimit', tier: 'personal' },
  zip: { msgKey: 'featureZip', tier: 'personal' },
  lossy: { msgKey: 'featureLossy', tier: 'personal' },
  lossless: { msgKey: 'featureLossless', tier: 'personal' },
  custom: { msgKey: 'featureCustom', tier: 'personal' },
  rename: { msgKey: 'featureRename', tier: 'pro' },
  premium: { msgKey: 'featurePremium', tier: 'personal' },
};

// Features included in Personal plan
const PERSONAL_PERKS = [
  'pricing.personal.features.0', // Up to 50 images per batch
  'pricing.personal.features.1', // Lossy & lossless compression
  'pricing.personal.features.2', // ZIP batch download
  'pricing.personal.features.3', // Custom quality settings
  'pricing.personal.features.4', // Ad-free experience
];

export default function UpgradeModal({
  open,
  onClose,
  onUpgrade,
  feature,
  onViewPlans,
  userEmail,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const info = FEATURE_INFO[feature] || FEATURE_INFO.premium;
  const isProFeature = info.tier === 'pro';

  const handlePrimaryCta = () => {
    const targetTier = isProFeature ? 'pro' : 'personal';
    const tier = TIER_CONFIG[targetTier];
    if (tier?.checkoutUrl) {
      const url = userEmail
        ? `${tier.checkoutUrl}&checkout[email]=${encodeURIComponent(userEmail)}`
        : tier.checkoutUrl;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      onUpgrade?.(targetTier);
    }
    onClose();
  };

  const handleViewPlans = () => {
    onViewPlans?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">
            {t('upgrade.title')}
          </h2>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
            {t(`upgrade.${info.msgKey}`)}
          </p>
        </div>

        {/* What you'll get */}
        <div className="px-6 pb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            {t('upgrade.includedFeatures')}
          </p>
          <ul className="space-y-2">
            {PERSONAL_PERKS.map((key, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                {t(key)}
              </li>
            ))}
          </ul>

          {isProFeature && (
            <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                {t('upgrade.featureRename')}
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-6 pt-2 pb-6 space-y-2.5">
          <button
            onClick={handlePrimaryCta}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
          >
            {isProFeature
              ? t('pricing.pro.cta')
              : t('upgrade.cta')
            }
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleViewPlans}
            className="w-full py-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors text-center"
          >
            {t('upgrade.viewAllPlans')}
          </button>
        </div>
      </div>
    </div>
  );
}
