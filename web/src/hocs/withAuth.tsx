import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export const withAuth = (Component: React.FC): React.FC => {
  const WrapperComponent: React.FC = (props) => {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
      if (!isAuthenticated) {
        window.location.href = '/login';
      }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
      return <></>;
    }

    return <Component {...props} />;
  };

  return WrapperComponent;
};
