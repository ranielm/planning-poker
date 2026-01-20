import { Coffee, Lock } from 'lucide-react';
import { useI18n } from '../i18n';

interface SessionLockOverlayProps {
    onUnlock: () => void;
}

export default function SessionLockOverlay({ onUnlock }: SessionLockOverlayProps) {
    const { t } = useI18n();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
            <div className="text-center p-8 max-w-md mx-4">
                <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="bg-slate-800 p-6 rounded-full border-2 border-primary-500 relative">
                        <Coffee className="h-12 w-12 text-primary-400" />
                        <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-2 border border-slate-700">
                            <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-3">
                    {t.session.brb.activeTitle}
                </h2>

                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                    {t.session.brb.activeSubtitle}
                </p>

                <button
                    onClick={onUnlock}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25 active:scale-95"
                >
                    {t.session.brb.resume}
                </button>
            </div>
        </div>
    );
}
