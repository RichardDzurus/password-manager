import { useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const { isAuthenticated, login } = useAuth();

  const onSubmitForm = (data: { email: string; password: string }) => {
    login(data.email, data.password);
  };

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);
  return <LoginForm formType="login" onSubmitForm={onSubmitForm} />;
};

export default Login;
