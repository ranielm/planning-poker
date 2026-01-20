import { Coffee } from 'lucide-react';
import { clsx } from 'clsx';

interface BrbToggleProps {
    isBrb: boolean;
    onToggle: (isBrb: boolean) => void;
    disabled?: boolean;
}

export default function BrbToggle({ isBrb, onToggle, disabled = false }: BrbToggleProps) {
    return (
        <button
            onClick={() => onToggle(!isBrb)}
            disabled={disabled}
            className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                isBrb
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
            title={isBrb ? "I'm back!" : 'Be right back'}
        >
            <Coffee className={clsx('h-4 w-4', isBrb && 'animate-pulse')} />
            <span>{isBrb ? "I'm Back" : 'BRB'}</span>
        </button>
    );
}
