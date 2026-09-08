import { apiFetch } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type { Exchange } from '@/lib/types';
import TradeRow from '@/components/TradeRow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Duplicate = {
  hpId: string;
  name: string;
  image: string;
  availableForTrade: number;
};

type AlbumCard = {
  hpId: string;
  name: string;
  image: string | null;
  quantity: number;
};

export default function TradesPage() {
  const [openTrades, setOpenTrades] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [album, setAlbum] = useState<AlbumCard[]>([]);
  const [offeredHpId, setOfferedHpId] = useState('');
  const [requestedHpId, setRequestedHpId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [proposeError, setProposeError] = useState('');
  const [myTrades, setMyTrades] = useState<Exchange[]>([]);
  const [history, setHistory] = useState<Exchange[]>([]);

  async function loadData() {
    const [tradesRes, dupRes, albumRes, mineRes, histRes] = await Promise.all([
      apiFetch('/api/exchanges'),
      apiFetch('/api/album/duplicates'),
      apiFetch('/api/album'),
      apiFetch('/api/exchange/user'),
      apiFetch('/api/exchange/completed'),
    ]);
    const [tradesData, dupData, albumData, mineData, histData] =
      await Promise.all([
        tradesRes.json(),
        dupRes.json(),
        albumRes.json(),
        mineRes.json(),
        histRes.json(),
      ]);
    setOpenTrades(tradesData.exchanges);
    setDuplicates(dupData.duplicates);
    setAlbum(albumData.album);
    setMyTrades(mineData.exchanges);
    setHistory(histData.exchanges);
    setLoading(false);
  }

  async function handlePropose() {
    setProposeError('');
    const response = await apiFetch('/api/exchange/propose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offeredHpId, requestedHpId }),
    });
    const data = await response.json();

    if (!response.ok) {
      setProposeError(data.error || data.message || 'Could not propose trade');
      return;
    }

    setOfferedHpId('');
    setRequestedHpId('');
    setDialogOpen(false);
    loadData();
  }

  async function handleCancel(exchangeId: string) {
    await apiFetch(`/api/exchange/${exchangeId}`, { method: 'DELETE' });
    loadData();
  }

  async function handleAccept(exchangeId: string) {
    const response = await apiFetch('/api/exchange/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exchangeId }),
    });
    if (!response.ok) {
      const data = await response.json();
      alert(data.error || data.message || 'Could not accept trade');
    }
    loadData();
  }

  const missing = album.filter((c) => c.quantity === 0);
  function ownedQuantity(hpId: string) {
    return album.find((c) => c.hpId === hpId)?.quantity ?? 0;
  }
  useEffect(() => {
    // The setState calls in loadData run after await, not synchronously:
    // the rule's static analysis can't tell the difference. Fetched data
    // can't be derived during render, so an effect is the right place here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  if (loading) return <p className="p-6">Loading trades…</p>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Trades</h1>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-6">Propose a trade</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Propose a trade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">You give</label>
              <select
                value={offeredHpId}
                onChange={(e) => setOfferedHpId(e.target.value)}
                className="w-full rounded-md border p-2"
              >
                <option value="">Select a duplicate…</option>
                {duplicates
                  .filter((d) => d.availableForTrade > 0)
                  .map((d) => (
                    <option key={d.hpId} value={d.hpId}>
                      {d.name} (×{d.availableForTrade})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">You want</label>
              <select
                value={requestedHpId}
                onChange={(e) => setRequestedHpId(e.target.value)}
                className="w-full rounded-md border p-2"
              >
                <option value="">Select a missing card…</option>
                {missing.map((c) => (
                  <option key={c.hpId} value={c.hpId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {proposeError && (
              <p className="text-sm text-destructive">{proposeError}</p>
            )}
            <Button
              onClick={handlePropose}
              disabled={!offeredHpId || !requestedHpId}
            >
              Send proposal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">Open ({openTrades.length})</TabsTrigger>
          <TabsTrigger value="pending">Your pending</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <ul className="space-y-3">
            {openTrades.map((trade) => {
              const canAccept = ownedQuantity(trade.requestedHpId) >= 2;
              const alreadyOwns = ownedQuantity(trade.offeredHpId) > 0;

              return (
                <TradeRow key={trade._id} trade={trade}>
                  {!canAccept ? (
                    <Button size="sm" disabled>
                      Need a duplicate
                    </Button>
                  ) : alreadyOwns ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          Accept
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            You already own this card
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            You already have {trade.offeredCardName}. Accepting
                            will give you a duplicate. Continue?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Never mind</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleAccept(trade._id)}
                          >
                            Accept anyway
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button size="sm" onClick={() => handleAccept(trade._id)}>
                      Accept
                    </Button>
                  )}
                </TradeRow>
              );
            })}
          </ul>
        </TabsContent>

        <TabsContent value="pending">
          <ul className="space-y-3">
            {myTrades.map((trade) => (
              <TradeRow key={trade._id} trade={trade}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this trade?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your {trade.offeredCardName} will be available for
                        trading again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep it</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCancel(trade._id)}
                      >
                        Yes, cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TradeRow>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="history">
          <ul className="space-y-3">
            {history.map((trade) => (
              <TradeRow key={trade._id} trade={trade}>
                {trade.acceptorName && (
                  <span className="shrink-0 text-sm text-muted-foreground">
                    accepted by {trade.acceptorName}
                  </span>
                )}
              </TradeRow>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
