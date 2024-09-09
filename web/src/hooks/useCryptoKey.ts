import { useState } from 'react';
import { CryptoData } from '../types/CryptoData';

export const useCryptoData = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);

  const clearCryptoData = () => setCryptoData(null);

  return { cryptoData, setCryptoData, clearCryptoData };
};
