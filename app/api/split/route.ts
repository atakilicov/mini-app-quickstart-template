import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

// Interface for Split Data
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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { totalAmount, peopleCount, splitMode, tipPercentage, details } = body;

        // 1. Server-side Validation
        if (!totalAmount || !peopleCount) {
            return NextResponse.json(
                { error: 'Total amount and people count are required' },
                { status: 400 }
            );
        }

        const total = parseFloat(totalAmount);
        const people = parseInt(peopleCount);

        if (isNaN(total) || total <= 0) {
            return NextResponse.json(
                { error: 'Invalid total amount' },
                { status: 400 }
            );
        }

        if (isNaN(people) || people <= 0) {
            return NextResponse.json(
                { error: 'Invalid people count' },
                { status: 400 }
            );
        }

        // 2. Business Logic (Calculation)
        let splitAmount = total / people;
        if (splitMode === 'tip' && tipPercentage) {
            splitAmount = (total * (1 + tipPercentage / 100)) / people;
        }

        // 3. Generate a unique ID
        const requestId = Math.random().toString(36).substring(7);

        // Use the actual deployed URL or localhost for dev
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const paymentLink = `${baseUrl}/pay/${requestId}`;

        const newSplit: SplitData = {
            id: requestId,
            totalAmount: total,
            peopleCount: people,
            splitAmount,
            splitMode: splitMode || 'equal',
            tipPercentage,
            details,
            createdAt: new Date().toISOString(),
        };

        // Save to Redis with 30 days expiry
        const redis = getRedis();
        await redis.setex(`split:${requestId}`, 60 * 60 * 24 * 30, JSON.stringify(newSplit));

        // 4. Return Response
        return NextResponse.json({
            success: true,
            data: {
                requestId,
                splitAmount,
                currency: 'ETH',
                paymentLink,
                createdAt: newSplit.createdAt,
            }
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
