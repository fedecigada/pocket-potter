import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
const HOUSE_STYLES: Record<string, string> = {
  Gryffindor: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200',
  Slytherin:
    'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  Ravenclaw: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
  Hufflepuff:
    'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
};

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
        <Skeleton className="mb-8 h-9 w-full sm:w-48" />
        <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </>
    );
  }

  return (
    <>
      <h1 className="font-decorative mb-6 flex flex-wrap items-center gap-3 text-2xl">
        Welcome back, {account.username}
        {account.housePreference && (
          <span
            className={`rounded-full px-3 py-1 font-sans text-xs font-semibold ${
              HOUSE_STYLES[account.housePreference] ?? 'bg-muted'
            }`}
          >
            {account.housePreference}
          </span>
        )}
      </h1>

      <div className="mb-8">
        {account.credits === 0 ? (
          <Button asChild className="w-full sm:w-auto">
            <Link to="/shop">
              {account.statistics.totalCards === 0
                ? 'Buy credits to open your first pack'
                : 'Buy credits to open a pack'}
            </Link>
          </Button>
        ) : account.statistics.completionPercentage < 100 ? (
          <Button asChild className="w-full sm:w-auto">
            <Link to="/shop">Open a pack</Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/trades">Browse trades</Link>
          </Button>
        )}
      </div>

      <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="px-2 pt-4 pb-2 text-center sm:pt-8 sm:pb-4">
            <p className="text-2xl font-bold sm:text-4xl">{account.credits}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">Credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-2 pt-4 pb-2 text-center sm:pt-8 sm:pb-4">
            <p className="text-2xl font-bold sm:text-4xl">
              {account.statistics.uniqueCards}
              <span className="text-muted-foreground text-base sm:text-xl">
                /{account.statistics.totalCollectionSize}
              </span>
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Cards collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-2 pt-4 pb-2 text-center sm:pt-8 sm:pb-4">
            <p className="text-2xl font-bold sm:text-4xl">
              {account.statistics.completedExchanges}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Trades done
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
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
    </>
  );
}

export default DashboardPage;
