import type { ActiveTab, User } from '../types';

interface NavbarProps {
  user: User;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export default function Navbar({ user, activeTab, onTabChange, onLogout }: NavbarProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <nav className="w-full bg-white border-b border-slate-200 shadow-sm px-6 md:px-12 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold text-slate-900">SafeVault</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('inventory')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'inventory'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Inventário
          </button>
          {user.isAdmin && (
            <button
              onClick={() => onTabChange('employees')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'employees'
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
          {user.isAdmin && (
            <button
              onClick={() => onTabChange('departments')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'departments'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              Departamentos
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
