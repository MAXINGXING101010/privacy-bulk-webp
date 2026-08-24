import AdBanner from './AdBanner';

export default function BottomAd({ showAds }) {
  if (!showAds) return null;

  return (
    <div className="mt-6 mb-4">
      <p className="mb-1.5 text-[10px] font-medium tracking-wide text-gray-400 uppercase">
        Advertisement
      </p>
      <AdBanner slot="results-ad" format="horizontal" showAds={showAds} />
    </div>
  );
}
