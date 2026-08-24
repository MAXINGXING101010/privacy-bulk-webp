import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Zap, Lock, Check, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const howItWorksSteps = [
    { step: '1', title: t('about.howItWorks.step1Title'), desc: t('about.howItWorks.step1Desc') },
    { step: '2', title: t('about.howItWorks.step2Title'), desc: t('about.howItWorks.step2Desc') },
    { step: '3', title: t('about.howItWorks.step3Title'), desc: t('about.howItWorks.step3Desc') },
    { step: '4', title: t('about.howItWorks.step4Title'), desc: t('about.howItWorks.step4Desc') },
  ];

  const whyChooseUs = [
    { icon: Lock, title: t('about.why.privacyTitle'), desc: t('about.why.privacyDesc') },
    { icon: Zap, title: t('about.why.fastTitle'), desc: t('about.why.fastDesc') },
    { icon: Check, title: t('about.why.flexibleTitle'), desc: t('about.why.flexibleDesc') },
    { icon: Shield, title: t('about.why.noRegTitle'), desc: t('about.why.noRegDesc') },
    { icon: Check, title: t('about.why.crossTitle'), desc: t('about.why.crossDesc') },
  ];

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

        {/* Hero */}
        <section className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 mb-5">
            <Shield className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
            {t('about.title')}
          </h1>
          <p className="text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            {t('about.tagline')}
          </p>
        </section>

        {/* Our Mission */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            {t('about.mission.title')}
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {t('about.mission.p1')}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {t('about.mission.p2')}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {t('about.mission.p3')}
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            {t('about.howItWorks.title')}
          </h2>
          <div className="space-y-4">
            {howItWorksSteps.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-emerald-700 font-medium bg-emerald-50 rounded-lg px-4 py-3 text-center">
            {t('about.howItWorks.localNote')}
          </p>
        </section>

        {/* Why Choose Us */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            {t('about.why.title')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {whyChooseUs.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="rounded-xl border border-gray-100 p-4 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Technology */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            {t('about.tech.title')}
          </h2>
          <ul className="space-y-2.5">
            {[
              t('about.tech.item1'),
              t('about.tech.item2'),
              t('about.tech.item3'),
              t('about.tech.item4'),
              t('about.tech.item5'),
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Contact Us */}
        <section className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-600" />
            {t('about.contact.title')}
          </h2>
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 text-center">
            <p className="text-sm text-gray-600 mb-3">{t('about.contact.desc')}</p>
            <a
              href="mailto:contact@privacybulkwebp.com"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              contact@privacybulkwebp.com
            </a>
          </div>
        </section>
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
