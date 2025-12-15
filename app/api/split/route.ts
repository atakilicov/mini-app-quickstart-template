import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

const DATA_FILE_PATH = path.join(process.cwd(), 'splits.json');

// Helper to save split
const saveSplit = (data: SplitData) => {
    let splits: SplitData[] = [];
    try {
        if (fs.existsSync(DATA_FILE_PATH)) {
            const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
            splits = JSON.parse(fileContent);
        }
    } catch (error) {
        console.error('Error reading splits file:', error);
    }

    splits.push(data);

    try {
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(splits, null, 2));
    } catch (error) {
        console.error('Error writing splits file:', error);
    }
};

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
        // Note: The frontend sends the mode and details, so we trust the frontend's intent
        // but we should ideally recalculate here. For simplicity, we'll store what's sent
        // along with the basic calculation.
        let splitAmount = total / people;
        if (splitMode === 'tip' && tipPercentage) {
            splitAmount = (total * (1 + tipPercentage / 100)) / people;
        }

        // 3. Generate a unique ID
        const requestId = Math.random().toString(36).substring(7);

        // Use relative URL for flexibility
        const paymentLink = `https://base-split.app/pay/${requestId}`;

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

        // Save to file
        saveSplit(newSplit);

        // 4. Return Response
        return NextResponse.json({
            success: true,
            data: {
                requestId,
                splitAmount,
                currency: 'ETH',
                paymentLink, // The frontend can override the domain if needed
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
