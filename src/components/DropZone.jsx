import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Upload, Image as ImageIcon, Lock } from 'lucide-react';

export default function DropZone({ onFilesAdded, disabled, fileCount, maxFiles }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const files = e.dataTransfer.files;
      if (files.length > 0) onFilesAdded(files);
    },
    [onFilesAdded, disabled],
  );

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleInputChange = (e) => {
    if (e.target.files?.length > 0) {
      onFilesAdded(e.target.files);
      e.target.value = '';
    }
  };

  const isAtLimit = fileCount >= maxFiles;
  const maxLabel = maxFiles === Infinity ? '∞' : maxFiles;
  const isCompact = fileCount > 0;

  const sharedInput = (
    <input
      ref={inputRef}
      type="file"
      multiple
      accept="image/png,image/jpeg,image/gif,image/webp"
      onChange={handleInputChange}
      className="hidden"
    />
  );

  // ===== COMPACT MODE — small square, sits in image grid =====
  if (isCompact) {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1
          cursor-pointer transition-all duration-200
          ${isDragOver
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'
          }
          ${disabled || isAtLimit ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {sharedInput}
        <Plus className={`w-6 h-6 ${isDragOver ? 'text-emerald-600' : 'text-gray-400'}`} />
        <span className="text-[10px] text-gray-400 text-center px-1 leading-tight">
          {isAtLimit
            ? `${fileCount}/${maxLabel}`
            : t('tool.dropzone.addMore')
          }
        </span>
      </div>
    );
  }

  // ===== FULL MODE — large drop zone =====
  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        relative border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-all duration-200
        ${isDragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}
        ${disabled || isAtLimit ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {sharedInput}

      <div className="flex flex-col items-center gap-2.5">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-emerald-100' : 'bg-gray-100'
          }`}
        >
          {isDragOver ? (
            <ImageIcon className="w-5 h-5 text-emerald-600" />
          ) : (
            <Upload className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <div>
          <p className="text-base font-semibold text-gray-800">
            {t('tool.dropzone.title')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t('tool.dropzone.subtitle')}
          </p>
        </div>

        <p className="text-xs text-gray-400">{t('tool.dropzone.formats')}</p>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="badge bg-gray-100 text-gray-600">
            {t('tool.imageCount', { count: fileCount, max: maxLabel })}
          </span>
          {isAtLimit && (
            <span className="flex items-center gap-1 text-amber-600">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-xs">
                {t('tool.limits.freeMax', { max: maxLabel })}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
