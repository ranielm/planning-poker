import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Room } from '../types';
import { Users, Clock, ChevronRight, Loader2, Globe, Lock, Plus } from 'lucide-react';
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

    const fetchPublicRooms = async () => {
      try {
        const response = await api.get<PublicRoom[]>('/rooms/public', { skipAuth: true });
        setPublicRooms(response.data);
      } catch (error) {
        console.error('Failed to fetch public rooms:', error);
      } finally {
        setIsLoadingPublic(false);
      }
    };

    fetchRooms();
    fetchPublicRooms();
  }, []);

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

      {/* Quick join */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.home.joinRoom}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const slug = formData.get('slug') as string;
            if (slug) {
              window.location.href = `/poker/${slug}`;
            }
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            name="slug"
            type="text"
            placeholder={t.home.enterRoomCode}
            className="flex-1 px-4 py-2.5 sm:py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="px-6 py-2.5 sm:py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors"
          >
            {t.common.join}
          </button>
        </form>
      </div>

      {/* Grid layout for desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Your Rooms list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">{t.home.yourRooms}</h2>
            </div>
            <Link
              to="/create"
              className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t.home.createRoom}</span>
            </Link>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            </div>
          ) : rooms.length > 0 ? (
            <div className="space-y-3">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/poker/${room.slug}`}
                  className="block bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors truncate">
                        {room.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {formatDate(room.createdAt)}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                          {room.deckType}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors flex-shrink-0 ml-2" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <Users className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300">{t.home.noRoomsYet}</h3>
              <p className="text-slate-500 mt-1 text-sm">
                {t.home.noRoomsDescription}
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                {t.home.createRoom}
              </Link>
            </div>
          )}
        </div>

        {/* Public Rooms list */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-green-500 dark:text-green-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">{t.home.publicRooms}</h2>
          </div>
          {isLoadingPublic ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            </div>
          ) : publicRooms.length > 0 ? (
            <div className="space-y-3">
              {publicRooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/poker/${room.slug}`}
                  className="block bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-green-500 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors truncate">
                        {room.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {room._count.participants} {t.home.participants}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {formatDate(room.createdAt)}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                          {room.deckType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {t.home.by} {room.moderator.displayName}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors flex-shrink-0 ml-2" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <Globe className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300">{t.home.noPublicRooms}</h3>
              <p className="text-slate-500 mt-1 text-sm">
                {t.home.noPublicRoomsDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
