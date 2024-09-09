import { useState } from 'react';
import { CryptoData } from '../types/CryptoData';

const DEFAULT_CRYPTO_DATA: CryptoData = {
  cryptoKey: null,
  iv: null,
  salt: null,
};

export const useCryptoData = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData>(DEFAULT_CRYPTO_DATA);

  const clearCryptoData = () => setCryptoData({ ...DEFAULT_CRYPTO_DATA });

  return { cryptoData, setCryptoData, clearCryptoData };
};
