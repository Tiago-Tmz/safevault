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

  useEffect(() => {
    // Faz a requisição para o Backend Node.js
    axios.get('http://localhost:4000/api/assets')
      .then(response => {
        setAssets(response.data);
      })
      .catch(err => {
        console.error("Erro ao buscar dados da API:", err);
      });
  }, [])

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>📦 Inventário SafeVault</h1>

      {assets.length === 0 ? (
        <p>Nenhum ativo encontrado ou carregando...</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginTop: '20px' }}>
          {assets.map(asset => (
            <div key={asset.id} style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>{asset.model}</h3>
              <p style={{ margin: '5px 0', color: '#333' }}><strong>S/N:</strong> {asset.serialNumber}</p>
              <p style={{ margin: '5px 0', color: '#333' }}><strong>Categoria:</strong> {asset.category}</p>
              <p style={{ margin: '5px 0', color: '#333' }}><strong>Valor:</strong> R$ {asset.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App