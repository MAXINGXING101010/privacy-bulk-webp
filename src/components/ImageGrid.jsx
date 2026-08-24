import { useTranslation } from 'react-i18next';
import { Download, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { downloadSingle } from '../utils/imageConverter';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * ImageGrid — renders progress bar + summary.
 * Cards are rendered externally via FileCard / ResultCard exports
 * so they can share a grid with DropZone.
 */
export default function ImageGrid({
  files,
  results,
  converting,
  progress,
}) {
  const { t } = useTranslation();
  const hasResults = results.length > 0;

  if (files.length === 0 && !converting) return null;

  return (
    <>
      {/* Progress bar */}
      {converting && (
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              {t('tool.status.processing', {
                current: progress.current,
                total: progress.total,
              })}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Results summary */}
      {hasResults && !converting && (
        <div className="card bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">
              {t('tool.status.complete', { count: results.filter((r) => !r.error).length })}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

/** Exported card components for use in the shared grid */

export function FileCard({ file, index, onRemove }) {
  const previewUrl = URL.createObjectURL(file);
  return (
    <div className="card group relative overflow-hidden transition-all duration-200">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-red-50 hover:shadow transition-all z-10"
      >
        <X className="w-4 h-4 text-red-500" />
      </button>
      <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
        <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
      </div>
      <p className="text-sm text-gray-700 truncate">{file.name}</p>
      <p className="text-xs text-gray-400 mt-1">{formatSize(file.size)}</p>
    </div>
  );
}

export function ResultCard({ result, t, onRemove }) {
  if (result.error) {
    return (
      <div className="card border-red-200 bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{result.originalName} — {t('tool.status.error')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card group relative overflow-hidden transition-all duration-200">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-red-50 hover:shadow transition-all z-10"
      >
        <X className="w-4 h-4 text-red-500" />
      </button>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative">
          <img
            src={result.originalPreview}
            alt="original"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
            {t('tool.grid.original')}
          </span>
        </div>
        <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative">
          <img
            src={result.convertedPreview}
            alt="converted"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1 left-1 text-[10px] bg-emerald-600/80 text-white px-1.5 py-0.5 rounded">
            WebP
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm text-gray-700 truncate">{result.originalName}.webp</p>
        <p className="text-xs text-gray-500">
          {formatSize(result.originalSize)} → {formatSize(result.convertedSize)}
        </p>
        <button
          onClick={() => downloadSingle(result)}
          className="btn-primary btn-sm w-full mt-2"
        >
          <Download className="w-4 h-4 mr-1.5" />
          {t('tool.grid.download')}
        </button>
      </div>
    </div>
  );
}
