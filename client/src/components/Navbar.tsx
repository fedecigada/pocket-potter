import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }
  return (
    <nav className="border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-8 py-4">
        <Link to="/" className="text-xl font-bold">
          Pocket Potter
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/album">Album</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/scambi">Scambi</Link>
          <Link to="/guida">Guida</Link>
          <Button variant="outline" onClick={handleLogout}>
            Esci
          </Button>
        </div>
      </div>
    </nav>
  );
}
