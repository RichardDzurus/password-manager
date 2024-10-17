import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { RecoilRoot } from 'recoil';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </RecoilRoot>
  </StrictMode>,
);
