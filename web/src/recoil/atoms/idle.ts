import { atom } from 'recoil';

export const idleState = atom<boolean>({
  key: 'idleState',
  default: false,
});

export const idleTimeoutIdState = atom<NodeJS.Timeout | null>({
  key: 'idleTimeoutIdState',
  default: null,
});

export const idleListenersState = atom<boolean>({
  key: 'idleListenersState',
  default: false,
});
