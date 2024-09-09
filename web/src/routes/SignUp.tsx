import { useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

const SignUp: React.FC = () => {
  const { isAuthenticated, signUp } = useAuth();

  const onSubmitForm = (data: { email: string; password: string }) => {
    signUp(data.email, data.password);
  };

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  return <LoginForm formType="signup" onSubmitForm={onSubmitForm} />;
};

export default SignUp;
