'use client';

import BottomNav from '../components/BottomNav';
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
  WalletDropdownBasename,
  WalletDropdownFundLink
} from '@coinbase/onchainkit/wallet';
import {
  Identity,
  Avatar,
  Name,
  Address,
  EthBalance
} from '@coinbase/onchainkit/identity';
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  TransactionToast,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionToastAction
} from '@coinbase/onchainkit/transaction';
import { useAccount, useSignMessage } from 'wagmi';
import { useState } from 'react';

export default function ExamplesPage() {
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();
  const [signature, setSignature] = useState<string>('');

  const handleSign = () => {
    signMessage({ message: 'Hello from OnchainKit!' }, {
      onSuccess: (sig) => setSignature(sig),
    });
  };

  const calls = [
    {
      to: address as `0x${string}`,
      value: BigInt(0),
      data: '0x' as `0x${string}`,
    },
  ];

  return (
    <div className="flex flex-col items-center p-4 space-y-8 pb-20">
      <h1 className="text-2xl font-bold">OnchainKit Component Examples</h1>

      {/* Wallet Component */}
      <section className="w-full max-w-md border p-4 rounded-lg bg-white">
        <h2 className="text-xl font-bold mb-4">1. Wallet Component</h2>
        <p className="mb-4 text-sm text-gray-600">
          Manages wallet connection and displays user identity.
        </p>
        <div className="flex justify-end">
          <Wallet>
            <ConnectWallet className="bg-[#0000ff] text-button-text">
              <Avatar className="h-6 w-6" />
              <Name />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address className="text-gray-500" />
                <EthBalance />
              </Identity>
              <WalletDropdownBasename />
              <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
                Wallet
              </WalletDropdownLink>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </section>

      {/* Connected Component / State */}
      <section className="w-full max-w-md border p-4 rounded-lg bg-white">
        <h2 className="text-xl font-bold mb-4">2. Connected State</h2>
        <p className="mb-4 text-sm text-gray-600">
          Conditionally render content based on wallet connection.
        </p>
        {isConnected ? (
          <div className="p-4 bg-green-100 text-green-800 rounded">
            You are connected! Address: {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
        ) : (
          <div className="p-4 bg-red-100 text-red-800 rounded">
            Please connect your wallet to see this content.
          </div>
        )}
      </section>

      {/* Identity Component */}
      <section className="w-full max-w-md border p-4 rounded-lg bg-white">
        <h2 className="text-xl font-bold mb-4">3. Identity Component</h2>
        <p className="mb-4 text-sm text-gray-600">
          Displays user identity information (Avatar, Name, Address).
        </p>
        {isConnected && address ? (
          <Identity
            address={address}
            schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
            className="bg-gray-100 p-4 rounded-lg"
          >
            <Avatar />
            <Name className="text-foreground" />
            <Address className="text-foreground" />
            <EthBalance className="text-foreground" />
          </Identity>
        ) : (
          <p>Connect wallet to see identity.</p>
        )}
      </section>

      {/* Transaction Component */}
      <section className="w-full max-w-md border p-4 rounded-lg bg-white">
        <h2 className="text-xl font-bold mb-4">4. Transaction Component</h2>
        <p className="mb-4 text-sm text-gray-600">
          Handles transaction lifecycle (gas, sponsorship, status).
          (This example sends 0 ETH to yourself)
        </p>
        {isConnected ? (
          <Transaction
            chainId={84532} // (84532=Base Sepolia) IMPORTANT!: For Base mainnet use 8453
            calls={calls}
            onStatus={(status) => console.log('Transaction status:', status)}
          >
            <TransactionButton className="bg-[#0000ff] text-button-text" />
            <TransactionSponsor />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
            <TransactionToast>
              <TransactionToastIcon />
              <TransactionToastLabel />
              <TransactionToastAction />
            </TransactionToast>
          </Transaction>
        ) : (
          <p>Connect wallet to transact.</p>
        )}
      </section>

      {/* Signature Component */}
      <section className="w-full max-w-md border p-4 rounded-lg bg-white">
        <h2 className="text-xl font-bold mb-4">6. Signature (Sign Message)</h2>
        <p className="mb-4 text-sm text-gray-600">
          Example of signing a message with the connected wallet.
        </p>
        {isConnected ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSign}
              className="bg-[#0000ff] text-button-text px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign "Hello from OnchainKit!"
            </button>
            {signature && (
              <div className="mt-2 p-2 bg-gray-100 rounded break-all text-xs">
                <strong>Signature:</strong> {signature}
              </div>
            )}
          </div>
        ) : (
          <p>Connect wallet to sign.</p>
        )}
      </section>

      <BottomNav />
    </div>
  );
}
