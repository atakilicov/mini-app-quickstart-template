import { getRedis } from '@/lib/redis';

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

async function getSplit(id: string): Promise<SplitData | null> {
    try {
        const redis = getRedis();
        const data = await redis.get(`split:${id}`);

        if (!data) return null;

        return JSON.parse(data) as SplitData;
    } catch (error) {
        console.error('Error reading split from Redis:', error);
        return null;
    }
}

export default async function PayPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const split = await getSplit(id);

    if (!split) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Split Not Found</h1>
                    <p className="text-gray-400">The requested payment link is invalid or has expired.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans flex items-center justify-center p-4">
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Payment Request</h1>
                    <p className="text-gray-400 text-sm">You've been asked to pay for a split bill.</p>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
                        <span className="text-gray-400">Amount to Pay</span>
                        <span className="text-2xl font-bold text-white">{split.splitAmount.toFixed(4)} ETH</span>
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
                        {split.tipPercentage && (
                            <div className="flex justify-between">
                                <span>Tip Included</span>
                                <span>{split.tipPercentage}%</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Date</span>
                            <span>{new Date(split.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98]">
                        Connect Wallet to Pay
                    </button>
                </div>
            </div>
        </div>
    );
}
