import { getRedis } from '@/lib/redis';
import PaymentClient from './PaymentClient';

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
                    <p className="text-gray-400 mb-6">The requested payment link is invalid or has expired.</p>
                    <a href="/" className="text-blue-400 hover:underline">← Back to Home</a>
                </div>
            </div>
        );
    }

    return <PaymentClient split={split} />;
}
