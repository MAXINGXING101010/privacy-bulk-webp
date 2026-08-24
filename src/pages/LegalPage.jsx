import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Reusable legal document page.
 * Accepts: title, lastUpdated, sections (array of { heading, paragraphs, list })
 */
export default function LegalPage({ title, lastUpdated, sections }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Defensive: ensure sections is an array
  const safeSections = Array.isArray(sections) ? sections : [];
  const safeTitle = title || 'Legal Document';
  const safeLastUpdated = lastUpdated || '';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          {safeTitle}
        </h1>
        {safeLastUpdated && (
          <p className="text-sm text-gray-500 mb-8">
            {safeLastUpdated}
          </p>
        )}

        {/* Sections */}
        <div className="space-y-8">
          {safeSections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs && section.paragraphs.map((para, j) => (
                <p key={j} className="text-sm text-gray-700 leading-relaxed mb-3">
                  {para}
                </p>
              ))}
              {section.list && (
                <ul className="list-disc pl-5 space-y-1.5 mb-3">
                  {section.list.map((item, k) => (
                    <li key={k} className="text-sm text-gray-700 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
