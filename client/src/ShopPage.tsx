import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

export default function ShopPage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [buying, setBuying] = useState(false);
  const [lastCards, setLastCards] = useState<
    { name: string; image: string; isNew: boolean }[]
  >([]);
  const [packId, setPackId] = useState(0);
  const [error, setError] = useState('');
  const cardsRef = useRef<HTMLDivElement>(null);

  async function buyCredits(amount: number) {
    setBuying(true);
    setError('');
    try {
      const response = await apiFetch('/api/purchase-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits: amount }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Could not buy credits');
      } else {
        setCredits(data.credits);
      }
    } catch {
      setError('Network error');
    } finally {
      setBuying(false);
    }
  }

  async function buyPack(endpoint: string) {
    setBuying(true);
    setError('');
    try {
      const response = await apiFetch(endpoint, { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Could not buy pack');
      } else {
        setCredits(data.remainingCredits);
        setLastCards(data.cards);
        setPackId((n) => n + 1);
        setTimeout(() => {
          cardsRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 50);
      }
    } catch {
      setError('Network error');
    } finally {
      setBuying(false);
    }
  }

  useEffect(() => {
    async function loadAccount() {
      try {
        const response = await apiFetch('/api/account');
        const data = await response.json();
        setCredits(data.account.credits);
      } catch {
        setError('Could not load your credits');
      }
    }
    loadAccount();
  }, []);

  return (
    <>
      <h1 className="font-decorative mb-6 text-2xl font-semibold">Shop</h1>
      <p className="text-muted-foreground mt-2">
        Credits:{' '}
        <span className="text-foreground font-semibold">{credits ?? '…'}</span>
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
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
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button
          onClick={() => buyPack('/api/purchase-pack')}
          disabled={buying || (credits ?? 0) < 1}
        >
          Buy pack (5 cards - 1 credit)
        </Button>
        <Button
          onClick={() => buyPack('/api/purchase-maxi-pack')}
          disabled={buying || (credits ?? 0) < 3}
        >
          Buy maxi pack (9 cards - 3 credits)
        </Button>
      </div>
      {error && <p className="text-destructive mt-4">{error}</p>}
      {lastCards.length > 0 && (
        <div ref={cardsRef} className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">You got:</h2>
          <div key={packId} className="grid grid-cols-3 gap-4 sm:grid-cols-5">
            {lastCards.map((card, i) => (
              <div key={card.name + i}>
                <div
                  className="pack-card"
                  style={
                    { '--card-delay': `${i * 150}ms` } as React.CSSProperties
                  }
                >
                  <div className="pack-card-inner">
                    <div className="pack-card-face">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="pack-card-face pack-card-back flex items-center justify-center rounded-xl bg-black">
                      <div className="absolute inset-1 rounded-lg border border-white" />
                      <span className="card-back-text text-3xl text-white sm:text-4xl">
                        P<span className="inline-block translate-y-1">P</span>
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-xs">
                  {card.name}
                  {card.isNew && (
                    <span className="ml-1 rounded bg-amber-400 px-1 text-[10px] font-bold text-amber-950">
                      NEW
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
