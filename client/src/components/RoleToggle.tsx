import { useState } from 'react';
import { Eye, User } from 'lucide-react';
import { clsx } from 'clsx';

interface RoleToggleProps {
  isObserver: boolean;
  onToggle: (saveAsDefault: boolean) => Promise<string | null>;
}

export default function RoleToggle({ isObserver, onToggle }: RoleToggleProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;

    setIsToggling(true);
    try {
      await onToggle(false);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
        isObserver
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20',
        isToggling && 'opacity-50 cursor-wait'
      )}
      title={isObserver ? 'Currently observing' : 'Currently voting'}
    >
      {isObserver ? (
        <>
          <User className="h-4 w-4" />
          <span>Switch to Voter</span>
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          <span>Switch to Observer</span>
        </>
      )}
    </button>
  );
}
