import { useState, useEffect } from 'react';
import { getUserProfile, updateUser, updatePassword, handleApiError } from '../apis/user/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import CustomToastContainer from '../components/CustomToast';
import { useCustomToast } from '../utils/useCustomToast';

const SettingsPage = () => {
  const { showToast } = useCustomToast();

  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    contactEmail: '',
    phoneNumber: '',
    address: '123 Business Ave, Tech District, CA 90210, United States'
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Pakistan phone validation
  const validatePakistanPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const regex = /^(\+92|92|0)?(3[0-9]{2}|4[0-9]|5[0-9])[0-9]{7}$/;
    if (!phone.trim()) return null;
    if (!regex.test(cleanPhone)) return 'Please enter a valid Pakistan mobile number (e.g., +92 300 1234567)';
    return null;
  };

  const handleCompanyInfoChange = (field: string, value: string) => {
    if (field === 'phoneNumber') {
      const error = validatePakistanPhone(value);
      setPhoneError(error);
    }
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const validatePassword = (password: string) => {
    setPasswordValidation(prev => ({
      ...prev,
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordInfo(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'newPassword') validatePassword(value);
      if (field === 'newPassword' || field === 'confirmPassword') {
        setPasswordValidation(prevVal => ({
          ...prevVal,
          match: updated.newPassword === updated.confirmPassword && updated.newPassword !== ''
        }));
      }
      return updated;
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);
        const response = await getUserProfile();
        setUserId(response.data.id);
        setCompanyInfo({
          companyName: response.data.name,
          contactEmail: response.data.email,
          phoneNumber: response.data.phone,
          address: companyInfo.address
        });
      } catch (err) {
        setProfileError(handleApiError(err));
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveCompanyInfo = async () => {
    const phoneValidationError = validatePakistanPhone(companyInfo.phoneNumber);
    if (phoneValidationError) return showToast('error', phoneValidationError);
    if (!userId) return showToast('error', 'User ID not found. Please refresh.');

    try {
      setSaveLoading(true);
      const response = await updateUser(userId, {
        name: companyInfo.companyName,
        phone: companyInfo.phoneNumber
      });

      if (!response.hasError) {
        showToast('success', 'Profile updated successfully!');
        const profileResponse = await getUserProfile();
        setCompanyInfo(prev => ({
          ...prev,
          companyName: profileResponse.data.name,
          contactEmail: profileResponse.data.email,
          phoneNumber: profileResponse.data.phone
        }));
      } else {
        showToast('error', response.message || 'Failed to update profile');
      }
    } catch (err) {
      showToast('error', handleApiError(err));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    // Password validation checks with toast messages
    if (!passwordInfo.currentPassword || !passwordInfo.newPassword || !passwordInfo.confirmPassword) {
      return showToast('error', 'All password fields are required!');
    }
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      return showToast('error', 'Passwords do not match!');
    }
    if (!passwordValidation.length) return showToast('error', 'Password must be at least 8 characters!');
    if (!passwordValidation.uppercase) return showToast('error', 'Password must include an uppercase letter!');
    if (!passwordValidation.lowercase) return showToast('error', 'Password must include a lowercase letter!');
    if (!passwordValidation.number) return showToast('error', 'Password must include a number!');
    if (!passwordValidation.special) return showToast('error', 'Password must include a special character!');
    if (passwordInfo.currentPassword === passwordInfo.newPassword) return showToast('error', 'New password cannot be the same as current password!');

    try {
      setPasswordLoading(true);
      const response = await updatePassword({
        old_password: passwordInfo.currentPassword,
        password: passwordInfo.newPassword
      });

      if (!response.hasError) {
        showToast('success', 'Password updated successfully!');
        setPasswordInfo({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordValidation({ length: false, uppercase: false, lowercase: false, number: false, special: false, match: false });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        showToast('error', response.message || 'Failed to update password');
      }
    } catch (err) {
      showToast('error', handleApiError(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex-1 h-[calc(90vh)] bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-auto">
      <CustomToastContainer />
      <div className="max-w-4xl mx-auto space-y-5">
        {/* ================= Company Information Card ================= */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Company Information</h2>
          {profileError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2 text-xs text-red-600">{profileError}</div>}

          {/* Company Name */}
          {profileLoading ? <Skeleton height={32} width="100%" /> :
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Company Representative Name</label>
              <input
                type="text"
                value={companyInfo.companyName}
                onChange={(e) => handleCompanyInfoChange('companyName', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter company name"
              />
            </div>
          }

          {/* Contact Email */}
          {profileLoading ? <Skeleton height={32} width="100%" /> :
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Contact Email</label>
              <input
                type="email"
                value={companyInfo.contactEmail}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email address cannot be modified</p>
            </div>
          }

          {/* Phone */}
          {profileLoading ? <Skeleton height={32} width="100%" /> :
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Phone Number (Pakistan)</label>
              <input
                type="tel"
                value={companyInfo.phoneNumber}
                onChange={(e) => handleCompanyInfoChange('phoneNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-1 focus:outline-none ${phoneError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                placeholder="e.g., +92 300 1234567"
              />
            </div>
          }

          {/* Address */}
          {profileLoading ? <Skeleton height={32} width="100%" /> :
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Address</label>
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Business Ave, Tech District, CA 90210, United States"
              />
            </div>
          }

          <button
            onClick={handleSaveCompanyInfo}
            disabled={saveLoading}
            className={`w-full py-2 px-4 rounded-lg text-xs font-semibold transition-all duration-200 ${saveLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-600 shadow-yellow-200  text-white hover:scale-105'}`}
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* ================= Password Update Card ================= */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Change Password</h2>

          {/* Current Password */}
          <div className="mb-3 relative">
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Current Password</label>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordInfo.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              className="absolute right-2 top-8 text-gray-500 text-xs"
              onClick={() => setShowCurrentPassword(prev => !prev)}
            >
              {showCurrentPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* New Password */}
          <div className="mb-3 relative">
            <label className="text-xs font-semibold text-gray-700 mb-1 block">New Password</label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={passwordInfo.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              className="absolute right-2 top-8 text-gray-500 text-xs"
              onClick={() => setShowNewPassword(prev => !prev)}
            >
              {showNewPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="mb-3 relative">
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Confirm Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordInfo.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              className="absolute right-2 top-8 text-gray-500 text-xs"
              onClick={() => setShowConfirmPassword(prev => !prev)}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={passwordLoading}
            className={`w-full py-2 px-4 rounded-lg text-xs font-semibold transition-all duration-200 ${passwordLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-600 shadow-yellow-200 text-white hover:scale-105'}`}
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
