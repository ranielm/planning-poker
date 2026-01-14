import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';
import { useI18n } from '../i18n';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokens } = useAuthStore();
  const { t } = useI18n();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token && refreshToken) {
      setTokens(token, refreshToken).then(() => {
        navigate('/');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, setTokens, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">{t.auth.completingSignIn}</p>
      </div>
    </div>
  );
}
