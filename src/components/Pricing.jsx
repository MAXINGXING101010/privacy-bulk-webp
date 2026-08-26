import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Star, ArrowUpCircle } from 'lucide-react';
import { TIER_CONFIG } from '../utils/tierConfig';

export default function PricingModal({ open, onClose, currentTier, onUpgrade, userEmail }) {
  const { t } = useTranslation();

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const plans = [
    { key: 'free', highlight: false },
    { key: 'personal', highlight: true },
    { key: 'pro', highlight: false },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('pricing.title')}
            </h2>
            <p className="text-sm text-gray-500">{t('pricing.subtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = currentTier === plan.key;
              const tk = `pricing.${plan.key}`;

              return (
                <div
                  key={plan.key}
                  className={`
                    relative rounded-2xl border-2 p-6 flex flex-col
                    ${plan.highlight
                      ? 'border-emerald-500 bg-white shadow-lg shadow-emerald-100'
                      : 'border-gray-200 bg-white'
                    }
                  `}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-emerald-600 text-white rounded-full">
                        <Star className="w-3.5 h-3.5" />
                        {t('pricing.popular')}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {t(`${tk}.name`)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {t(`${tk}.description`)}
                    </p>
                  </div>

                  <div className="mb-5">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {t(`${tk}.price`)}
                    </span>
                    <span className="text-gray-500 ml-1 text-sm">
                      {t(`${tk}.period`)}
                    </span>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {(t(`${tk}.features`, { returnObjects: true }) || []).map(
                      (feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ),
                    )}
                  </ul>

                  {isCurrent ? (
                    <button className="btn-secondary w-full" disabled>
                      {t('pricing.currentPlan')}
                    </button>
                  ) : plan.key === 'free' ? (
                    <button
                      className="btn-secondary w-full"
                      onClick={() => {
                        onUpgrade?.(plan.key);
                        onClose();
                      }}
                    >
                      {t('pricing.free.cta')}
                    </button>
                  ) : (
                    <button
                      className={plan.highlight ? 'btn-primary w-full' : 'btn-secondary w-full'}
                      onClick={() => {
                        const tier = TIER_CONFIG[plan.key];
                        if (tier?.checkoutUrl) {
                          const url = userEmail
                            ? `${tier.checkoutUrl}?checkout[email]=${encodeURIComponent(userEmail)}`
                            : tier.checkoutUrl;
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }
                        onClose();
                      }}
                    >
                      <ArrowUpCircle className="w-4 h-4 mr-2" />
                      {t(`${tk}.cta`)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
