import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, error, clearError } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess(false);
    setIsLoading(true);

    try {
      await updateProfile({ displayName, avatarUrl: avatarUrl || undefined });
      setSuccess(true);
    } catch {
      // Error is handled in store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <User className="h-10 w-10 text-slate-400" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-white">Your Profile</h1>
        <p className="text-slate-400 mt-2">
          Customize how you appear to your team
        </p>
      </div>

      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
              Profile updated successfully!
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-2">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-300 mb-2">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com/avatar.png"
            />
            <p className="text-xs text-slate-500 mt-1">
              Enter a URL to an image for your profile picture
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
