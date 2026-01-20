import { useState } from 'react';
import { Lock, Unlock, Coffee } from 'lucide-react';
import { clsx } from 'clsx';

interface SessionLockOverlayProps {
    isLocked: boolean;
    roomSlug: string;
    onUnlock: () => void;
    userName?: string;
}

export default function SessionLockOverlay({
    isLocked,
    roomSlug,
    onUnlock,
    userName = 'User'
}: SessionLockOverlayProps) {
    const [isUnlocking, setIsUnlocking] = useState(false);

    const handleUnlock = async () => {
        setIsUnlocking(true);
        try {
            await onUnlock();
        } finally {
            setIsUnlocking(false);
        }
    };

    if (!isLocked) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center">
            <div className="max-w-md w-full mx-4 text-center">
                {/* Lock icon animation */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center animate-pulse">
                        <Lock className="h-12 w-12 text-amber-400" />
                    </div>

                    {/* Coffee cup floating */}
                    <div className="absolute top-0 right-1/4 animate-bounce">
                        <Coffee className="h-8 w-8 text-amber-300/60" />
                    </div>
                </div>

                {/* Status text */}
                <h2 className="text-2xl font-bold text-white mb-2">Session Locked</h2>
                <p className="text-slate-400 mb-2">
                    Hey <span className="text-amber-400 font-medium">{userName}</span>, you're on a break!
                </p>
                <p className="text-slate-500 text-sm mb-8">
                    Your session is locked to prevent accidental voting. Other participants won't wait for you to reveal cards.
                </p>

                {/* Room info */}
                <div className="bg-slate-800/50 rounded-lg px-4 py-3 mb-8 border border-slate-700">
                    <p className="text-slate-400 text-sm">You were in room:</p>
                    <p className="text-white font-medium">{roomSlug}</p>
                </div>

                {/* Unlock button */}
                <button
                    onClick={handleUnlock}
                    disabled={isUnlocking}
                    className={clsx(
                        'w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all',
                        'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
                        'text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40',
                        isUnlocking && 'opacity-75 cursor-wait'
                    )}
                >
                    {isUnlocking ? (
                        <>
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            Returning to room...
                        </>
                    ) : (
                        <>
                            <Unlock className="h-5 w-5" />
                            I'm Back! Unlock Session
                        </>
                    )}
                </button>

                {/* Helper text */}
                <p className="text-slate-600 text-xs mt-4">
                    Click to rejoin the voting session
                </p>
            </div>
        </div>
    );
}
