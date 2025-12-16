import { NextResponse } from 'next/server';

export async function GET() {
    // Return empty profile data - this is called by OnchainKit internally
    return NextResponse.json({
        profile: null,
        verified: false,
    });
}
