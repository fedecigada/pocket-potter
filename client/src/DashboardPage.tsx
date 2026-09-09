import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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

  if (!account) {
    return (
      <>
        <Skeleton className="mb-6 h-8 w-64" />
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="mb-8 h-3 w-full rounded-full" />
        <Skeleton className="h-9 w-48" />
      </>
    );
  }

  return (
    <>
      <h1 className="font-decorative mb-6 text-2xl">
        Welcome back, {account.username}
      </h1>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold">{account.credits}</p>
            <p className="text-muted-foreground text-sm">Credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold">
              {account.statistics.uniqueCards}
              <span className="text-muted-foreground text-xl">
                /{account.statistics.totalCollectionSize}
              </span>
            </p>
            <p className="text-muted-foreground text-sm">Cards collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold">
              {account.statistics.completedExchanges}
            </p>
            <p className="text-muted-foreground text-sm">Trades completed</p>
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
        <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all"
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
    </>
  );
}

export default DashboardPage;
