import { useState } from 'react';
import axios from 'axios';

interface Props {
  onLogin: () => void;
}

function LoginPage({ onLogin }: Props) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:4000/api/auth/login', formData, {
        withCredentials: true
      });
      onLogin();
    } catch (err) {
      setError('Email ou password incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-slate-100 p-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-3xl">📦</span>
          <span className="text-2xl font-bold text-slate-900">SafeVault</span>
        </div>

        <h2 className="text-xl font-semibold text-slate-800 mb-1">Bem-vindo</h2>
        <p className="text-sm text-slate-500 mb-6">Inicia sessão para continuar</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="exemplo@empresa.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
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