import { useState, useCallback } from 'react';
import { convertBatch, cleanupResults } from '../utils/imageConverter';

export function useConverter(tier) {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [quality, setQuality] = useState(82);
  const [compressionMode, setCompressionMode] = useState('standard');
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);

  const addFiles = useCallback(
    (newFiles) => {
      const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      const valid = Array.from(newFiles).filter((f) => allowed.includes(f.type));

      setFiles((prev) => {
        const combined = [...prev, ...valid];
        // Enforce tier image limit (Infinity for pro tier)
        const maxImages = tier?.maxImages ?? 5;
        if (combined.length > maxImages) {
          return combined.slice(0, maxImages);
        }
        return combined;
      });
      setError(null);
    },
    [tier],
  );

  const removeFile = useCallback(
    (index) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [],
  );

  const removeResult = useCallback(
    (index) => {
      setResults((prev) => {
        const removed = prev[index];
        if (removed) {
          if (removed.originalPreview) URL.revokeObjectURL(removed.originalPreview);
          if (removed.convertedUrl) URL.revokeObjectURL(removed.convertedUrl);
          if (removed.convertedPreview) URL.revokeObjectURL(removed.convertedPreview);
        }
        return prev.filter((_, i) => i !== index);
      });
    },
    [],
  );

  const clearAll = useCallback(() => {
    cleanupResults(results);
    setFiles([]);
    setResults([]);
    setError(null);
  }, [results]);

  const convert = useCallback(async () => {
    if (files.length === 0) return;
    setConverting(true);
    setError(null);
    cleanupResults(results);
    setResults([]);
    setProgress({ current: 0, total: files.length });

    try {
      const res = await convertBatch(
        files,
        {
          mode: compressionMode,
          customQuality: quality,
        },
        (current, total) => setProgress({ current, total }),
      );
      setResults(res);
    } catch (err) {
      setError(err.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  }, [files, compressionMode, quality, tier, results]);

  const atLimit = files.length >= (tier?.maxImages ?? 5);

  return {
    files,
    results,
    quality,
    setQuality,
    compressionMode,
    setCompressionMode,
    converting,
    progress,
    error,
    addFiles,
    removeFile,
    removeResult,
    clearAll,
    convert,
    atLimit,
  };
}
