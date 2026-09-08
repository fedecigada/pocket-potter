import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type Account = {
  username: string;
  housePreference: string;
  credits: number;
  statistics: {
    totalCards: number;
    uniqueCards: number;
    duplicateCards: number;
    totalCollectionSize: number;
    completionPercentage: number;
    completedExchanges: number;
    houseDistribution: Record<string, number>;
  };
};

function DashboardPage() {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    async function loadAccount() {
      const response = await apiFetch('/api/account');
      const data = await response.json();
      setAccount(data.account);
    }
    // The setState runs after await, not synchronously: the rule's static
    // analysis can't tell the difference, and fetched data can't be derived
    // during render.

    loadAccount();
  }, []);

  if (!account) return <p className="p-6">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Welcome back, {account.username}
      </h1>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold">{account.credits}</p>
            <p className="text-sm text-muted-foreground">Credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold">
              {account.statistics.uniqueCards}
              <span className="text-xl text-muted-foreground">
                /{account.statistics.totalCollectionSize}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">Cards collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold">
              {account.statistics.completedExchanges}
            </p>
            <p className="text-sm text-muted-foreground">Trades completed</p>
          </CardContent>
        </Card>
      </div>
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium">Collection progress</span>
          <span className="text-muted-foreground">
            {account.statistics.completionPercentage}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${account.statistics.completionPercentage}%` }}
          />
        </div>
      </div>

      <div>
        {account.credits === 0 ? (
          <Button asChild>
            <Link to="/shop">Buy credits to open your first pack</Link>
          </Button>
        ) : account.statistics.completionPercentage < 100 ? (
          <Button asChild>
            <Link to="/shop">Open a pack</Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/trades">Browse trades</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
