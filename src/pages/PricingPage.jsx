import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Shield,
  Check,
  X,
  Star,
  ChevronDown,
} from 'lucide-react';

/* ──────────────────── PRICING DATA ──────────────────── */

const PRICES = { personal: 5.99, pro: 9.99 };

/** Static feature rows for the comparison table. */
const COMPARISON_FEATURES = [
  { key: 'batchLimit',       free: '5',          personal: '50',          pro: 'unlimited' },
  { key: 'compressionModes', free: 'standardOnly', personal: 'lossyLossless', pro: 'allModes' },
  { key: 'zipDownload',      free: false,         personal: true,         pro: true },
  { key: 'customQuality',    free: false,         personal: true,         pro: true },
  { key: 'adFree',           free: false,         personal: true,         pro: true },
  { key: 'batchRename',      free: false,         personal: false,        pro: true },
  { key: 'prioritySupport',  free: false,         personal: false,        pro: true },
];

/* ──────────────────── COMPONENT ──────────────────── */

export default function PricingPage({ onOpenPricing, isAuthenticated, currentTier }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ---- helpers ---- */

  const getPrice = (tierKey) => {
    return PRICES[tierKey] ?? 0;
  };

  const formatPrice = (tierKey) => {
    const price = getPrice(tierKey);
    return `$${price.toFixed(2)}`;
  };

  const handleSubscribe = (tierKey) => {
    if (!isAuthenticated) {
      // Show a lightweight inline prompt — could be replaced with a toast/modal
      alert(t('pricing.loginPrompt'));
      return;
    }
    if (onOpenPricing) {
      onOpenPricing(tierKey);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  /* ---- render cell value for comparison table ---- */

  const renderCellValue = (value) => {
    if (value === true) {
      return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
    }
    if (value === false) {
      return <X className="w-5 h-5 text-gray-300 mx-auto" />;
    }
    if (value === 'unlimited') {
      return <span className="text-sm font-semibold text-gray-900">{t('pricing.compare.unlimited')}</span>;
    }
    // Translation-key based values (standardOnly, lossyLossless, allModes, numeric)
    return <span className="text-sm font-medium text-gray-700">{t(`pricing.compare.${value}`)}</span>;
  };

  /* ──────────────── RENDER ──────────────── */

  return (
    <div className="min-h-screen bg-white">
      {/* ──── HEADER ──── */}
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
          </div>
        </div>
      </header>

      {/* ──── HERO ──── */}
      <section className="pt-16 pb-10 text-center px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          {t('pricing.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-500 mb-8">
          {t('pricing.subtitle')}
        </p>
      </section>

      {/* ──── PRICING CARDS ──── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* ── FREE ── */}
          <PricingCard
            name={t('pricing.free.name')}
            description={t('pricing.free.description')}
            price="$0"
            period={t('pricing.free.period')}
            features={[
              ...t('pricing.free.features', { returnObjects: true }),
              t('pricing.freeExtra.ads'),
            ]}
            highlight={false}
            ctaLabel={t('pricing.free.cta')}
            ctaStyle="gray"
            isCurrent={currentTier === 'free'}
            onClick={() => navigate('/')}
          />

          {/* ── PERSONAL ── */}
          <PricingCard
            name={t('pricing.personal.name')}
            description={t('pricing.personal.description')}
            price={formatPrice('personal')}
            period={t('pricing.personal.period')}
            features={[
              ...t('pricing.personal.features', { returnObjects: true }),
              t('pricing.freeExtra.allFree'),
            ]}
            highlight={true}
            ctaLabel={
              currentTier === 'personal'
                ? t('pricing.currentPlan')
                : t('pricing.personal.cta')
            }
            ctaStyle="emerald"
            isCurrent={currentTier === 'personal'}
            onClick={() => handleSubscribe('personal')}
          />

          {/* ── PRO ── */}
          <PricingCard
            name={t('pricing.pro.name')}
            description={t('pricing.pro.description')}
            price={formatPrice('pro')}
            period={t('pricing.pro.period')}
            features={[
              ...t('pricing.pro.features', { returnObjects: true }),
              t('pricing.freeExtra.allFree'),
            ]}
            highlight={false}
            ctaLabel={
              currentTier === 'pro'
                ? t('pricing.currentPlan')
                : t('pricing.pro.cta')
            }
            ctaStyle="dark"
            isCurrent={currentTier === 'pro'}
            onClick={() => handleSubscribe('pro')}
          />
        </div>
      </section>

      {/* ──── COMPARISON TABLE ──── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          {t('pricing.compare.title')}
        </h2>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 w-[40%]">
                  {t('pricing.compare.feature')}
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 w-[20%]">
                  {t('pricing.free.name')}
                </th>
                <th className="text-center py-3 px-4 font-semibold text-emerald-700 w-[20%] bg-emerald-50/40">
                  {t('pricing.personal.name')}
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 w-[20%]">
                  {t('pricing.pro.name')}
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FEATURES.map((feature, i) => (
                <tr
                  key={feature.key}
                  className={`border-b border-gray-100 ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                  }`}
                >
                  <td className="py-3 px-4 text-gray-700 font-medium">
                    {t(`pricing.compare.${feature.key}`)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {renderCellValue(feature.free)}
                  </td>
                  <td className="py-3 px-4 text-center bg-emerald-50/20">
                    {renderCellValue(feature.personal)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {renderCellValue(feature.pro)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ──── FAQ ──── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          {t('pricing.faq.title')}
        </h2>

        <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {(t('pricing.faq.items', { returnObjects: true }) || []).map((item, i) => (
            <div key={i}>
              <button
                onClick={() => toggleFaq(i)}
                className="flex items-center justify-between w-full py-4 text-left group"
              >
                <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors pr-4">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                    openFaq === i ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openFaq === i ? 'max-h-40 pb-4' : 'max-h-0'
                }`}
              >
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──── FOOTER ──── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}

/* ──────────────────── PRICING CARD SUB-COMPONENT ──────────────────── */

function PricingCard({
  name,
  description,
  price,
  period,
  features,
  highlight,
  ctaLabel,
  ctaStyle,
  isCurrent,
  onClick,
}) {
  const { t } = useTranslation();

  const buttonClasses = {
    emerald:
      'w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed',
    dark:
      'w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
    gray:
      'w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  };

  return (
    <div
      className={`
        relative rounded-2xl border-2 p-6 flex flex-col
        ${highlight
          ? 'border-emerald-500 bg-white shadow-lg shadow-emerald-100/60'
          : 'border-gray-200 bg-white'
        }
      `}
    >
      {/* Most Popular badge */}
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-emerald-600 text-white rounded-full shadow-sm">
            <Star className="w-3.5 h-3.5" />
            {t('pricing.popular')}
          </span>
        </div>
      )}

      {/* Plan name & description */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>

      {/* Price */}
      <div className="mb-5">
        <span className="text-3xl font-extrabold text-gray-900">{price}</span>
        <span className="text-gray-500 ml-1 text-sm">{period}</span>
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {(features || []).map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        className={buttonClasses[ctaStyle]}
        disabled={isCurrent}
        onClick={onClick}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
