import type { ReactNode } from 'react';
import type { Exchange } from '@/lib/types';

type TradeRowProps = {
  trade: Exchange;
  children?: ReactNode;
};

export default function TradeRow({ trade, children }: TradeRowProps) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <img
          src={trade.offeredImage}
          alt={trade.offeredCardName}
          className="h-12 w-9 rounded object-cover"
        />
        <span>{trade.offeredCardName}</span>
        <span className="text-muted-foreground">⇄</span>
        <img
          src={trade.requestedImage}
          alt={trade.requestedCardName}
          className="h-12 w-9 rounded object-cover"
        />
        <span>{trade.requestedCardName}</span>
      </div>
      {children}
    </li>
  );
}
