import { useEffect, useState } from 'react';
import axios from 'axios';
import LoginPage from './LoginPage';
import Navbar from './components/Navbar';
import InventoryTab from './components/tabs/InventoryTab';
import EmployeesTab from './components/tabs/EmployeesTab';
import DepartmentsTab from './components/tabs/DepartmentsTab';
import type { ActiveTab, User } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API = `${API_BASE_URL}/api`;

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('inventory');

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
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'employees' && user.isAdmin && <EmployeesTab />}
        {activeTab === 'departments' && user.isAdmin && <DepartmentsTab />}
        {activeTab === 'employees' && !user.isAdmin && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">Não tens permissão para aceder a esta área.</p>
          </div>
        )}
        {activeTab === 'departments' && !user.isAdmin && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">Não tens permissão para aceder a esta área.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
