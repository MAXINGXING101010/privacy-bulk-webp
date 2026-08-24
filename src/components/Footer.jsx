import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Footer({ onOpenPricing }) {
  const { t } = useTranslation();

  const handleProductClick = (key) => {
    if (key === 'pricing') {
      onOpenPricing?.();
    } else if (key === 'about') {
      window.location.hash = '/about';
    } else {
      const el = document.getElementById(key === 'tool' ? 'converter' : key);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const productLinks = [
    { key: 'tool' },
    { key: 'pricing' },
    { key: 'about' },
  ];

  const legalLinks = [
    { key: 'privacyPolicy', path: '/privacy' },
    { key: 'terms', path: '/terms' },
    { key: 'cookiePolicy', path: '/cookies' },
    { key: 'refundPolicy', path: '/refund' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-white">{t('brand')}</span>
            </div>
            <p className="text-xs leading-relaxed">{t('footer.description')}</p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">
              {t('footer.product')}
            </h4>
            <ul className="space-y-1.5">
              {productLinks.map((link) => (
                <li key={link.key}>
                  <button
                    onClick={() => handleProductClick(link.key)}
                    className="text-xs hover:text-emerald-400 transition-colors"
                  >
                    {t(`nav.${link.key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-1.5">
              {legalLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.path}
                    className="text-xs hover:text-emerald-400 transition-colors"
                  >
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-5 text-center">
          <p className="text-xs">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
