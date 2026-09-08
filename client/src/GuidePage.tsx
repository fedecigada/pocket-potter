import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Character = {
  hpId: string;
  index: number;
  name: string;
  house: string;
  image: string;
};
type CharacterDetails = {
  name: string;
  house: string;
  species: string;
  ancestry: string;
  patronus: string;
  wand: { wood: string; core: string; length: number };
};

function displayValue(value: string | undefined) {
  return value && value.trim() !== '' ? value : 'unknown';
}

function displayWand(wand: CharacterDetails['wand'] | undefined) {
  const parts = [wand?.wood, wand?.core].filter((p) => p && p.trim() !== '');
  return parts.length > 0 ? parts.join(' / ') : 'unknown';
}

export default function GuidePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const filtered = characters.filter((char) =>
    char.name.toLowerCase().includes(query.toLowerCase()),
  );
  const [selected, setSelected] = useState<CharacterDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  async function openDetails(char: Character) {
    setSelectedImage(char.image);
    setDetailsLoading(true);
    const response = await apiFetch(`/api/characters/details/${char.hpId}`);
    const data = await response.json();
    setSelected(data);
    setDetailsLoading(false);
  }

  useEffect(() => {
    async function loadCharacters() {
      const response = await apiFetch('/api/characters');
      const data = await response.json();
      setCharacters(data.characters);
      setLoading(false);
    }
    loadCharacters();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <>
      <h1 className="font-decorative mb-6 text-2xl font-semibold">Guide</h1>
      <Input
        type="search"
        placeholder="Search for a character..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-6"
      />
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No characters found.</p>
      ) : (
        <ul className="divide-y">
          {filtered.map((char) => (
            <li key={char.hpId}>
              {/* Arrow function needed to pass an argument: openDetails(char)
                would run immediately on render. This passes a function that
                runs openDetails with that character only when clicked. */}
              <button
                onClick={() => openDetails(char)}
                className="flex w-full items-center gap-4 py-3 text-left hover:bg-accent"
              >
                <img
                  src={char.image}
                  alt={char.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{char.name}</p>
                  <p className="text-sm text-muted-foreground">{char.house}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="flex gap-4">
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt={selected?.name}
                  className="aspect-3/4 w-32 shrink-0 rounded-xl object-cover"
                />
              )}
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">House:</span>{' '}
                  {displayValue(selected?.house)}
                </p>
                <p>
                  <span className="font-medium">Species:</span>{' '}
                  {displayValue(selected?.species)}
                </p>
                <p>
                  <span className="font-medium">Ancestry:</span>{' '}
                  {displayValue(selected?.ancestry)}
                </p>
                <p>
                  <span className="font-medium">Patronus:</span>{' '}
                  {displayValue(selected?.patronus)}
                </p>
                <p>
                  <span className="font-medium">Wand:</span>{' '}
                  {displayWand(selected?.wand)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
