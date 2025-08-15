// JUST for test

'use client';

import { createViemClient } from '@tuwa/evm-transactions-tracking';
import { TxActionButton } from '@tuwa/transactions-tracking-ui';
import { ReactNode, useEffect, useState } from 'react';
import { Client } from 'viem';
import { readContract } from 'viem/actions';
import { sepolia } from 'viem/chains';

import { CounterAbi } from '@/abis/CounterAbi';
import { appChains, config } from '@/configs/wagmiConfig';
import { COUNTER_ADDRESS } from '@/constants';
import { useTxTrackingStore } from '@/hooks/txTrackingHooks';
import { TxAction, txActions } from '@/transactions/actions';
import { TxType } from '@/transactions/onSucceedCallbacks';

export const TransactionsBlockWrapper = ({ connectWidget }: { connectWidget: ReactNode }) => {
  const handleTransaction = useTxTrackingStore((state) => state.handleTransaction);
  const transactionsPool = useTxTrackingStore((state) => state.transactionsPool);
  const getLastTxKey = useTxTrackingStore((state) => state.getLastTxKey);

  const [currentCount, setCurrentCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  const fetchCurrentCount = async () => {
    try {
      setIsLoadingCount(true);
      const count = Number(
        await readContract(createViemClient(sepolia.id, appChains) as Client, {
          abi: CounterAbi,
          address: COUNTER_ADDRESS,
          functionName: 'getCurrentNumber',
        }),
      );
      setCurrentCount(count);
    } catch (error) {
      console.error('Error fetching current count:', error);
      setCurrentCount(null);
    } finally {
      setIsLoadingCount(false);
    }
  };

  useEffect(() => {
    fetchCurrentCount();
  }, []);

  const handleIncrement = async () => {
    if (currentCount === null) return;

    await handleTransaction({
      config,
      actionFunction: () => txActions.increment({ config }),
      params: {
        type: TxType.increment,
        desiredChainID: sepolia.id,
        actionKey: TxAction.increment,
        title: ['Incrementing', 'Incremented', 'Error when increment', 'Increment tx replaced'],
        description: [
          `Value after incrementing ${currentCount + 1}`,
          `Success. Current value is ${currentCount + 1}`,
          'Something went wrong when increment.',
          'Transaction replaced. Please take a look details in your wallet.',
        ],
        payload: {
          value: currentCount,
        },
        withTrackedModal: true,
      },
    });

    setTimeout(() => {
      fetchCurrentCount();
    }, 2000);
  };

  const openEtherscan = () => {
    window.open(`https://sepolia.etherscan.io/address/${COUNTER_ADDRESS}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full bg-gradient-to-br from-[var(--tuwa-bg-secondary)] to-[var(--tuwa-bg-muted)] p-4 h-[100dvh] flex overflow-y-auto">
      <div className="m-auto w-full max-w-md h-auto min-h-[680px] bg-[var(--tuwa-bg-primary)] rounded-2xl shadow-2xl border border-[var(--tuwa-border-primary)] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] p-6 flex-shrink-0">
          <div className="flex-1 pr-4">
            <h1 className="text-2xl font-bold text-[var(--tuwa-text-on-accent)] mb-1 leading-tight">TUWA Demo</h1>
            <p className="text-blue-100 text-sm leading-tight">Transaction Tracking Example</p>
          </div>

          <div className="flex items-center justify-end min-w-[180px] mt-2.5">
            <div className="transform transition-all duration-200 ease-in-out">{connectWidget}</div>
          </div>
        </div>

        <div className="flex-1 p-8 space-y-8">
          <div className="text-center h-16 flex flex-col justify-center">
            <h2 className="text-xl font-semibold text-[var(--tuwa-text-primary)] mb-2 leading-tight">
              Smart Contract Interaction
            </h2>
            <p className="text-[var(--tuwa-text-secondary)] text-sm leading-tight">
              Test transaction tracking with a simple counter contract
            </p>
          </div>

          {/* Separator */}
          <div className="border-t border-[var(--tuwa-border-primary)]"></div>

          {/* Action Section */}
          <div className="space-y-6 flex-1">
            <div className="bg-[var(--tuwa-bg-secondary)] rounded-xl p-4 border border-[var(--tuwa-border-secondary)] min-h-[100px] flex flex-col justify-center">
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[var(--tuwa-info-bg)] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[var(--tuwa-text-accent)] font-bold text-lg">#</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-[var(--tuwa-text-primary)] leading-tight">Counter Contract</h3>
                    <p className="text-xs text-[var(--tuwa-text-tertiary)] leading-tight">Sepolia Testnet</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-[var(--tuwa-text-secondary)] leading-tight">Contract</div>
                  <button
                    onClick={openEtherscan}
                    className="text-xs font-mono text-[var(--tuwa-text-accent)] hover:text-[var(--tuwa-button-gradient-from-hover)] leading-tight cursor-pointer transition-colors duration-200 underline hover:no-underline"
                  >
                    {COUNTER_ADDRESS.slice(0, 6)}...{COUNTER_ADDRESS.slice(-4)}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center pt-2 border-t border-[var(--tuwa-border-secondary)]">
                <div className="text-center">
                  <div className="text-xs text-[var(--tuwa-text-tertiary)] mb-1">Current Value</div>
                  <div className="text-2xl font-bold text-[var(--tuwa-text-accent)]">
                    {isLoadingCount ? (
                      <div className="animate-pulse">...</div>
                    ) : currentCount !== null ? (
                      currentCount
                    ) : (
                      <span className="text-[var(--tuwa-error-text)] text-sm">Error</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-14">
                <TxActionButton
                  action={handleIncrement}
                  transactionsPool={transactionsPool}
                  getLastTxKey={getLastTxKey}
                  className="w-full h-full bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] hover:from-[var(--tuwa-button-gradient-from-hover)] hover:to-[var(--tuwa-button-gradient-to-hover)] text-[var(--tuwa-text-on-accent)] font-semibold rounded-xl transition-all duration-200 ease-in-out hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none"
                  disabled={currentCount === null}
                >
                  <span className="text-xl leading-none contents text-[var(--tuwa-text-on-accent)]">+</span>
                  <span className="leading-none">Increment Counter</span>
                </TxActionButton>
              </div>

              <div className="h-8 flex items-center justify-center">
                <p className="text-center text-xs text-[var(--tuwa-text-tertiary)] leading-tight">
                  This will increment the counter by 1 and track the transaction
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--tuwa-bg-secondary)] px-8 py-4 border-t border-[var(--tuwa-border-primary)] flex-shrink-0 h-16 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-xs text-[var(--tuwa-text-tertiary)]">
            <span className="leading-none">Powered by</span>
            <span className="font-semibold text-[var(--tuwa-text-accent)] leading-none">TUWA</span>
            <span className="leading-none">•</span>
            <span className="leading-none">Web3 Transaction Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};
