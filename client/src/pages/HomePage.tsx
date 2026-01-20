import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Room } from '../types';
import { Users, Clock, ChevronRight, Loader2, Globe, Lock, Plus, RefreshCw, Search } from 'lucide-react';
import { useI18n } from '../i18n';

interface PublicRoom {
  id: string;
  name: string;
  slug: string;
  deckType: string;
  createdAt: string;
  moderator: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  _count: {
    participants: number;
  };
}

export default function HomePage() {
  const { t, language } = useI18n();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPublic, setIsLoadingPublic] = useState(true);

  const fetchPublicRooms = useCallback(async () => {
    setIsLoadingPublic(true);
    try {
      const response = await api.get<PublicRoom[]>('/rooms/public', { skipAuth: true });
      setPublicRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch public rooms:', error);
    } finally {
      setIsLoadingPublic(false);
    }
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get<Room[]>('/users/rooms');
        setRooms(response.data);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
    fetchPublicRooms();
  }, [fetchPublicRooms]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t.home.title}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
          {t.home.subtitle}
        </p>
      </div>

      {/* Grid layout for all sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

        {/* Join a Room */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">{t.home.joinRoom}</h2>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Enter a room code or URL to join an existing session instantly.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                let input = (formData.get('slug') as string || '').trim();
                if (input) {
                  // Extract slug from URL if user pasted a full URL
                  const urlMatch = input.match(/\/poker\/([^/?#]+)/);
                  const slug = urlMatch ? urlMatch[1] : input;
                  window.location.href = `/poker/${slug}`;
                }
              }}
              className="flex flex-col gap-3"
            >
              <input
                name="slug"
                type="text"
                placeholder={t.home.enterRoomCode}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium"
              >
                {t.common.join}
              </button>
            </form>
          </div>
        </div>

        {/* Your Rooms */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">{t.home.yourRooms}</h2>
            </div>
            <Link
              to="/create"
              className="p-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              title={t.home.createRoom}
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              </div>
            ) : rooms.length > 0 ? (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <Link
                    key={room.id}
                    to={`/poker/${room.slug}`}
                    className="block bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-colors group shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors truncate">
                          {room.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(room.createdAt)}
                          </span>
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px]">
                            {room.deckType}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500 transition-colors shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center items-center">
                <Users className="h-10 w-10 text-slate-400 dark:text-slate-600 mb-3" />
                <h3 className="font-medium text-slate-700 dark:text-slate-300">{t.home.noRoomsYet}</h3>
                <p className="text-slate-500 mt-1 text-sm max-w-[200px] mx-auto">
                  {t.home.noRoomsDescription}
                </p>
                <Link
                  to="/create"
                  className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
                >
                  {t.home.createRoom}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Public Rooms */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500 dark:text-green-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">{t.home.publicRooms}</h2>
            </div>
            <button
              onClick={() => fetchPublicRooms()}
              disabled={isLoadingPublic}
              className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingPublic ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1">
            {isLoadingPublic ? (
              <div className="flex items-center justify-center py-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              </div>
            ) : publicRooms.length > 0 ? (
              <div className="space-y-3">
                {publicRooms.map((room) => (
                  <Link
                    key={room.id}
                    to={`/poker/${room.slug}`}
                    className="block bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-green-500 transition-colors group shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors truncate">
                          {room.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {room._count.participants}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(room.createdAt)}
                          </span>
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px]">
                            {room.deckType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          by {room.moderator.displayName}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-green-500 transition-colors shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center items-center">
                <Globe className="h-10 w-10 text-slate-400 dark:text-slate-600 mb-3" />
                <h3 className="font-medium text-slate-700 dark:text-slate-300">{t.home.noPublicRooms}</h3>
                <p className="text-slate-500 mt-1 text-sm max-w-[200px] mx-auto">
                  {t.home.noPublicRoomsDescription}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
