import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { baseUrl } from '@/lib/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [slowServer, setSlowServer] = useState(false);

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    handleLogin();
  }

  async function handleLogin() {
    setError('');
    setLoading(true);
    const slowTimer = setTimeout(() => setSlowServer(true), 3000);

    try {
      const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      navigate('/');
    } catch {
      setError('Network error');
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlowServer(false);
    }
  }

  return (
    <div className="bg-muted flex min-h-svh items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-logo text-center text-4xl font-black tracking-wide">
            PocketPotter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            {slowServer && (
              <p className="text-muted-foreground text-center text-sm">
                Starting the server - free hosting puts it to sleep when unused.
                This can take up to a minute.
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
