import { useState, useEffect } from 'react';
import { customToast } from '../utils/useCustomToast';
import { forgotPassword, verifyOtp, resetPassword, handleApiError } from '../apis/user/api';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-focus first OTP input when OTP screen loads
  useEffect(() => {
    if (isOtpSent) {
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
    }
  }, [isOtpSent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'otp') {
      setOtp(value);
    } else if (name === 'newPassword') {
      setNewPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);
    
    // Update the combined OTP string
    const combinedOtp = newOtpDigits.join('');
    setOtp(combinedOtp);

    // Auto-focus next input if current input has a value
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        if (/^\d{6}$/.test(text)) {
          const digits = text.split('');
          setOtpDigits(digits);
          setOtp(text);
          // Focus the last input
          const lastInput = document.getElementById('otp-5');
          lastInput?.focus();
        }
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await forgotPassword(email);
      
      if (!response.hasError) {
        setIsOtpSent(true);
        customToast.success('OTP has been sent to your email address.');
      } else {
        customToast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      customToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await verifyOtp(email, otp);
      
      if (!response.hasError) {
        setIsOtpVerified(true);
        customToast.success('OTP verified successfully! You can now set your new password.');
      } else {
        customToast.error(response.message || 'Invalid OTP. Please enter the correct verification code.');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      customToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      customToast.error('Passwords do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      customToast.error('Password must be at least 6 characters long.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await resetPassword(email, otp, newPassword);
      
      if (!response.hasError) {
        customToast.success('Password has been reset successfully! You can now sign in with your new password.');
        onBackToLogin();
      } else {
        customToast.error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      customToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    
    try {
      const response = await forgotPassword(email);
      
      if (!response.hasError) {
        customToast.success('OTP has been resent to your email address.');
      } else {
        customToast.error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      customToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // New Password Setting Screen
  if (isOtpVerified) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(150deg,rgb(255, 242, 188) 30%, #f3f4f6)'
        }}
      >
        <div className="max-w-sm w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/poolify-logo.png" 
                    alt="Pooyfi Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Poolyfi</h2>
              <p className="mt-1 text-sm text-gray-600">
                Set your new password
              </p>
            </div>

            {/* New Password Form */}
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 pr-10 text-sm rounded-md shadow-sm focus:outline-none border border-gray-300 focus:ring-[#FFCB44] focus:border-[#FFCB44]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showNewPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 pr-10 text-sm rounded-md shadow-sm focus:outline-none border border-gray-300 focus:ring-[#FFCB44] focus:border-[#FFCB44]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <p>
                  Password must be at least 6 characters long.
                </p>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#FFC11E] hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC11E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Setting Password...
                    </div>
                  ) : (
                    'Set New Password'
                  )}
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-xs font-medium text-black hover:text-gray-700 transition-colors cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification Screen
  if (isOtpSent) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(150deg,rgb(255, 242, 188) 30%, #f3f4f6)'
        }}
      >
        <div className="max-w-sm w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/poolify-logo.png" 
                    alt="Pooyfi Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Poolyfi</h2>
              <p className="mt-1 text-sm text-gray-600">
                Enter verification code
              </p>
            </div>

            {/* OTP Form */}
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Verification Code
                </label>
                <div className="flex justify-center space-x-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFCB44] focus:border-[#FFCB44] transition-colors"
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <p>
                  We've sent a 6-digit verification code to <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading || otpDigits.some(digit => digit === '')}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#FFC11E] hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC11E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-xs font-medium text-black hover:text-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Didn't receive the code? Resend
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-xs font-medium text-black hover:text-gray-700 transition-colors cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Initial Email Input Screen

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(150deg,rgb(255, 242, 188) 30%, #f3f4f6)'
      }}
    >
      <div className="max-w-sm w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/poolify-logo.png" 
                  alt="Pooyfi Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Poolyfi</h2>
            <p className="mt-1 text-sm text-gray-600">
              Reset your password
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSendOtp}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Company Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleInputChange}
                placeholder="admin@poolyfi.com"
                className="w-full px-3 py-2 text-sm rounded-md shadow-sm placeholder-gray-400 focus:outline-none border border-gray-300 focus:ring-[#FFCB44] focus:border-[#FFCB44]"
              />
            </div>

            <div className="text-xs text-gray-600">
              <p>
                Enter your company email address and we'll send you a verification code to reset your password.
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#FFC11E] hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC11E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </div>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-sm font-medium text-black hover:text-gray-700 transition-colors cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
