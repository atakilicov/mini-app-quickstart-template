import { NextResponse } from 'next/server';

export async function GET() {
    // Return empty user data - Farcaster/Neynar integration placeholder
    return NextResponse.json({
        user: null,
    });
}
