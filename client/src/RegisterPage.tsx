import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { baseUrl } from '@/lib/api';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [housePreference, setHousePreference] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [slowServer, setSlowServer] = useState(false);

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    handleRegister();
  }

  async function handleRegister() {
    setError('');
    setLoading(true);
    const slowTimer = setTimeout(() => setSlowServer(true), 3000);
    try {
      const response = await fetch(`${baseUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, housePreference }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || 'Registration failed');
        return;
      }

      navigate('/login');
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
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
              value={housePreference}
              onChange={(e) => setHousePreference(e.target.value)}
            >
              <option value="">Choose your house (optional)</option>
              <option value="Gryffindor">Gryffindor</option>
              <option value="Hufflepuff">Hufflepuff</option>
              <option value="Ravenclaw">Ravenclaw</option>
              <option value="Slytherin">Slytherin</option>
            </select>
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
              {loading ? 'Creating account…' : 'Sign up'}
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterPage;
