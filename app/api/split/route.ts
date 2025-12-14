import { NextResponse } from 'next/server';

// In a real application, you would use a database to store split requests.
// For this demo, we'll simulate a backend processing step.

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { totalAmount, peopleCount } = body;

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
        const splitAmount = total / people;

        // 3. Generate a unique ID (Simulation)
        const requestId = Math.random().toString(36).substring(7);
        const paymentLink = `https://mini-app-quickstart-template-woad.vercel.app/pay/${requestId}`;

        // 4. Return Response
        return NextResponse.json({
            success: true,
            data: {
                requestId,
                splitAmount,
                currency: 'ETH',
                paymentLink,
                createdAt: new Date().toISOString(),
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
