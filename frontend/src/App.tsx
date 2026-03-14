import { useEffect, useState } from 'react';
import axios from 'axios';
import LoginPage from './LoginPage';

// Define o formato do dado que vem do banco
interface Asset {
  id: number;
  category: string;
  model: string;
  serialNumber: string;
  value: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

function Navbar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <nav className="w-full bg-white border-b border-slate-200 shadow-sm px-6 md:px-12 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-slate-900">SafeVault</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
          {initials}
        </div>
        <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
        <button
          onClick={onLogout}
          className="ml-2 px-3 py-1.5 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const [formData, setFormData] = useState({
    model: '',
    category: '',
    serialNumber: '',
    value: ''
  });

  // Verifica se já há sessão ativa ao iniciar
  const fetchUser = () => {
    axios.get('http://localhost:4000/api/auth/me', { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  };

  // Faz a requisição para o Backend Node.js
  const fetchAssets = () => {
    axios.get('http://localhost:4000/api/assets', { withCredentials: true })
      .then(response => {
        setAssets(response.data);
      })
      .catch(err => {
        console.error("Erro ao buscar dados da API:", err);
      });
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Só busca assets depois de autenticado
  useEffect(() => {
    if (user) fetchAssets();
  }, [user]);

  const handleLogout = async () => {
    await axios.post('http://localhost:4000/api/auth/logout', {}, { withCredentials: true });
    setUser(null);
    setAssets([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/assets', {
        model: formData.model,
        category: formData.category,
        serialNumber: formData.serialNumber,
        value: parseFloat(formData.value),
        purchaseDate: new Date().toISOString()
      }, { withCredentials: true });
      setFormData({ model: '', category: '', serialNumber: '', value: '' });
      fetchAssets(); // Atualiza a lista após criar um novo ativo
    } catch (err) {
      console.error("Erro ao adicionar equipamento:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:4000/api/assets/${id}`, { withCredentials: true });
      setAssets(assets.filter(asset => asset.id !== id));
    } catch (err) {
      console.error("Erro ao deletar equipamento:", err);
    }
  };

  // A verificar sessão
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400">A carregar...</p>
      </div>
    );
  }

  // Não autenticado -> mostrar login
  if (!user) return <LoginPage onLogin={fetchUser} />;

  // Autenticado -> mostrar inventário
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

      {/* Cabeçalho */}
      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          Inventário
        </h1>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 mb-12 max-w-2xl"
        >
          <h2 className="text-xl font-semibold text-blue-600 mb-6">
            Adicionar Novo Equipamento
          </h2>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Modelo"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <input
                type="text"
                placeholder="Categoria (ex: Laptops)"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Número de Série"
                value={formData.serialNumber}
                onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-slate-400">€</span>
                <input
                  type="number"
                  placeholder="Valor"
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  required
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Adicionar Ativo
            </button>
          </div>
        </form>

        {/* Lista de Ativos */}
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Equipamentos Registrados</h2>

        {assets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500">Nenhum equipamento encontrado no inventário.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map(asset => (
              <div
                key={asset.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{asset.model}</h3>
                  <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full mb-4">
                    {asset.category}
                  </span>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p><strong className="text-slate-800 font-medium">S/N:</strong> <span className="font-mono text-slate-500">{asset.serialNumber}</span></p>
                    <p><strong className="text-slate-800 font-medium">Valor:</strong> € {asset.value.toFixed(2)}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(asset.id)}
                  className="mt-6 w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors flex justify-center items-center gap-2"
                >
                  Apagar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;