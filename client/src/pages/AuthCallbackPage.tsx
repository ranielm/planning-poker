import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setToken(token).then(() => {
        navigate('/');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, setToken, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
}
