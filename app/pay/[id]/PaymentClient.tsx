'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CurrencyDollarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import toast, { Toaster } from 'react-hot-toast';

interface SplitData {
    id: string;
    totalAmount: number;
    peopleCount: number;
    splitAmount: number;
    splitMode: string;
    tipPercentage?: number;
    details?: any[];
    createdAt: string;
}

interface PaymentClientProps {
    split: SplitData;
}

export default function PaymentClient({ split }: PaymentClientProps) {
    const { address, isConnected } = useAccount();
    const [isPaid, setIsPaid] = useState(false);

    const { data: hash, isPending, sendTransaction } = useSendTransaction();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isConfirmed) {
            setIsPaid(true);
            toast.success('Payment successful!', {
                icon: '✅',
                style: {
                    borderRadius: '16px',
                    background: '#1e293b',
                    color: '#fff',
                },
            });
        }
    }, [isConfirmed]);

    const handlePay = async () => {
        if (!isConnected) {
            toast.error('Please connect your wallet first');
            return;
        }

        try {
            sendTransaction({
                to: '0x0000000000000000000000000000000000000000', // Replace with actual recipient
                value: parseEther(split.splitAmount.toString()),
            });
        } catch (error) {
            toast.error('Payment failed');
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans flex flex-col items-center justify-center p-4">
            <Toaster position="top-center" />

            {/* Back to Home */}
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Home</span>
            </Link>

            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center mb-8">
                    <div className={`w-16 h-16 ${isPaid ? 'bg-green-600' : 'bg-blue-600'} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${isPaid ? 'shadow-green-600/30' : 'shadow-blue-600/30'}`}>
                        {isPaid ? (
                            <CheckCircleIcon className="w-8 h-8 text-white" />
                        ) : (
                            <CurrencyDollarIcon className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold mb-2">
                        {isPaid ? 'Payment Complete!' : 'Payment Request'}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {isPaid ? 'Thank you for your payment.' : "You've been asked to pay for a split bill."}
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400">Amount to Pay</span>
                        <span className={`text-2xl font-bold ${isPaid ? 'text-green-400 line-through' : 'text-white'}`}>
                            {split.splitAmount.toFixed(4)} ETH
                        </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex justify-between">
                            <span>Total Bill</span>
                            <span>{split.totalAmount.toFixed(4)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Split Mode</span>
                            <span className="capitalize">{split.splitMode}</span>
                        </div>
                        {split.tipPercentage && split.tipPercentage > 0 && (
                            <div className="flex justify-between">
                                <span>Tip Included</span>
                                <span>{split.tipPercentage}%</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Created</span>
                            <span>{formatDateTime(split.createdAt)}</span>
                        </div>
                    </div>

                    {isPaid ? (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
                            <p className="text-green-400 font-medium">Payment confirmed on-chain</p>
                            {hash && (
                                <a
                                    href={`https://sepolia.basescan.org/tx/${hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm hover:underline mt-2 block"
                                >
                                    View Transaction →
                                </a>
                            )}
                        </div>
                    ) : !isConnected ? (
                        <Wallet>
                            <ConnectWallet className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all">
                                <Avatar className="h-6 w-6" />
                                <Name />
                            </ConnectWallet>
                        </Wallet>
                    ) : (
                        <button
                            onClick={handlePay}
                            disabled={isPending || isConfirming}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-600/20 transition-all transform active:scale-[0.98]"
                        >
                            {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : `Pay ${split.splitAmount.toFixed(4)} ETH`}
                        </button>
                    )}

                    {isConnected && !isPaid && (
                        <p className="text-center text-gray-500 text-xs">
                            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
