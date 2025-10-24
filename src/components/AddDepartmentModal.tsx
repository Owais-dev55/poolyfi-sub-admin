import { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import { createDepartment, type CreateDepartmentRequest } from '../apis/user/api';
import { customToast } from '../utils/useCustomToast';

interface DepartmentFormData {
  name: string;
}

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDepartment: (department: DepartmentFormData) => void;
  onDepartmentCreated?: () => void; // Callback to refresh departments list
}

const AddDepartmentModal = ({ isOpen, onClose, onAddDepartment, onDepartmentCreated }: AddDepartmentModalProps) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: DepartmentFormData) => {
    setIsLoading(true);
    
    try {
      // Prepare API request data
      const createDepartmentRequest: CreateDepartmentRequest = {
        name: values.name,
      };

      // Log the payload for debugging
      console.log('Creating department with payload:', createDepartmentRequest);

      // Call the API
      const response = await createDepartment(createDepartmentRequest);
      
      // Debug logging
      console.log('Full API response:', response);
      console.log('hasError:', response.hasError);
      console.log('data exists:', !!response.data);
      console.log('data content:', response.data);
      
      // Always try to close the modal if no error
      if (!response.hasError) {
        console.log('No error detected, proceeding with success flow');
        
        // Show success message using custom toast - ONLY show the API response message
        customToast.success(response.message || 'Department created successfully!');
        
        // Reset form
        form.resetFields();
        
        // Close the modal first
        console.log('Closing modal after successful department creation');
        onClose();
        
        // Handle callbacks with error protection to prevent misleading error toasts
        try {
          // Refresh the departments list immediately
          console.log('Refreshing departments list after modal close');
          console.log('onDepartmentCreated function exists:', !!onDepartmentCreated);
          if (onDepartmentCreated) {
            console.log('Calling onDepartmentCreated callback immediately');
            onDepartmentCreated();
          } else {
            console.log('onDepartmentCreated callback is not available');
          }
        } catch (callbackError) {
          console.error('Error in onDepartmentCreated callback:', callbackError);
          // Don't show error toast here as department was created successfully
        }
        
        // Also try with a timeout as backup
        setTimeout(() => {
          try {
            console.log('Timeout backup - calling onDepartmentCreated again');
            if (onDepartmentCreated) {
              onDepartmentCreated();
            }
          } catch (callbackError) {
            console.error('Error in timeout onDepartmentCreated callback:', callbackError);
            // Don't show error toast here as department was created successfully
          }
        }, 500);
        
        // Also call onAddDepartment for any additional handling
        if (response.data) {
          try {
            const createdDepartment = {
              ...values,
              id: response.data.id,
              companyId: response.data.companyId,
              isActive: response.data.isActive,
              isDelete: response.data.isDelete,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt
            };
            
            console.log('Calling onAddDepartment with:', createdDepartment);
            onAddDepartment(createdDepartment);
          } catch (callbackError) {
            console.error('Error in onAddDepartment callback:', callbackError);
            // Don't show error toast here as department was created successfully
          }
        }
      } else {
        console.log('Error detected - hasError:', response.hasError);
        
        // Check if it's a "department already exists" error
        const errorMessage = response.message || 'Failed to create department. Please try again.';
        if (errorMessage.toLowerCase().includes('already exist')) {
          customToast.error('Department Already Exists', {
            description: 'A department with this name already exists. Please choose a different name.',
            duration: 5000
          });
        } else {
          customToast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Create department error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create department. Please try again.';
      
      // Check if it's a "department already exists" error
      if (errorMessage.toLowerCase().includes('already exist')) {
        customToast.error('Department Already Exists', {
          description: 'A department with this name already exists. Please choose a different name.',
          duration: 5000
        });
      } else {
        customToast.error(errorMessage);
      }
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
          <BankOutlined className="text-blue-600 text-sm" />
          <span className="text-base">Add New Department</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={480}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-3"
      >
        {/* Department Name */}
        <Form.Item
          name="name"
          label={<span className="text-sm">Department Name</span>}
          rules={[
            { required: true, message: 'Please enter the department name' },
            { min: 2, message: 'Department name must be at least 2 characters' },
            { max: 50, message: 'Department name must not exceed 50 characters' }
          ]}
        >
          <Input
            prefix={<BankOutlined className="text-gray-400 text-xs" />}
            placeholder="Enter department name (e.g., Marketing, Sales, HR)"
            size="middle"
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
              {isLoading ? 'Creating Department...' : 'Create Department'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDepartmentModal;
