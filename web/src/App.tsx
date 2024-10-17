import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SignUp from './routes/SignUp';
import Login from './routes/Login';
import Home from './routes/Home';
import './App.css';
import EntriesList from './routes/EntriesList';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/entries',
    element: <EntriesList />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
