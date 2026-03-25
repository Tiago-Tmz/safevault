import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import ConfirmDeleteModal from '../ConfirmDeleteModal';
import type { Department, Employee } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API = `${API_BASE_URL}/api`;

export default function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    departmentId: '',
  });

  const fetchAll = () => {
    axios
      .get(`${API}/employees`, { withCredentials: true })
      .then((res) => setEmployees(res.data))
      .catch(() => setError('Erro ao carregar colaboradores.'));

    axios
      .get(`${API}/departments`, { withCredentials: true })
      .then((res) => setDepartments(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${API}/employees`,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          departmentId: parseInt(formData.departmentId, 10),
        },
        { withCredentials: true },
      );
      setFormData({ name: '', email: '', password: '', departmentId: '' });
      setSuccess('Colaborador criado com sucesso!');
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar colaborador.');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (confirmDeleteId === null) {
      return;
    }

    setError('');
    try {
      await axios.delete(`${API}/employees/${confirmDeleteId}`, { withCredentials: true });
      setEmployees(employees.filter((e) => e.id !== confirmDeleteId));
      setSuccess('Colaborador removido.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao apagar colaborador.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const deptName = (id: number) => departments.find((d) => d.id === id)?.name ?? `Dept. #${id}`;

  return (
    <div>
      {confirmDeleteId !== null && (
        <ConfirmDeleteModal
          label="Tem a certeza que quer remover este colaborador? Os seus ativos não serão apagados."
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Colaboradores</h1>
      </div>

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
              <input
                type="text"
                placeholder="Ex: Ana Silva"
                value={formData.name}
                required
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                placeholder="ana.silva@empresa.pt"
                value={formData.email}
                required
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Password inicial
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                required
                minLength={6}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Departamento
              </label>
              {departments.length > 0 ? (
                <select
                  value={formData.departmentId}
                  required
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Selecionar departamento...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  placeholder="ID do departamento"
                  value={formData.departmentId}
                  required
                  min={1}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Adicionar Colaborador
          </button>
        </div>
      </form>

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
                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">
                  Departamento
                </th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {emp.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      {emp.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{emp.email}</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-full text-xs font-medium">{deptName(emp.departmentId)}</span>
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
