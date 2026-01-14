import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Room } from '../types';
import { Plus, Users, Clock, ChevronRight, Loader2, Globe, Lock } from 'lucide-react';

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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Planning Poker</h1>
        <p className="text-slate-400 mt-1">
          Create or join a room to start estimating with your team
        </p>
      </div>

      {/* Quick join */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Join a Room</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const slug = formData.get('slug') as string;
            if (slug) {
              window.location.href = `/poker/${slug}`;
            }
          }}
          className="flex gap-3"
        >
          <input
            name="slug"
            type="text"
            placeholder="Enter room code or URL..."
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Join
          </button>
        </form>
      </div>

      {/* Your Rooms list */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-slate-400" />
          <h2 className="text-xl font-semibold text-white">Your Rooms</h2>
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
                className="block bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-primary-500 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white group-hover:text-primary-400 transition-colors">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(room.createdAt)}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
                        {room.deckType}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-primary-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-800/50 rounded-xl border border-slate-700">
            <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-300">No rooms yet</h3>
            <p className="text-slate-500 mt-1">
              Create your first room to start planning with your team
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Room
            </Link>
          </div>
        )}
      </div>

      {/* Public Rooms list */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-green-400" />
          <h2 className="text-xl font-semibold text-white">Public Rooms</h2>
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
                className="block bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-green-500 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white group-hover:text-green-400 transition-colors">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {room._count.participants} participants
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(room.createdAt)}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
                        {room.deckType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      by {room.moderator.displayName}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-green-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-800/50 rounded-xl border border-slate-700">
            <Globe className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-300">No public rooms</h3>
            <p className="text-slate-500 mt-1">
              Be the first to create a public room for everyone to join
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
