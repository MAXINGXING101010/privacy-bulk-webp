import AdBanner from './AdBanner';

export default function SidebarAd({ showAds }) {
  if (!showAds) return null;

  return (
    <div className="my-4">
      <p className="mb-1.5 text-[10px] font-medium tracking-wide text-gray-400 uppercase">
        Advertisement
      </p>
      <AdBanner slot="sidebar-ad" format="vertical" showAds={showAds} />
    </div>
  );
}
