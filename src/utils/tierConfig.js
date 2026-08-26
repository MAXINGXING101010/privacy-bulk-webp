export const TIER_CONFIG = {
  free: {
    name: 'Free',
    maxImages: 5,
    compressionModes: ['standard'],
    hasZipDownload: false,
    hasBatchRename: false,
    maxFileSizeMB: 10,
    price: 0,
    priceLabel: '$0',
    period: '',
  },
  personal: {
    name: 'Personal',
    maxImages: 50,
    compressionModes: ['standard', 'lossy', 'lossless', 'custom'],
    hasZipDownload: true,
    hasBatchRename: false,
    maxFileSizeMB: 50,
    price: 5.99,
    priceLabel: '$5.99',
    period: '/mo',
    checkoutUrl: 'https://pbwebp.lemonsqueezy.com/checkout/buy/f0113c8c-1abe-4a2b-86ef-7c0645dad443?checkout[locale]=en',
  },
  pro: {
    name: 'Pro',
    maxImages: Infinity,
    compressionModes: ['standard', 'lossy', 'lossless', 'custom'],
    hasZipDownload: true,
    hasBatchRename: true,
    maxFileSizeMB: 200,
    price: 9.99,
    priceLabel: '$9.99',
    period: '/mo',
    checkoutUrl: 'https://pbwebp.lemonsqueezy.com/checkout/buy/68c7ee3d-4b08-46a9-ab08-a01543a1146b?checkout[locale]=en',
  },
};

export const PRESETS = {
  blog: { quality: 75, label: 'Blog / CMS', description: 'Fast loading for content sites' },
  hq: { quality: 95, label: 'High Quality', description: 'Maximum visual fidelity' },
};
