import { useInitializeTransactionsPool } from '@tuwa/evm-transactions-tracking';
import { TransactionsWidget } from '@tuwa/transactions-tracking-ui/dist/providers';
import { useAccount } from 'wagmi';

import { appChains, config } from '../configs/wagmiConfig';
import { useTxTrackingStore } from '../hooks/txTrackingHooks';
import { txActions } from '../transactions/actions';

export function TxWidgetProvider() {
  const transactionsPool = useTxTrackingStore((state) => state.transactionsPool);
  const initialTx = useTxTrackingStore((state) => state.initialTx);
  const closeTxTrackedModal = useTxTrackingStore((state) => state.closeTxTrackedModal);
  const handleTransaction = useTxTrackingStore((state) => state.handleTransaction);
  const initializeTransactionsPool = useTxTrackingStore((state) => state.initializeTransactionsPool);

  useInitializeTransactionsPool(initializeTransactionsPool);

  const { address, chain } = useAccount();

  return (
    <TransactionsWidget
      appChains={appChains}
      transactionsPool={transactionsPool}
      initialTx={initialTx}
      closeTxTrackedModal={closeTxTrackedModal}
      config={config}
      handleTransaction={handleTransaction}
      actions={txActions}
      chain={chain}
      walletAddress={address}
    />
  );
}
