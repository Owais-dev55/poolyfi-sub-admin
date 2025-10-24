import { useState } from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteUser } from '../apis/user/api';
import type { Employee } from '../data/employeeData';
import { customToast } from '../utils/useCustomToast';

interface DeleteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteEmployee: () => void;
  employee: Employee | null;
}

const DeleteEmployeeModal = ({ isOpen, onClose, onDeleteEmployee, employee }: DeleteEmployeeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!employee) return;

    setIsLoading(true);

    try {
      const userId = parseInt(employee.id);
      const response = await deleteUser(userId);

      if (!response.hasError) {
        customToast.success(response.message || 'Employee deleted successfully!');
        onDeleteEmployee();
        onClose();
      } else {
        // ✅ If backend returns ownership or restriction message
        if (response.message?.toLowerCase().includes('company owner')) {
          customToast.warning('This user is the company owner and cannot be deleted.');
        } else {
          customToast.error(response.message || 'Failed to delete employee. Please try again.');
        }
      }
    } catch (error) {
      console.error('Delete employee error:', error);

      // ✅ Detect specific backend constraint
      const errorMessage =
        error instanceof Error && error.message.includes('Company_ownerId_fkey')
          ? 'This user is the company owner and cannot be deleted.'
          : 'Failed to delete employee. Please try again.';

      customToast.warning(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-1.5">
          <ExclamationCircleOutlined className="text-red-500 text-sm" />
          <span className="text-base font-semibold text-gray-900">Delete Employee</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={400}
      destroyOnHidden
    >
      <div className="mt-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm shadow-sm">
            {employee?.avatar}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-1">{employee?.name}</h3>
            <p className="text-xs text-gray-600 mb-1">{employee?.email}</p>
            <div className="flex items-center space-x-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {employee?.role}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{employee?.department}</span>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleOutlined className="h-4 w-4 text-red-400" />
            </div>
            <div className="ml-2">
              <h3 className="text-xs font-medium text-red-800">Warning</h3>
              <div className="mt-1 text-xs text-red-700">
                <p>This action cannot be undone. The employee will be permanently removed from the system and all associated data will be lost.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button onClick={handleCancel} size="middle" className="px-6 py-1.5 text-sm font-medium">
            Cancel
          </Button>

          <Button
            type="primary"
            danger
            onClick={handleDelete}
            loading={isLoading}
            size="middle"
            className="px-6 py-1.5 text-sm font-medium"
          >
            {isLoading ? 'Deleting...' : 'Delete Employee'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteEmployeeModal;
