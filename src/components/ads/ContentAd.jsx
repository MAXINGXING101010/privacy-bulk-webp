import AdBanner from './AdBanner';

export default function ContentAd({ showAds }) {
  if (!showAds) return null;

  return (
    <div className="my-8">
      <AdBanner slot="content-ad" format="auto" showAds={showAds} />
    </div>
  );
}
