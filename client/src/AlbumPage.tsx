import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
const gridClasses =
  'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
type Card = {
  hpId: string;
  name: string;
  image: string | null;
  quantity: number;
  house: string;
};

export default function AlbumPage() {
  const [album, setAlbum] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    async function loadAlbum() {
      const [charsRes, albumRes] = await Promise.all([
        apiFetch('/api/characters'),
        apiFetch('/api/album'),
      ]);
      const charsData = await charsRes.json();
      const albumData = await albumRes.json();

      const chars = charsData.characters;
      const albumList = albumData.album;

      const imageById = new Map(chars.map((c: Card) => [c.hpId, c.image]));

      const merged = albumList.map((card: Card) => ({
        ...card,
        image: card.image ?? imageById.get(card.hpId) ?? null,
      }));

      setAlbum(merged);
      setLoading(false);
    }
    loadAlbum();
  }, []);

  if (loading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-3/4 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <h1 className="font-decorative mb-6 text-2xl font-semibold">Album</h1>
      <div className={gridClasses}>
        {album.map((card: Card) => (
          <div key={card.hpId} className="relative">
            <button
              onClick={() => card.quantity > 0 && setSelectedCard(card)}
              disabled={card.quantity === 0}
              className="w-full"
            >
              <img
                src={card.image ?? ''}
                alt={card.name}
                className={`aspect-3/4 w-full rounded-xl object-cover transition-transform duration-200 ${
                  card.quantity === 0
                    ? 'opacity-30 grayscale'
                    : 'hover:scale-105'
                }`}
              />
            </button>
            {card.quantity > 0 && (
              <Badge className="absolute top-2 right-2">x{card.quantity}</Badge>
            )}
          </div>
        ))}
        <Dialog
          open={selectedCard !== null}
          onOpenChange={() => setSelectedCard(null)}
        >
          <DialogContent
            style={{
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
            }}
            className="w-70 max-w-70 p-0 outline-none sm:max-w-70 [&>button]:hidden"
          >
            <div className="card-flip-scene">
              <div className="card-flip-spinner aspect-3/4 w-full">
                <img
                  src={selectedCard?.image ?? ''}
                  alt={selectedCard?.name}
                  className="card-face h-full w-full rounded-2xl object-cover"
                />
                <div className="card-face card-face-back flex items-center justify-center rounded-2xl bg-black">
                  <div className="absolute inset-2 rounded-xl border-2 border-white" />
                  <span className="card-back-text text-7xl text-white">
                    P<span className="inline-block translate-y-3">P</span>
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
