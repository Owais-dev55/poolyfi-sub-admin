// Employee Management page data

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'Driver' | 'Passenger' | 'Owner';
  department: string;
  departmentId?: number | null;
  status: 'Active' | 'Inactive';
  avatar: string;
  isRider?: boolean | null;
  empId?: string | null;
}

export const initialEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    role: 'Driver',
    department: 'Operations',
    status: 'Active',
    avatar: 'JS'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@techcorp.com',
    role: 'Passenger',
    department: 'Engineering',
    status: 'Inactive',
    avatar: 'SJ'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@techcorp.com',
    role: 'Driver',
    department: 'Operations',
    status: 'Active',
    avatar: 'MC'
  }
];