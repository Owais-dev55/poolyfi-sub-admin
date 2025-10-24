import { useNavigate } from 'react-router-dom';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return <ForgotPasswordForm onBackToLogin={handleBackToLogin} />;
};

export default ForgotPasswordPage;
