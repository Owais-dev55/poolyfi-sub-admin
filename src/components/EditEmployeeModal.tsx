import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined, BankOutlined, IdcardOutlined } from '@ant-design/icons';
import type { Employee } from '../data/employeeData';
import { getDepartments, updateUser, type Department, type UpdateUserRequest } from '../apis/user/api';

interface EmployeeFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  departmentId: number | null;
  empId?: string;
}

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditEmployee: (employeeId: string, employeeData: EmployeeFormData) => void;
  employee: Employee | null;
}

const EditEmployeeModal = ({ isOpen, onClose, onEditEmployee, employee }: EditEmployeeModalProps) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  const roleOptions = [
    { value: 'Driver', label: 'Driver' },
    { value: 'Passenger', label: 'Passenger' },
  ];

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const response = await getDepartments();
      
      if (!response.hasError && response.data) {
        setDepartments(response.data);
      } else {
        message.error(response.message || 'Failed to fetch departments');
      }
    } catch (error) {
      console.error('Fetch departments error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch departments';
      message.error(errorMessage);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const departmentOptions = departments.map(dept => ({
    value: dept.id,
    label: dept.name,
  }));

  // Pre-fill form when employee data changes and departments are loaded
  useEffect(() => {
    if (employee && isOpen && departments.length > 0) {
      form.setFieldsValue({
        fullName: employee.name,
        email: employee.email,
        phoneNumber: '', // Phone number not in Employee type, so empty
        role: employee.role,
        departmentId: employee.departmentId, // Use the departmentId directly from employee data
        empId: employee.empId || '', // Pre-fill empId if it exists
      });
    }
  }, [employee, isOpen, form, departments]);

  const handleSubmit = async (values: EmployeeFormData) => {
    if (!employee) return;
    
    setIsLoading(true);
    
    try {
      // Prepare API request data - only send allowed fields
      const updateUserRequest: UpdateUserRequest = {
        name: values.fullName,
        phone: values.phoneNumber || undefined, // Only include if phone number is provided
        departmentId: values.departmentId || null,
        // Map role to isRider: Driver = true, Passenger = false
        isRider: values.role === 'Driver' ? true : values.role === 'Passenger' ? false : null,
        empId: values.empId && values.empId.trim() !== '' ? values.empId.trim() : null,
      };

      // Log the payload for debugging
      console.log('Updating user with payload:', updateUserRequest);

      // Call the API
      const response = await updateUser(parseInt(employee.id), updateUserRequest);
      
      if (!response.hasError && response.data) {
        // Update the employee data with the response
        const updatedEmployeeData = {
          ...values,
          // Map the response data back to form format
          fullName: response.data.name,
          email: response.data.email,
          phoneNumber: response.data.phone,
          // Map isRider back to role
          role: response.data.isRider === true ? 'Driver' : response.data.isRider === false ? 'Passenger' : values.role,
        };
        
        onEditEmployee(employee.id, updatedEmployeeData);
        message.success(response.message || 'Employee updated successfully!');
        form.resetFields();
        onClose();
      } else {
        message.error(response.message || 'Failed to update employee. Please try again.');
      }
    } catch (error) {
      console.error('Update employee error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update employee. Please try again.';
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-1.5">
          <UserOutlined className="text-blue-600 text-sm" />
          <span className="text-base">Edit Employee</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={480}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-3"
      >
        {/* Full Name */}
        <Form.Item
          name="fullName"
          label={<span className="text-sm">Full Name</span>}
          rules={[
            { required: true, message: 'Please enter the employee name' },
            { min: 2, message: 'Name must be at least 2 characters' }
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400 text-xs" />}
            placeholder="Enter employee name"
            size="middle"
          />
        </Form.Item>

        {/* Employee ID */}
        <Form.Item
          name="empId"
          label={<span className="text-sm">Employee ID (Optional)</span>}
        >
          <Input
            prefix={<IdcardOutlined className="text-gray-400 text-xs" />}
            placeholder="Enter employee ID"
            size="middle"
          />
        </Form.Item>

        {/* Email Address */}
        <Form.Item
          name="email"
          label={<span className="text-sm">Email Address</span>}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400 text-xs" />}
            placeholder="employee@company.com"
            size="middle"
            disabled
            style={{ backgroundColor: '#f5f5f5', color: '#999' }}
          />
        </Form.Item>

        {/* Phone Number */}
        <Form.Item
          name="phoneNumber"
          label={<span className="text-sm">Phone Number</span>}
          rules={[
            { pattern: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please enter a valid phone number' }
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="text-gray-400 text-xs" />}
            placeholder="+1 (555) 123-4567"
            size="middle"
          />
        </Form.Item>

        {/* Role */}
        <Form.Item
          name="role"
          label={<span className="text-sm">Role</span>}
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select
            placeholder="Select role"
            size="middle"
            options={roleOptions}
            suffixIcon={<TeamOutlined className="text-xs" />}
          />
        </Form.Item>

        {/* Department */}
        <Form.Item
          name="departmentId"
          label={<span className="text-sm">Department</span>}
        >
          <Select
            placeholder="Select department"
            size="middle"
            options={departmentOptions}
            loading={departmentsLoading}
            suffixIcon={<BankOutlined className="text-xs" />}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {/* Action Buttons */}
        <Form.Item className="mb-0 mt-4">
          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleCancel}
              size="middle"
              className="px-6 text-sm"
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="middle"
              className="px-6 text-sm"
              style={{ backgroundColor: '#FFC11E', borderColor: '#FFC11E', color: 'black' }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditEmployeeModal;
