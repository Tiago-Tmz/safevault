export interface Asset {
  id: number;
  category: string;
  model: string;
  serialNumber: string;
  value: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  departmentId: number;
}

export interface Department {
  id: number;
  name: string;
  location: string;
  _count?: {
    employees: number;
  };
}

export type ActiveTab = 'inventory' | 'employees' | 'departments';
