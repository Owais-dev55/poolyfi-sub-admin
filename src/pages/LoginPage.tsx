import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  const handleLogin = () => {
    // Login is now handled directly in LoginForm component
  };

  return <LoginForm onLogin={handleLogin} />;
};

export default LoginPage;
