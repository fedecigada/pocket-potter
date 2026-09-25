import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import ThemeToggle from '@/components/ThemeToggle';

const links = [
  { to: '/album', label: 'Album' },
  { to: '/shop', label: 'Shop' },
  { to: '/trades', label: 'Trades' },
  { to: '/guide', label: 'Guide' },
];

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }
  return (
    <nav className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-logo text-4xl font-black tracking-wide">
          PocketPotter
        </Link>
        <div className="hidden items-center gap-6 sm:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
          <Button variant="outline" onClick={handleLogout}>
            Sign out
          </Button>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                aria-label="Open menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" aria-describedby={undefined}>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="mt-8 flex flex-col gap-4 px-4">
                {links.map((link) => (
                  <SheetClose asChild key={link.to}>
                    <Link to={link.to} className="text-lg">
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button variant="outline" onClick={handleLogout}>
                    Sign out
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
