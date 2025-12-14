"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect, WalletDropdownLink, WalletDropdownBasename, WalletDropdownFundLink } from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity, EthBalance } from '@coinbase/onchainkit/identity';
import { UserGroupIcon, CurrencyDollarIcon, ShareIcon, CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const { isFrameReady } = useMiniKit();
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [peopleCount, setPeopleCount] = useState<string>("2");
  const [splitResult, setSplitResult] = useState<{ splitAmount: number, paymentLink: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset result when inputs change
  useEffect(() => {
    setSplitResult(null);
  }, [totalAmount, peopleCount]);

  const handleCreateRequest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/split', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalAmount,
          peopleCount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSplitResult({
          splitAmount: data.data.splitAmount,
          paymentLink: data.data.paymentLink
        });
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      alert('Failed to connect to backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async () => {
    alert(`Initiating payment of ${splitResult?.splitAmount.toFixed(4)} ETH`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <CurrencyDollarIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
            Base Split
          </h1>
        </div>
        <div className="flex items-center">
          <Wallet>
            <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-all">
              <Avatar className="h-6 w-6" />
              <Name />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address />
                <EthBalance />
              </Identity>
              <WalletDropdownBasename />
              <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
                Wallet
              </WalletDropdownLink>
              <WalletDropdownFundLink />
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto space-y-6">

        {/* Input Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-2xl">
          <div className="space-y-6">

            {/* Total Amount Input */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium ml-1">Total Bill Amount (ETH)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">Ξ</span>
                </div>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-900/50 border border-gray-700 text-white text-2xl font-bold rounded-2xl py-4 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-600"
                />
              </div>
            </div>

            {/* People Count Input */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium ml-1">Split With (People)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserGroupIcon className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="number"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  min="1"
                  className="w-full bg-gray-900/50 border border-gray-700 text-white text-lg font-semibold rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        {!splitResult ? (
          <button
            onClick={handleCreateRequest}
            disabled={!totalAmount || parseFloat(totalAmount) <= 0 || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <ShareIcon className="w-5 h-5" />
            )}
            {isLoading ? 'Calculating...' : 'Create Split Request'}
          </button>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Result Display */}
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex justify-between items-center">
              <span className="text-blue-200 font-medium">Per Person</span>
              <span className="text-2xl font-bold text-blue-400">
                {splitResult.splitAmount.toFixed(4)} <span className="text-sm text-blue-500/70">ETH</span>
              </span>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="font-bold text-green-400">Request Created!</h3>
                <p className="text-sm text-green-400/70">Ready to share.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(splitResult.paymentLink);
                  alert("Link copied: " + splitResult.paymentLink);
                }}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl border border-gray-700 transition-all"
              >
                Copy Link
              </button>
              <button
                onClick={() => setSplitResult(null)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white font-semibold py-3 rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Reset
              </button>
            </div>

            {/* Simulation of what a friend would see */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-center text-gray-500 text-sm mb-4">Preview (Friend's View)</p>
              <button
                onClick={handlePay}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CurrencyDollarIcon className="w-6 h-6" />
                Pay {splitResult.splitAmount.toFixed(4)} ETH
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
