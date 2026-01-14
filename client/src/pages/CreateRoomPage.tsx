import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { DeckType } from '../types';
import { Loader2, Users, Globe, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from '../i18n';

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [deckType, setDeckType] = useState<DeckType>('FIBONACCI');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post<{ slug: string }>('/rooms', {
        name,
        deckType,
        isPublic,
      });
      navigate(`/poker/${response.data.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.message || t.errors.generic);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Users className="h-12 w-12 text-primary-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white">{t.createRoom.title}</h1>
        <p className="text-slate-400 mt-2">
          {t.createRoom.subtitle}
        </p>
      </div>

      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              {t.createRoom.roomName}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={100}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t.createRoom.roomNamePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              {t.createRoom.deckType}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDeckType('FIBONACCI')}
                className={clsx(
                  'p-4 rounded-lg border-2 transition-all text-left',
                  deckType === 'FIBONACCI'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                )}
              >
                <h3 className="font-medium text-white">{t.createRoom.fibonacci}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {t.createRoom.fibonacciValues}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDeckType('TSHIRT')}
                className={clsx(
                  'p-4 rounded-lg border-2 transition-all text-left',
                  deckType === 'TSHIRT'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                )}
              >
                <h3 className="font-medium text-white">{t.createRoom.tshirt}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {t.createRoom.tshirtValues}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {t.createRoom.tshirtSP}
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              {t.createRoom.roomVisibility}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={clsx(
                  'p-4 rounded-lg border-2 transition-all text-left',
                  !isPublic
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                )}
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <h3 className="font-medium text-white">{t.createRoom.private}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {t.createRoom.privateDescription}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={clsx(
                  'p-4 rounded-lg border-2 transition-all text-left',
                  isPublic
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                )}
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-slate-400" />
                  <h3 className="font-medium text-white">{t.createRoom.public}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {t.createRoom.publicDescription}
                </p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t.createRoom.creating}
              </>
            ) : (
              t.home.createRoom
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
