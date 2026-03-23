import { useEffect, useState } from 'react';
import axios from 'axios';
import LoginPage from './LoginPage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API = `${API_BASE_URL}/api`;

// ─── Types ───────────────────────────────────────────────────────────────────

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
  isAdmin: boolean;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  departmentId: number;
}

interface Department {
  id: number;
  name: string;
  location: string;
}

// ─── ConfirmDeleteModal ───────────────────────────────────────────────────────

function ConfirmDeleteModal({ label, onConfirm, onCancel }: {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">Confirmar Remoção</h3>
        <p className="text-sm text-slate-500 text-center">{label}</p>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Apagar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ user, activeTab, onTabChange, onLogout }: {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}) {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <nav className="w-full bg-white border-b border-slate-200 shadow-sm px-6 md:px-12 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold text-slate-900">SafeVault</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('inventory')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'inventory'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
          >
            Inventário
          </button>
          {user.isAdmin && (
            <button
              onClick={() => onTabChange('employees')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'employees'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
            >
              Colaboradores
              <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold">
                Admin
              </span>
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user.isAdmin && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            Admin
          </span>
        )}
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

// ─── InventoryTab ─────────────────────────────────────────────────────────────

function InventoryTab() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ model: '', category: '', serialNumber: '', value: '' });
  const [error, setError] = useState('');

  const fetchAssets = () => {
    axios.get(`${API}/assets`, { withCredentials: true })
      .then(res => setAssets(res.data))
      .catch(() => setError('Erro ao carregar equipamentos.'));
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API}/assets`, {
        model: formData.model,
        category: formData.category,
        serialNumber: formData.serialNumber,
        value: parseFloat(formData.value),
        purchaseDate: new Date().toISOString(),
      }, { withCredentials: true });
      setFormData({ model: '', category: '', serialNumber: '', value: '' });
      fetchAssets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao adicionar equipamento.');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (confirmDeleteId === null) return;
    try {
      await axios.delete(`${API}/assets/${confirmDeleteId}`, { withCredentials: true });
      setAssets(assets.filter(a => a.id !== confirmDeleteId));
    } catch {
      setError('Erro ao apagar equipamento.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      {confirmDeleteId !== null && (
        <ConfirmDeleteModal
          label="Tem a certeza que quer apagar este equipamento?"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Inventário</h1>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 mb-12 max-w-2xl"
      >
        <h2 className="text-xl font-semibold text-blue-600 mb-6">Adicionar Novo Equipamento</h2>
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
        )}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Modelo" value={formData.model} required
              onChange={e => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            <input type="text" placeholder="Categoria (ex: Laptops)" value={formData.category} required
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Número de Série" value={formData.serialNumber} required
              onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-400">€</span>
              <input type="number" placeholder="Valor" value={formData.value} required
                onChange={e => setFormData({ ...formData, value: e.target.value })}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>
          <button type="submit"
            className="mt-2 w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
            Adicionar Ativo
          </button>
        </div>
      </form>

      {/* Lista */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Equipamentos Registados</h2>
      {assets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500">Nenhum equipamento encontrado no inventário.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assets.map(asset => (
            <div key={asset.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between">
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
              <button onClick={() => setConfirmDeleteId(asset.id)}
                className="mt-6 w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors flex justify-center items-center gap-2">
                Apagar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── EmployeesTab (Admin only) ────────────────────────────────────────────────

function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', departmentId: ''
  });

  const fetchAll = () => {
    axios.get(`${API}/employees`, { withCredentials: true })
      .then(res => setEmployees(res.data))
      .catch(() => setError('Erro ao carregar colaboradores.'));
    // Departments endpoint — adapte se necessário
    axios.get(`${API}/departments`, { withCredentials: true })
      .then(res => setDepartments(res.data))
      .catch(() => { }); // silencia se rota ainda não existe
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API}/employees`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        departmentId: parseInt(formData.departmentId),
      }, { withCredentials: true });
      setFormData({ name: '', email: '', password: '', departmentId: '' });
      setSuccess('Colaborador criado com sucesso!');
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar colaborador.');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (confirmDeleteId === null) return;
    setError('');
    try {
      await axios.delete(`${API}/employees/${confirmDeleteId}`, { withCredentials: true });
      setEmployees(employees.filter(e => e.id !== confirmDeleteId));
      setSuccess('Colaborador removido.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao apagar colaborador.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const deptName = (id: number) =>
    departments.find(d => d.id === id)?.name ?? `Dept. #${id}`;

  return (
    <div>
      {confirmDeleteId !== null && (
        <ConfirmDeleteModal
          label="Tem a certeza que quer remover este colaborador? Os seus ativos não serão apagados."
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <div className="flex items-center  gap-3 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 ">Colaboradores</h1>
        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full border border-amber-200">
          Área Admin
        </span>
      </div>

      {/* Formulário de criação */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 mb-12 max-w-2xl"
      >
        <h2 className="text-xl font-semibold text-blue-600 mb-2">Adicionar Novo Colaborador</h2>
        <p className="text-sm text-slate-500 mb-6">
          O colaborador poderá fazer login com o email e password definidos aqui.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{success}</div>
        )}

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Nome completo
              </label>
              <input type="text" placeholder="Ex: Ana Silva" value={formData.name} required
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input type="email" placeholder="ana.silva@empresa.pt" value={formData.email} required
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Password inicial
              </label>
              <input type="password" placeholder="Mínimo 6 caracteres" value={formData.password} required minLength={6}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Departamento
              </label>
              {departments.length > 0 ? (
                <select value={formData.departmentId} required
                  onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                  <option value="">Selecionar departamento...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              ) : (
                <input type="number" placeholder="ID do departamento" value={formData.departmentId} required min={1}
                  onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              )}
            </div>
          </div>

          <button type="submit"
            className="mt-2 w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
            Adicionar Colaborador
          </button>
        </div>
      </form>

      {/* Lista de colaboradores */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Colaboradores Registados
        <span className="ml-3 text-base font-normal text-slate-400">({employees.length})</span>
      </h2>

      {employees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500">Nenhum colaborador encontrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Nome</th>
                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Departamento</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      {emp.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{emp.email}</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-full text-xs font-medium">
                      {deptName(emp.departmentId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setConfirmDeleteId(emp.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'employees'>('inventory');

  const fetchUser = () => {
    axios.get(`${API}/auth/me`, { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  };

  useEffect(() => { fetchUser(); }, []);

  const handleLogout = async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    setUser(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400">A carregar...</p>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={fetchUser} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onLogout={handleLogout}
      />
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'employees' && user.isAdmin && <EmployeesTab />}
        {activeTab === 'employees' && !user.isAdmin && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">Não tens permissão para aceder a esta área.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
