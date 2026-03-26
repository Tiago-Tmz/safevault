import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import ConfirmDeleteModal from '../ConfirmDeleteModal';
import type { Asset } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API = `${API_BASE_URL}/api`;

export default function InventoryTab() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ model: '', category: '', serialNumber: '', value: '' });
  const [error, setError] = useState('');

  const fetchAssets = () => {
    axios
      .get(`${API}/assets`, { withCredentials: true })
      .then((res) => setAssets(res.data))
      .catch(() => setError('Erro ao carregar equipamentos.'));
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(
        `${API}/assets`,
        {
          model: formData.model,
          category: formData.category,
          serialNumber: formData.serialNumber,
          value: parseFloat(formData.value),
          purchaseDate: new Date().toISOString(),
        },
        { withCredentials: true },
      );
      setFormData({ model: '', category: '', serialNumber: '', value: '' });
      fetchAssets();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ error?: string }>(err)) {
        setError(err.response?.data?.error || 'Erro ao adicionar equipamento.');
      } else {
        setError('Erro ao adicionar equipamento.');
      }
    }
  };

  const handleDeleteConfirmed = async () => {
    if (confirmDeleteId === null) {
      return;
    }

    try {
      await axios.delete(`${API}/assets/${confirmDeleteId}`, { withCredentials: true });
      setAssets(assets.filter((a) => a.id !== confirmDeleteId));
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
            <input
              type="text"
              placeholder="Modelo"
              value={formData.model}
              required
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <input
              type="text"
              placeholder="Categoria (ex: Laptops)"
              value={formData.category}
              required
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Número de Série"
              value={formData.serialNumber}
              required
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-400">€</span>
              <input
                type="number"
                placeholder="Valor"
                value={formData.value}
                required
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
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

      <h2 className="text-2xl font-bold text-slate-800 mb-6">Equipamentos Registados</h2>
      {assets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500">Nenhum equipamento encontrado no inventário.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assets.map((asset) => (
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
                  <p>
                    <strong className="text-slate-800 font-medium">S/N:</strong>{' '}
                    <span className="font-mono text-slate-500">{asset.serialNumber}</span>
                  </p>
                  <p>
                    <strong className="text-slate-800 font-medium">Valor:</strong> € {asset.value.toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmDeleteId(asset.id)}
                className="mt-6 w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                Apagar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
