import { Link } from 'react-router-dom';
import { Button, buttonVariants } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div>
      <h1>Home</h1>
      <p>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</p>
      <p>user: {user ? user.email : 'anonym'}</p>
      {isAuthenticated ? (
        <Button onClick={logout}>Log out</Button>
      ) : (
        <Link to="/login" className={buttonVariants({ variant: 'outline' })}>
          Log in
        </Link>
      )}
    </div>
  );
};

export default Home;
