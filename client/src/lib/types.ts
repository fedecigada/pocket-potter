export type Exchange = {
  _id: string;
  offeredHpId: string;
  offeredCardName: string;
  offeredImage: string;
  offeredHouse: string;
  requestedHpId: string;
  requestedCardName: string;
  requestedImage: string;
  requestedHouse: string;
  status: 'pending' | 'processing' | 'completed';
  proposerName?: string;
  acceptorName?: string;
};
