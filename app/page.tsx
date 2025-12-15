"use client";
import { useState, useEffect, useRef } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect, WalletDropdownLink, WalletDropdownBasename, WalletDropdownFundLink } from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity, EthBalance } from '@coinbase/onchainkit/identity';
import { useAccount, useBalance } from 'wagmi';
import { UserGroupIcon, CurrencyDollarIcon, ShareIcon, CheckCircleIcon, ArrowPathIcon, WifiIcon, QrCodeIcon, ClipboardDocumentIcon, CalculatorIcon, PercentBadgeIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

// Split Mode Types
type SplitMode = 'equal' | 'percentage' | 'custom' | 'tip';

type Transaction = {
  id: number;
  amount: number;
  people: number;
  date: string;
  status: 'completed' | 'pending';
};

export default function Home() {
  const { isFrameReady } = useMiniKit();
  const { address, isConnected } = useAccount();
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: address,
  });

  const [totalAmount, setTotalAmount] = useState<string>("");
  const [peopleCount, setPeopleCount] = useState<string>("2");
  const [splitResult, setSplitResult] = useState<{ splitAmount: number, paymentLink: string, details?: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  // Force dark mode
  const isDarkMode = true;
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [tipPercentage, setTipPercentage] = useState<number>(15);

  // Advanced Split State
  const [percentages, setPercentages] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<string[]>([]);

  // Refs for 3D animation
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Transaction History
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load transactions from local storage
  useEffect(() => {
    const saved = localStorage.getItem('split_transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  // Save transactions to local storage
  const saveTransaction = (newTx: Transaction) => {
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem('split_transactions', JSON.stringify(updated));
  };

  // 3D Card Animation Effect
  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;

    if (!card || !container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const xAxis = (centerX - e.clientX) / 15;
      const yAxis = (centerY - e.clientY) / 15;

      card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = `rotateY(0deg) rotateX(0deg)`;
      card.style.transition = "all 0.5s ease";
    };

    const handleMouseEnter = () => {
      card.style.transition = "none";
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Reset result when inputs change
  useEffect(() => {
    setSplitResult(null);
  }, [totalAmount, peopleCount, splitMode, tipPercentage, percentages, customAmounts]);

  // Initialize custom amounts/percentages when people count changes
  useEffect(() => {
    const count = parseInt(peopleCount) || 2;
    // Preserve existing values if possible, otherwise empty
    setPercentages(prev => {
      const newArr = new Array(count).fill('');
      for (let i = 0; i < Math.min(prev.length, count); i++) newArr[i] = prev[i];
      return newArr;
    });
    setCustomAmounts(prev => {
      const newArr = new Array(count).fill('');
      for (let i = 0; i < Math.min(prev.length, count); i++) newArr[i] = prev[i];
      return newArr;
    });
  }, [peopleCount]);

  // Fire confetti on successful split creation
  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0052ff', '#7c3aed', '#60a5fa', '#a78bfa']
    });
  };

  // Calculate split based on mode
  const calculateSplit = (total: number, people: number): { amount: number, details?: any[] } => {
    switch (splitMode) {
      case 'tip':
        const totalWithTip = total * (1 + tipPercentage / 100);
        return { amount: totalWithTip / people };

      case 'percentage':
        // Return average for the main display, but details matter
        return {
          amount: total / people,
          details: percentages.map(p => ({ percent: p, amount: total * (parseFloat(p) || 0) / 100 }))
        };

      case 'custom':
        // Return average or just total
        return {
          amount: total / people,
          details: customAmounts.map(a => ({ amount: parseFloat(a) || 0 }))
        };

      case 'equal':
      default:
        return { amount: total / people };
    }
  };

  const validateSplit = (total: number): boolean => {
    if (splitMode === 'percentage') {
      const sum = percentages.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
      if (Math.abs(sum - 100) > 0.1) {
        toast.error(`Percentages must equal 100% (Current: ${sum}%)`);
        return false;
      }
    }
    if (splitMode === 'custom') {
      const sum = customAmounts.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
      if (Math.abs(sum - total) > 0.0001) {
        toast.error(`Custom amounts must equal Total (Current: ${sum}, Total: ${total})`);
        return false;
      }
    }
    return true;
  };

  const handleCreateRequest = async () => {
    const total = parseFloat(totalAmount);
    if (!validateSplit(total)) return;

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
          splitMode,
          tipPercentage: splitMode === 'tip' ? tipPercentage : 0,
          details: splitMode === 'percentage' ? percentages : (splitMode === 'custom' ? customAmounts : undefined)
        }),
      });

      const data = await response.json();

      if (data.success) {
        const result = calculateSplit(total, parseInt(peopleCount));

        setSplitResult({
          splitAmount: result.amount,
          paymentLink: data.data.paymentLink,
          details: result.details
        });

        // Save to history
        saveTransaction({
          id: data.data.requestId, // Use ID from backend
          amount: total,
          people: parseInt(peopleCount),
          date: new Date().toLocaleString(),
          status: 'pending'
        });

        toast.success('Split request created successfully!', {
          icon: '🎉',
          style: {
            borderRadius: '16px',
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          },
        });
        fireConfetti();
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to connect to backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async () => {
    toast.success(`Initiating payment...`, {
      icon: '💸',
      style: {
        borderRadius: '16px',
        background: '#1e293b',
        color: '#fff',
        border: '1px solid rgba(34, 197, 94, 0.3)',
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!', {
      icon: '📋',
      style: {
        borderRadius: '16px',
        background: '#1e293b',
        color: '#fff',
      },
    });
  };

  // Format balance for display
  const formatBalance = () => {
    if (!isConnected) return '-.--- ETH';
    if (isBalanceLoading) return 'Loading...';
    if (balanceData) {
      return `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`;
    }
    return '0.0000 ETH';
  };

  // Format address for display
  const formatAddress = () => {
    if (!address) return '0x...';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Static background
  const bgClass = 'bg-[#0f172a]';
  const textClass = 'text-white';
  const cardBgClass = 'bg-gray-800/40';
  const borderClass = 'border-gray-700/50';
  const inputBgClass = 'bg-gray-900/50 border-gray-700';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} font-sans overflow-x-hidden relative`}>
      {/* Toast Container */}
      <Toaster position="top-center" />

      {/* Background Glow Effect */}
      <div className="wallet-bg-glow transition-all duration-700"></div>

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-500/10 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`,
            }}
          />
        ))}
      </div>

      <div className="p-6 max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-12 bg-gray-900/20 backdrop-blur-md p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <CurrencyDollarIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Base Split
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Wallet>
              <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-all shadow-lg shadow-blue-600/20">
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

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: 3D Wallet Card */}
          <div className="lg:col-span-1">
            <div className="wallet-perspective-container" ref={containerRef}>
              <div className="wallet-card" ref={cardRef} id="card">
                <div className="reflection"></div>
                <div className="card-header">
                  <span className="logo">BASE CARD</span>
                  <WifiIcon className="w-8 h-8 opacity-80 rotate-90" />
                </div>
                <div className="card-chip">
                  <img src="https://raw.githubusercontent.com/dasShounak/freeUseImages/main/chip.png" alt="chip" width="50" />
                </div>
                <div className="card-details">
                  <div className="balance-group">
                    <label className="text-gray-300 font-semibold drop-shadow-md">Total Balance</label>
                    <h2 className={`text-2xl font-bold text-white drop-shadow-lg ${isBalanceLoading ? 'animate-pulse' : ''}`}>{formatBalance()}</h2>
                  </div>
                  <div className="address-group">
                    <p className="text-white font-mono drop-shadow-md">{formatAddress()}</p>
                    <span className="network shadow-lg">Base Sepolia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Split Bill Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`${cardBgClass} backdrop-blur-xl border ${borderClass} rounded-3xl p-6 shadow-2xl transition-all duration-500`}>
              <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Split the Bill
              </h2>

              {/* Split Mode Selector */}
              <div className="mb-6">
                <label className="text-gray-400 text-sm font-medium mb-2 block">Split Mode</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { mode: 'equal' as SplitMode, label: 'Equal', icon: UserGroupIcon },
                    { mode: 'percentage' as SplitMode, label: 'Percentage', icon: PercentBadgeIcon },
                    { mode: 'custom' as SplitMode, label: 'Custom', icon: CalculatorIcon },
                    { mode: 'tip' as SplitMode, label: 'With Tip', icon: CurrencyDollarIcon },
                  ].map(({ mode, label, icon: Icon }) => (
                    <button
                      key={mode}
                      onClick={() => setSplitMode(mode)}
                      className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${splitMode === mode
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:scale-105'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {/* Total Amount Input */}
                <div className="space-y-2">
                  <label className="text-gray-400 text-sm font-medium ml-1">Total Amount (ETH)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-lg text-gray-500">Ξ</span>
                    </div>
                    <input
                      type="number"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      placeholder="0.00"
                      className={`w-full ${inputBgClass} ${textClass} text-2xl font-bold rounded-2xl py-4 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-600`}
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
                      className={`w-full ${inputBgClass} ${textClass} text-lg font-semibold rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                    />
                  </div>
                </div>

                {/* Dynamic Inputs for Percentage/Custom Modes */}
                {(splitMode === 'percentage' || splitMode === 'custom') && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    <label className="text-gray-400 text-sm font-medium ml-1">
                      {splitMode === 'percentage' ? 'Percentages per Person' : 'Amounts per Person'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: parseInt(peopleCount) || 0 }).map((_, i) => (
                        <div key={i} className="relative">
                          <label className="text-xs text-gray-500 mb-1 block">Person {i + 1}</label>
                          <input
                            type="number"
                            placeholder={splitMode === 'percentage' ? '%' : 'ETH'}
                            value={splitMode === 'percentage' ? percentages[i] || '' : customAmounts[i] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (splitMode === 'percentage') {
                                const newP = [...percentages];
                                newP[i] = val;
                                setPercentages(newP);
                              } else {
                                const newC = [...customAmounts];
                                newC[i] = val;
                                setCustomAmounts(newC);
                              }
                            }}
                            className={`w-full ${inputBgClass} ${textClass} p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-right text-gray-500">
                      {splitMode === 'percentage'
                        ? `Total: ${percentages.reduce((a, b) => a + (parseFloat(b) || 0), 0)}%`
                        : `Total: ${customAmounts.reduce((a, b) => a + (parseFloat(b) || 0), 0).toFixed(4)} ETH`
                      }
                    </p>
                  </div>
                )}

                {/* Tip Percentage (only for tip mode) */}
                {splitMode === 'tip' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                    <label className="text-gray-400 text-sm font-medium ml-1">Tip Percentage</label>
                    <div className="flex gap-2">
                      {[10, 15, 20, 25].map((percent) => (
                        <button
                          key={percent}
                          onClick={() => setTipPercentage(percent)}
                          className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${tipPercentage === percent
                            ? 'bg-green-600 text-white scale-105'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:scale-105'
                            }`}
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>
                    {totalAmount && (
                      <p className="text-sm text-gray-500 ml-1">
                        Tip: {(parseFloat(totalAmount) * tipPercentage / 100).toFixed(4)} ETH
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!splitResult ? (
              <button
                onClick={handleCreateRequest}
                disabled={!totalAmount || parseFloat(totalAmount) <= 0 || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] hover:scale-[1.02] flex items-center justify-center gap-2"
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
                <div className={`${cardBgClass} border ${borderClass} rounded-2xl p-4`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-400 font-medium">
                      {splitMode === 'equal' || splitMode === 'tip' ? 'Per Person' : 'Total Split'}
                    </span>
                    <span className="text-2xl font-bold text-blue-400">
                      {splitResult.splitAmount.toFixed(4)} <span className="text-sm text-blue-500/70">ETH</span>
                    </span>
                  </div>

                  {/* Detailed Breakdown for Custom/Percentage */}
                  {splitResult.details && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
                      {splitResult.details.map((d, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-400">Person {i + 1} {d.percent ? `(${d.percent}%)` : ''}</span>
                          <span className="text-white font-medium">{d.amount.toFixed(4)} ETH</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="font-bold text-green-400">Request Created!</h3>
                    <p className="text-sm text-green-400/70">Ready to share.</p>
                  </div>
                </div>

                {/* QR Code Modal */}
                {showQR && (
                  <div className={`${cardBgClass} border ${borderClass} rounded-2xl p-6 flex flex-col items-center animate-in zoom-in duration-300`}>
                    <QRCodeSVG
                      value={splitResult.paymentLink}
                      size={200}
                      bgColor="transparent"
                      fgColor="#ffffff"
                      level="H"
                      includeMargin
                    />
                    <p className="text-sm text-gray-500 mt-3">Scan to pay</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => copyToClipboard(splitResult.paymentLink)}
                    className={`bg-gray-800 hover:bg-gray-700 ${textClass} font-semibold py-3 rounded-xl border ${borderClass} transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95`}
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className={`bg-gray-800 hover:bg-gray-700 ${textClass} font-semibold py-3 rounded-xl border ${borderClass} transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95`}
                  >
                    <QrCodeIcon className="w-4 h-4" />
                    QR
                  </button>
                  <button
                    onClick={() => setSplitResult(null)}
                    className={`bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white font-semibold py-3 rounded-xl border ${borderClass} transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95`}
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Reset
                  </button>
                </div>

                {/* Friend's View */}
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <p className="text-center text-gray-500 text-sm mb-4">Preview (Friend's View)</p>
                  <button
                    onClick={handlePay}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-600/20 transition-all transform active:scale-[0.98] hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <CurrencyDollarIcon className="w-6 h-6" />
                    Pay {splitResult.splitAmount.toFixed(4)} ETH
                  </button>
                </div>
              </div>
            )}

            {/* Recent Splits - Now below the form */}
            <div className={`${cardBgClass} backdrop-blur-xl border ${borderClass} rounded-2xl p-4`}>
              <h3 className="font-bold mb-3 text-sm text-gray-400">Recent Splits</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-500 text-xs py-4">No recent splits</p>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm text-white">{tx.amount} ETH</p>
                        <p className="text-xs text-gray-500">{tx.people} people • {tx.date}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${tx.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {tx.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">Base Split</span>
            </div>
            <p className="text-sm text-gray-500">
              Split bills instantly on Base. No friction, just crypto.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors text-sm">About</a>
              <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors text-sm">Terms</a>
              <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors text-sm">Privacy</a>
            </div>
          </div>
          <p className="text-center text-gray-600 text-xs mt-6">
            © 2024 Base Split. Built on Base.
          </p>
        </footer>
      </div>
    </div>
  );
}
