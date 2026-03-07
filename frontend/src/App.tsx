import { useEffect, useState } from 'react'
import axios from 'axios'

// Define o formato do dado que vem do banco
interface Asset {
  id: number;
  category: string;
  model: string;
  serialNumber: string;
  value: number;
}

function App() {

  const [assets, setAssets] = useState<Asset[]>([])

  const [formData, setFormData] = useState({
    model: '',
    category: '',
    serialNumber: '',
    value: ''
  });

  const fetchAssets = () => {
     // Faz a requisição para o Backend Node.js
    axios.get('http://localhost:4000/api/assets')
      .then(response => {
        setAssets(response.data);
      })
      .catch(err => {
        console.error("Erro ao buscar dados da API:", err);
      });

  }
  useEffect(() => {
    fetchAssets();
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/assets', {
        model: formData.model,
        category: formData.category,
        serialNumber: formData.serialNumber,
        value: parseFloat(formData.value),
        purchaseDate: new Date().toISOString()
      });
      setFormData({ model: '', category: '', serialNumber: '', value: '' });
      fetchAssets(); // Atualiza a lista após criar um novo ativo
    } catch (err) {
      console.error("Erro ao adicionar equipamento:", err);
    }
  }


  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>📦 Inventário SafeVault</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#0056b3' }}>Adicionar Novo Equipamento</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text"
            placeholder="Modelo"
            value={formData.model}
            onChange={e => setFormData({ ...formData, model: e.target.value })}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="text"
            placeholder="Categoria"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="text"
            placeholder="Número de Série"
            value={formData.serialNumber}
            onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="number"
            placeholder="Valor"
            value={formData.value}
            onChange={e => setFormData({ ...formData, value: e.target.value })}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />  
          <button type="submit" style={{ padding: '10px', backgroundColor: '#0056b3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Adicionar Ativo</button>
        </div>
      </form>

      {assets.length === 0 ? (
        <p>Nenhum equipamento encontrado...</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginTop: '20px' }}>
          {assets.map(asset => (
            <div key={asset.id} style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>{asset.model}</h3>
              <p style={{ margin: '5px 0', color: '#333' }}><strong>S/N:</strong> {asset.serialNumber}</p>
              <p style={{ margin: '5px 0', color: '#333' }}><strong>Categoria:</strong> {asset.category}</p>
              <p style={{ margin: '5px 0', color: '#333' }}><strong>Valor:</strong> {asset.value} €</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App