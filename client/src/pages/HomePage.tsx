import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Room } from '../types';
import { Plus, Users, Clock, ChevronRight, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        <h1 className="text-3xl font-bold text-white">Your Rooms</h1>
        <p className="text-slate-400 mt-1">
          Create or join a room to start estimating
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

      {/* Rooms list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
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
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
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
  );
}
