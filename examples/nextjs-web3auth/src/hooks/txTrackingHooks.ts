'use client';

import { createTxTrackingStore } from '@tuwa/evm-transactions-tracking';
import { createBoundedUseStore } from '@tuwa/web3-transactions-tracking-core';

import { appChains } from '@/constants';
import { onSucceedCallbacks, TransactionUnion } from '@/transactions/onSucceedCallbacks';

const storageName = 'transactions-tracking-storage';

export const useTxTrackingStore = createBoundedUseStore(
  createTxTrackingStore<TransactionUnion>({
    name: storageName,
    appChains,
    onSucceedCallbacks,
  }),
);
