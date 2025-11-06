import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined, 
  BankOutlined, LockOutlined, IdcardOutlined 
} from '@ant-design/icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createUser, getDepartments, type CreateUserRequest, type Department } from '../apis/user/api';

interface EmployeeFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  departmentId: number | null;
  password: string;
  empId: string;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employee: EmployeeFormData) => void;
}

const AddEmployeeModal = ({ isOpen, onClose, onAddEmployee }: AddEmployeeModalProps) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  const roleOptions = [
    { value: 'Driver', label: 'Driver' },
    { value: 'Passenger', label: 'Passenger' },
  ];

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
        if (response.data.length === 0) {
          toast.info('No departments found. Please create a department first.');
        }
      } else {
        toast.error(response.message || 'Failed to fetch departments');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch departments';
      toast.error(errorMessage);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const departmentOptions = departments.map(dept => ({
    value: dept.id,
    label: dept.name,
  }));

  const handleSubmit = async (values: EmployeeFormData) => {
    if (!values.departmentId) {
      toast.error('Please select a department before creating an employee');
      return;
    }

    setIsLoading(true);
    try {
      const isRider = values.role === 'Driver';

      const createUserRequest: CreateUserRequest = {
        name: values.fullName,
        email: values.email,
        phone: values.phoneNumber,
        password: values.password,
        departmentId: values.departmentId,
        isRider,
        empId: values.empId?.trim() || null,
      };

      console.log('Creating user with payload:', createUserRequest);

      const response = await createUser(createUserRequest);

      if (!response.hasError && response.data) {
        const createdEmployee = {
          ...values,
          phoneNumber: response.data.phone,
          id: response.data.id,
          departmentId: response.data.departmentId,
          companyId: response.data.companyId,
          isActive: response.data.isActive,
          isDelete: response.data.isDelete,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        };
        console.log("✅ createdEmployee before sending to parent:", createdEmployee);
        onAddEmployee(createdEmployee);
        toast.success(response.message || 'Employee added successfully!');
        form.resetFields();
        onClose();
      } else {
        // Show backend API error as toast
        toast.error(response.message || 'Failed to add employee. Please try again.');
      }
    } catch (error) {
      console.error('Create employee error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add employee. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center space-x-1.5">
            <UserOutlined className="text-blue-600 text-sm" />
            <span className="text-base">Add New Employee</span>
          </div>
        }
        open={isOpen}
        onCancel={handleCancel}
        footer={null}
        width={480}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-3">
          <Form.Item
            name="fullName"
            label={<span className="text-sm">Full Name</span>}
            rules={[
              { required: true, message: 'Please enter the employee name' },
              { min: 2, message: 'Name must be at least 2 characters' }
            ]}
          >
            <Input prefix={<UserOutlined className="text-gray-400 text-xs" />} placeholder="Enter employee name" size="middle" />
          </Form.Item>

          <Form.Item name="empId" label={<span className="text-sm">Employee ID</span>} rules={[{required: true}]}>
            <Input prefix={<IdcardOutlined className="text-gray-400 text-xs" />} placeholder="Enter employee ID" size="middle" />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-sm">Email Address</span>}
            rules={[
              { required: true, message: 'Please enter the email address' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input prefix={<MailOutlined className="text-gray-400 text-xs" />} placeholder="employee@company.com" size="middle" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label={<span className="text-sm">Phone Number (Pakistan)</span>}
            rules={[
              { required: true, message: 'Please enter a phone number' },
              { 
                pattern: /^(\+92|92|0)?(3[0-9]{9}|4[0-9]{9}|5[0-9]{9})$/,
                message: 'Please enter a valid Pakistan phone number (e.g., +923001234567, 03001234567)'
              }
            ]}
          >
            <Input prefix={<PhoneOutlined className="text-gray-400 text-xs" />} placeholder="+923001234567 or 03001234567" size="middle" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="text-sm">Password</span>}
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400 text-xs" />} placeholder="Enter password" size="middle" />
          </Form.Item>

          <Form.Item name="role" label={<span className="text-sm">Role</span>} rules={[{ required: true, message: 'Please select a role' }]}>
            <Select placeholder="Select role" size="middle" options={roleOptions} suffixIcon={<TeamOutlined className="text-xs" />} />
          </Form.Item>

          <Form.Item name="departmentId" label={<span className="text-sm">Department</span>}>
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

          <Form.Item className="mb-0 mt-4">
            <div className="flex justify-end space-x-2">
              <Button onClick={handleCancel} size="middle" className="px-6 text-sm">Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="middle"
                className="px-6 text-sm"
                style={{ backgroundColor: '#FFC11E', borderColor: '#FFC11E', color: 'black' }}
              >
                {isLoading ? 'Adding Employee...' : 'Add Employee'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </>
  );
};

export default AddEmployeeModal;
