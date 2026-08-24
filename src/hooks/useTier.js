import { useState, useCallback } from 'react';
import { TIER_CONFIG } from '../utils/tierConfig';

export function useTier() {
  const [currentTier, setCurrentTier] = useState('free');

  const tier = TIER_CONFIG[currentTier];

  const canUpgrade = currentTier !== 'pro';

  const isLocked = useCallback(
    (feature) => {
      switch (feature) {
        case 'zipDownload':
          return !tier.hasZipDownload;
        case 'batchRename':
          return !tier.hasBatchRename;
        case 'customCompression':
          return tier.compressionModes.length <= 1;
        default:
          return false;
      }
    },
    [tier],
  );

  const upgrade = useCallback((newTier) => {
    if (TIER_CONFIG[newTier]) {
      setCurrentTier(newTier);
    }
  }, []);

  return {
    tier,
    tierKey: currentTier,
    isLocked,
    canUpgrade,
    upgrade,
    tiers: TIER_CONFIG,
  };
}
