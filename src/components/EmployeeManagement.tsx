import { useState, useEffect } from 'react';
import AddEmployeeModal from './AddEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import DeleteEmployeeModal from './DeleteEmployeeModal';
import DepartmentsModal from './DepartmentsModal';
import { customToast } from '../utils/useCustomToast';
import { getUsers, getDepartments, updateUserStatus, getEmployeeMeta, handleApiError, type User, type Department } from '../apis/user/api';
import type { Employee } from '../data/employeeData';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuth } from '../contexts/AuthContext';

// Employee metadata interface
interface EmployeeMetaData {
  totalEmployees: number;
  totalDrivers: number;
  totalPassengers: number;
  activeRides: number;
}

const EmployeeManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDepartmentsModalOpen, setIsDepartmentsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Employee metadata state
  const [employeeMeta, setEmployeeMeta] = useState<EmployeeMetaData>({
    totalEmployees: 0,
    totalDrivers: 0,
    totalPassengers: 0,
    activeRides: 0
  });
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  // Fetch employee metadata from API
  const fetchEmployeeMeta = async () => {
    if (!user?.companyId) return;
    
    try {
      setMetaLoading(true);
      setMetaError(null);
      const response = await getEmployeeMeta(user.companyId);
      setEmployeeMeta(response.data);
    } catch (error) {
      console.error('Failed to fetch employee metadata:', error);
      setMetaError(handleApiError(error));
    } finally {
      setMetaLoading(false);
    }
  };

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      
      if (!response.hasError && response.data) {
        setDepartments(response.data);
      } else {
        console.error('Failed to fetch departments:', response.message);
      }
    } catch (error) {
      console.error('Fetch departments error:', error);
    }
  };

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId: number | null): string => {
    if (!departmentId) return 'No Department';
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : `Department ${departmentId}`;
  };

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await getUsers();
      
      if (!response.hasError && response.data) {
        // Convert API data to Employee format
        const employeeData: Employee[] = response.data.map((user: User) => ({
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.isRider === null ? 'Owner' : user.isRider ? 'Driver' : 'Passenger',
          department: getDepartmentName(user.departmentId),
          departmentId: user.departmentId,
          status: user.isActive ? 'Active' : 'Inactive',
          avatar: user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          isRider: user.isRider,
          empId: user.empId
        }));
        
        setEmployees(employeeData);
      } else {
        customToast.error(response.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Fetch employees error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employees';
      customToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load employees and departments on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchDepartments();
      await fetchEmployees();
      await fetchEmployeeMeta();
    };
    loadData();
  }, [user?.companyId]);

  // Re-fetch employees when departments change to update department names
  useEffect(() => {
    if (departments.length > 0) {
      fetchEmployees();
    }
  }, [departments]);


  // Toggle employee status
  const handleStatusToggle = async (employeeId: string) => {
    try {
      // Find the current employee to get their current status
      const currentEmployee = employees.find(emp => emp.id === employeeId);
      if (!currentEmployee) {
        customToast.error('Employee not found');
        return;
      }

      // Check if the employee is an owner (isRider === null)
      if (currentEmployee.isRider === null) {
        customToast.warning('Cannot change status for Owner role');
        return;
      }

      // Determine the new status
      const newStatus = currentEmployee.status === 'Active' ? 'Inactive' : 'Active';
      const isActive = newStatus === 'Active';

      // Call the API to update the status
      const response = await updateUserStatus(parseInt(employeeId), { isActive });

      if (!response.hasError && response.data) {
        // Update local state with the new status
        setEmployees(prevEmployees => 
          prevEmployees.map(employee => 
            employee.id === employeeId 
              ? { ...employee, status: newStatus }
              : employee
          )
        );
        customToast.success('Employee status updated successfully!');
      } else {
        customToast.error(response.message || 'Failed to update employee status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update employee status';
      customToast.error(errorMessage);
    }
  };

  // Filter and sort employees
  const filteredEmployees = employees
    .filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || employee.role === roleFilter;
    return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'role':
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        case 'department':
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Use API data for overview cards, fallback to calculated values if API fails
  const totalEmployees = metaError ? employees.length : employeeMeta.totalEmployees;
  const drivers = metaError ? employees.filter(emp => emp.role === 'Driver').length : employeeMeta.totalDrivers;
  const passengers = metaError ? employees.filter(emp => emp.role === 'Passenger').length : employeeMeta.totalPassengers;
  const activeNow = metaError ? employees.filter(emp => emp.status === 'Active').length : employeeMeta.activeRides;

  const handleAddEmployee = () => {
    // Refresh the employee list from API after adding
    fetchEmployees();
    customToast.success('Employee Added! New employee has been successfully added to the system.');
  };

  const handleEditEmployee = (employeeId: string, updatedEmployeeData: any) => {
    // Get the department name from the department ID using the mapping
    const departmentName = getDepartmentName(updatedEmployeeData.departmentId);

    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? {
            ...emp,
            name: updatedEmployeeData.fullName,
            email: updatedEmployeeData.email,
            role: updatedEmployeeData.role,
            department: departmentName,
            departmentId: updatedEmployeeData.departmentId,
            avatar: updatedEmployeeData.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
          }
        : emp
    ));
    
    // Refresh the employee list from API to ensure data consistency
    fetchEmployees();
    customToast.success('Employee Updated! Employee information has been successfully updated.');
  };

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteEmployee = () => {
    // Refresh the employee list from API after deletion
    // Note: The actual API call is handled by DeleteEmployeeModal
    fetchEmployees();
    fetchEmployeeMeta();
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="flex-1 min-h-screen">
      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Employee Overview Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 lg:mb-0">Employee Overview</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <button 
                  onClick={() => setIsDepartmentsModalOpen(true)}
                  className="bg-[#FFC11E] hover:bg-[#E6B800] text-black px-4 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors w-full sm:w-auto justify-center text-sm cursor-pointer"
                >
                  <span className="text-lg">🏢</span>
                  <span>Departments</span>
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#FFC11E] hover:bg-[#E6B800] text-black px-4 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors w-full sm:w-auto justify-center text-sm cursor-pointer"
                >
                  <span className="text-lg">+</span>
                  <span>Add Employee</span>
                </button>
              </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-0.5">Total Employees</p>
                <p className="text-lg font-bold text-gray-900">
                  {metaLoading ? (
                    <Skeleton height={24} width={40} />
                  ) : metaError ? (
                    <span className="text-red-500 text-sm">Error</span>
                  ) : (
                    totalEmployees
                  )}
                </p>
                    <p className="text-xs text-gray-500">In system</p>
              </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-0.5">Drivers</p>
                <p className="text-lg font-bold text-gray-900">
                  {metaLoading ? (
                    <Skeleton height={24} width={40} />
                  ) : metaError ? (
                    <span className="text-red-500 text-sm">Error</span>
                  ) : (
                    drivers
                  )}
                </p>
                    <p className="text-xs text-gray-500">Active drivers</p>
              </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>
          </div>

              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-0.5">Passengers</p>
                <p className="text-lg font-bold text-gray-900">
                  {metaLoading ? (
                    <Skeleton height={24} width={40} />
                  ) : metaError ? (
                    <span className="text-red-500 text-sm">Error</span>
                  ) : (
                    passengers
                  )}
                </p>
                    <p className="text-xs text-gray-500">Registered users</p>
              </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-0.5">Active Now</p>
                <p className="text-lg font-bold text-gray-900">
                  {metaLoading ? (
                    <Skeleton height={24} width={40} />
                  ) : metaError ? (
                    <span className="text-red-500 text-sm">Error</span>
                  ) : (
                    activeNow
                  )}
                </p>
                    <p className="text-xs text-gray-500">Currently online</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header with Filters */}
          <div className="px-5 py-3 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3 space-y-3 lg:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900">All Employees</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black"
              />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black cursor-pointer"
                >
                  <option value="All Roles">All Roles</option>
                  <option value="Driver">Driver</option>
                  <option value="Passenger">Passenger</option>
                  <option value="Owner">Owner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                <th 
                  className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Employee</span>
                    <SortIcon column="name" />
                  </div>
                </th>
                <th 
                  className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Role</span>
                    <SortIcon column="role" />
                  </div>
                </th>
                <th 
                  className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('department')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Department</span>
                    <SortIcon column="department" />
                  </div>
                </th>
                <th 
                  className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <SortIcon column="status" />
                  </div>
                </th>
                  <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <>
                    {[...Array(8)].map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <Skeleton circle height={40} width={40} />
                            </div>
                            <div className="ml-4">
                              <Skeleton height={16} width={120} />
                              <Skeleton height={14} width={80} className="mt-1" />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Skeleton height={16} width={100} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Skeleton height={16} width={80} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Skeleton height={16} width={60} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Skeleton height={16} width={40} />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center">
                      <div className="text-sm text-gray-500">No employees found</div>
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xs shadow-sm">
                          {employee.avatar}
                        </div>
                        <div className="ml-3">
                          <div className="text-xs font-medium text-gray-900">{employee.name}</div>
                          <div className="text-xs text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.role === 'Driver' 
                        ? 'bg-blue-100 text-blue-800' 
                        : employee.role === 'Owner'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                        {employee.role}
                      </span>
                    </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="text-xs font-medium text-gray-900">{employee.department}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStatusToggle(employee.id)}
                          disabled={employee.isRider === null}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            employee.isRider === null 
                              ? 'bg-green-500 cursor-not-allowed opacity-60' 
                              : employee.status === 'Active' 
                              ? 'bg-green-500' 
                              : 'bg-gray-300'
                          }`}
                          title={employee.isRider === null ? 'Owner role - Always Active' : 'Toggle employee status'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              employee.isRider === null 
                                ? 'translate-x-4' // Always show as active position for owners
                                : employee.status === 'Active' 
                                ? 'translate-x-4' 
                                : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-medium ${
                          employee.isRider === null 
                            ? 'text-green-600' // Always green for owners
                            : employee.status === 'Active' 
                            ? 'text-green-600' 
                            : 'text-gray-500'
                        }`}>
                        {employee.isRider === null ? 'Active' : employee.status}
                      </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditClick(employee)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Employee"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(employee)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Employee"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, filteredEmployees.length)}</span> of <span className="font-medium">{filteredEmployees.length}</span> employees
              </p>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 cursor-pointer'
                  }`}
                >
                  Previous
                </button>
                <span className="px-2 py-1 text-xs bg-[#FFC11E] text-black rounded font-medium">{currentPage}</span>
                <span className="text-xs text-gray-500">of {totalPages || 1}</span>
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    currentPage >= totalPages 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 cursor-pointer'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddEmployee={handleAddEmployee}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        onEditEmployee={handleEditEmployee}
        employee={selectedEmployee}
      />

      {/* Delete Employee Modal */}
      <DeleteEmployeeModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEmployee(null);
        }}
        onDeleteEmployee={() => handleDeleteEmployee()}
        employee={selectedEmployee}
      />

      {/* Departments Management Modal */}
      <DepartmentsModal
        isOpen={isDepartmentsModalOpen}
        onClose={() => setIsDepartmentsModalOpen(false)}
      />

    </div>
  );
};

export default EmployeeManagement;
