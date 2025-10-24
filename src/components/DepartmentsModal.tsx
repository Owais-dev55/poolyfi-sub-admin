import { useState, useEffect } from 'react';
import { Modal, Table, Button, Input, Popconfirm, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getDepartments, updateDepartment, deleteDepartment, type Department } from '../apis/user/api';
import { customToast } from '../utils/useCustomToast';
import AddDepartmentModal from './AddDepartmentModal';

interface DepartmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepartmentsModal = ({ isOpen, onClose }: DepartmentsModalProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  // Debug modal state changes
  useEffect(() => {
    console.log('isAddModalOpen state changed to:', isAddModalOpen);
  }, [isAddModalOpen]);

  const fetchDepartments = async () => {
    try {
      console.log('=== FETCH DEPARTMENTS CALLED ===');
      console.log('Fetching departments...');
      setIsLoading(true);
      const response = await getDepartments();
      
      console.log('Departments API response:', response);
      
      if (!response.hasError && response.data) {
        console.log('Setting departments:', response.data);
        console.log('Number of departments:', response.data.length);
        setDepartments(response.data);
      } else {
        console.log('Error fetching departments:', response.message);
        customToast.error(response.message || 'Failed to fetch departments');
      }
    } catch (error) {
      console.error('Fetch departments error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch departments';
      customToast.error(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('=== FETCH DEPARTMENTS COMPLETED ===');
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setEditingName(department.name);
  };

  const handleSaveEdit = async () => {
    if (!editingDepartment || !editingName.trim()) return;

    try {
      const updateData = {
        name: editingName.trim(),
      };
      
      // Log the payload for debugging
      console.log('Updating department with payload:', updateData);
      
      const response = await updateDepartment(editingDepartment.id, updateData);

      if (!response.hasError) {
        customToast.success(response.message || 'Department updated successfully!');
        setEditingDepartment(null);
        setEditingName('');
        fetchDepartments(); // Refresh the list
      } else {
        customToast.error(response.message || 'Failed to update department');
      }
    } catch (error) {
      console.error('Update department error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update department';
      customToast.error(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setEditingDepartment(null);
    setEditingName('');
  };

  const handleDelete = async (departmentId: number) => {
    try {
      // Log the delete operation for debugging
      console.log('Deleting department with ID:', departmentId);
      
      const response = await deleteDepartment(departmentId);

      if (!response.hasError) {
        customToast.success(response.message || 'Department deleted successfully!');
        fetchDepartments(); // Refresh the list
      } else {
        customToast.error(response.message || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Delete department error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete department';
      customToast.error(errorMessage);
    }
  };

  const handleAddDepartment = () => {
    console.log('=== HANDLE ADD DEPARTMENT CALLED ===');
    console.log('handleAddDepartment called - refreshing departments list');
    fetchDepartments(); // Refresh the list after adding
  };

  const handleCloseAddModal = () => {
    console.log('Closing add department modal');
    console.log('Current isAddModalOpen state:', isAddModalOpen);
    setIsAddModalOpen(false);
    console.log('Set isAddModalOpen to false');
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const columns = [
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Department) => {
        if (editingDepartment && editingDepartment.id === record.id) {
          return (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onPressEnter={handleSaveEdit}
              onBlur={handleSaveEdit}
              autoFocus
              size="small"
              className="w-full"
            />
          );
        }
        return <span className="font-medium">{text}</span>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Department) => {
        if (editingDepartment && editingDepartment.id === record.id) {
          return (
            <div className="flex space-x-1">
              <Button
                size="small"
                onClick={handleSaveEdit}
                className="bg-[#FFC11E] hover:bg-[#E6B800] text-black border-[#FFC11E] hover:border-[#E6B800]"
                style={{ backgroundColor: '#FFC11E', borderColor: '#FFC11E', color: 'black' }}
              >
                Save
              </Button>
              <Button
                size="small"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </div>
          );
        }
        return (
          <div className="flex space-x-1">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="hover:bg-gray-100"
              title="Edit Department"
            />
            <Popconfirm
              title="Delete Department"
              description="Are you sure you want to delete this department?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                size="small"
                icon={<DeleteOutlined />}
                className="hover:bg-gray-100"
                title="Delete Department"
              />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">Departments Management</span>
            <span className="text-sm text-gray-500">({departments.length} departments)</span>
          </div>
        }
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <div className="space-y-4">
          {/* Header with Add Button and Search */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search departments..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="middle"
              />
            </div>
            <Button
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#FFC11E] hover:bg-[#E6B800] text-black border-[#FFC11E] hover:border-[#E6B800]"
              style={{ backgroundColor: '#FFC11E', borderColor: '#FFC11E', color: 'black' }}
            >
              Add Department
            </Button>
          </div>

          {/* Departments Table */}
          <div className="mt-4">
            <Spin spinning={isLoading} tip="Loading departments...">
              <Table
                columns={columns}
                dataSource={filteredDepartments}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} departments`,
                }}
              />
            </Spin>
          </div>
        </div>
      </Modal>

      {/* Add Department Modal */}
      <AddDepartmentModal
        key={isAddModalOpen ? 'open' : 'closed'}
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onAddDepartment={handleAddDepartment}
        onDepartmentCreated={fetchDepartments}
      />
    </>
  );
};

export default DepartmentsModal;
