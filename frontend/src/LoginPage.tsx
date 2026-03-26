import { useState } from 'react';
import axios from 'axios';

interface Props {
  onLogin: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_KEY = 'login_locked_until';
const ATTEMPTS_KEY = 'login_attempts';

type AttemptsState = {
  count: number;
  updatedAt: number;
};

const readAttemptsState = (): AttemptsState => {
  const stored = localStorage.getItem(ATTEMPTS_KEY);
  if (!stored) return { count: 0, updatedAt: 0 };

  try {
    const parsed = JSON.parse(stored) as AttemptsState;
    const isExpired = Date.now() - parsed.updatedAt > ATTEMPT_WINDOW_MS;
    if (!parsed.count || isExpired) {
      localStorage.removeItem(ATTEMPTS_KEY);
      return { count: 0, updatedAt: 0 };
    }
    return parsed;
  } catch {
    localStorage.removeItem(ATTEMPTS_KEY);
    return { count: 0, updatedAt: 0 };
  }
};

const writeAttemptsState = (state: AttemptsState) => {
  if (state.count <= 0) {
    localStorage.removeItem(ATTEMPTS_KEY);
    return;
  }
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(state));
};

function LoginPage({ onLogin }: Props) {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const [error, setError] = useState<string>(() => {
  const stored = localStorage.getItem(LOCKOUT_KEY);
  if (!stored) return '';
  const until = parseInt(stored);
  if (Date.now() >= until) return '';
  const seconds = Math.ceil((until - Date.now()) / 1000);
  return `Demasiadas tentativas. Tenta novamente em ${seconds}s.`;
});

  const [loading, setLoading] = useState(false);

  const [attempts, setAttempts] = useState<number>(() => {
    return readAttemptsState().count;
  });

  const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
    const stored = localStorage.getItem(LOCKOUT_KEY);
    return stored ? parseInt(stored) : null;
  });

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const lock = () => {
    const until = Date.now() + LOCKOUT_MS;
    setLockedUntil(until);
    localStorage.setItem(LOCKOUT_KEY, String(until));
  };

  const unlock = () => {
    setLockedUntil(null);
    setAttempts(0);
    localStorage.removeItem(LOCKOUT_KEY);
    writeAttemptsState({ count: 0, updatedAt: 0 });
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      const seconds = Math.ceil((lockedUntil! - Date.now()) / 1000);
      setError(`Demasiadas tentativas. Tenta novamente em ${seconds}s.`);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Formato de email inválido.');
      return;
    }

    if (formData.password.length < 3) {
      setError('Password demasiado curta.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/api/auth/login`, formData, {
        timeout: 5000,
        withCredentials: true,
      });

      unlock();
      onLogin();
    } catch {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      writeAttemptsState({ count: newAttempts, updatedAt: Date.now() });

      if (newAttempts >= MAX_ATTEMPTS) {
        lock();
        setError(`Conta bloqueada por 30 segundos após ${MAX_ATTEMPTS} tentativas falhadas.`);
      } else {
        setError(`Email ou password incorretos. (${newAttempts}/${MAX_ATTEMPTS} tentativas)`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <img src="/logo.png" alt="SafeVault logo" className="h-8 w-8 object-contain" />
        <span className="text-2xl font-bold text-slate-900">SafeVault</span>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-slate-100 p-8">

        <h2 className="text-xl font-semibold text-slate-800 mb-1">Bem-vindo</h2>
        <p className="text-sm text-slate-500 mb-6">Inicia sessão para continuar</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="exemplo@empresa.com"
              value={formData.email}
              onChange={handleChange('email')}
              disabled={isLocked || loading}
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange('password')}
              disabled={isLocked || loading}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || isLocked}
            className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;