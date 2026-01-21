import { useState } from 'react';
import { Eye, User, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface RoleToggleProps {
  isObserver: boolean;
  onToggle: (saveAsDefault: boolean) => Promise<string | null>;
}

export default function RoleToggle({ isObserver, onToggle }: RoleToggleProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [showSaveOption, setShowSaveOption] = useState(false);

  const handleToggle = async (saveAsDefault: boolean = false) => {
    setIsToggling(true);
    try {
      await onToggle(saveAsDefault);
      setShowSaveOption(false);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowSaveOption(true)}
        disabled={isToggling}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          isObserver
            ? 'bg-slate-600 hover:bg-slate-500 text-slate-200'
            : 'bg-blue-600 hover:bg-blue-500 text-white',
          isToggling && 'opacity-50 cursor-wait'
        )}
        title={isObserver ? 'Switch to Voter' : 'Switch to Observer'}
      >
        {isObserver ? (
          <>
            <Eye className="h-4 w-4" />
            <span>Observer</span>
          </>
        ) : (
          <>
            <User className="h-4 w-4" />
            <span>Voter</span>
          </>
        )}
      </button>

      {/* Save as default dropdown */}
      {showSaveOption && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSaveOption(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch to {isObserver ? 'Voter' : 'Observer'}
              </p>
            </div>
            <button
              onClick={() => handleToggle(false)}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
            >
              <span>Just for this session</span>
            </button>
            <button
              onClick={() => handleToggle(true)}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
            >
              <Check className="h-4 w-4 text-green-500" />
              <span>Save as my default</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
