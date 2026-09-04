import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function ShopPage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [buying, setBuying] = useState(false);
  const [lastCards, setLastCards] = useState<{ name: string; image: string }[]>(
    [],
  );
  const [error, setError] = useState('');

  async function buyCredits(amount: number) {
    setBuying(true);
    setError('');
    const response = await apiFetch('/api/purchase-credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credits: amount }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message);
    } else {
      setCredits(data.credits);
    }
    setBuying(false);
  }

  async function buyPack(endpoint: string) {
    setBuying(true);
    setError('');
    const response = await apiFetch(endpoint, { method: 'POST' });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message);
    } else {
      setCredits(data.remainingCredits);
      setLastCards(data.cards);
    }
    setBuying(false);
  }

  useEffect(() => {
    async function loadAccount() {
      const response = await apiFetch('/api/account');
      const data = await response.json();
      setCredits(data.account.credits);
    }
    loadAccount();
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-8">
      <h1 className="text-2xl font-bold">Shop</h1>
      <p className="mt-2 text-muted-foreground">Credits: {credits ?? '...'}</p>
      <div className="mt-6 flex gap-4">
        <Button
          variant="outline"
          onClick={() => buyCredits(5)}
          disabled={buying}
        >
          Buy 5 credits
        </Button>
        <Button
          variant="outline"
          onClick={() => buyCredits(10)}
          disabled={buying}
        >
          Buy 10 credits
        </Button>
      </div>
      <div className="mt-6 flex gap-4">
        <Button onClick={() => buyPack('/api/purchase-pack')} disabled={buying}>
          Buy pack (5 cards — 1 credit)
        </Button>
        <Button
          variant="secondary"
          onClick={() => buyPack('/api/purchase-maxi-pack')}
          disabled={buying}
        >
          Buy maxi pack (9 cards — 3 credits)
        </Button>
      </div>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {lastCards.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">You got:</h2>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
            {lastCards.map((card, i) => (
              <div key={i}>
                <img
                  src={card.image}
                  alt={card.name}
                  className="aspect-3/4 w-full rounded-xl object-cover"
                />
                <p className="mt-1 text-xs">{card.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
