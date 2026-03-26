import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import ConfirmDeleteModal from '../ConfirmDeleteModal';
import type { Department } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API = `${API_BASE_URL}/api`;

export default function DepartmentsTab() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchDepartments = () => {
    axios
      .get(`${API}/departments`, { withCredentials: true })
      .then((res) => setDepartments(res.data))
      .catch(() => setError('Erro ao carregar departamentos.'));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${API}/departments`,
        {
          name: formData.name.trim(),
          location: formData.location.trim(),
        },
        { withCredentials: true },
      );

      setFormData({ name: '', location: '' });
      setSuccess('Departamento criado com sucesso.');
      fetchDepartments();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ error?: string }>(err)) {
        setError(err.response?.data?.error || 'Erro ao criar departamento.');
      } else {
        setError('Erro ao criar departamento.');
      }
    }
  };

  const handleDeleteConfirmed = async () => {
    if (confirmDeleteId === null) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await axios.delete(`${API}/departments/${confirmDeleteId}`, { withCredentials: true });
      setDepartments(departments.filter((d) => d.id !== confirmDeleteId));
      setSuccess('Departamento removido.');
    } catch (err: unknown) {
      if (axios.isAxiosError<{ error?: string }>(err)) {
        setError(err.response?.data?.error || 'Erro ao remover departamento.');
      } else {
        setError('Erro ao remover departamento.');
      }
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      {confirmDeleteId !== null && (
        <ConfirmDeleteModal
          label="Tem a certeza que quer remover este departamento? Só é possível remover departamentos sem colaboradores."
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Departamentos</h1>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 mb-12 max-w-2xl"
      >
        <h2 className="text-xl font-semibold text-blue-600 mb-2">Adicionar Novo Departamento</h2>
        <p className="text-sm text-slate-500 mb-6">
          Cria departamentos para organizar colaboradores por área e localização.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{success}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nome</label>
            <input
              type="text"
              placeholder="Ex: Tecnologia"
              value={formData.name}
              required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Localização</label>
            <input
              type="text"
              placeholder="Ex: Lisboa"
              value={formData.location}
              required
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          Adicionar Departamento
        </button>
      </form>

      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Departamentos Registados
        <span className="ml-3 text-base font-normal text-slate-400">({departments.length})</span>
      </h2>

      {departments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500">Nenhum departamento encontrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Nome</th>
                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Localização</th>
                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">
                  Colaboradores
                </th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{dept.name}</td>
                  <td className="px-6 py-4 text-slate-500">{dept.location}</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">{dept._count?.employees ?? 0}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setConfirmDeleteId(dept.id)}
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
