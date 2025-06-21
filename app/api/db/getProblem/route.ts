import { NextRequest, NextResponse } from 'next/server';
import getProblem from '@/lib/firebase/getProblem';

export async function POST(req: NextRequest) {
    const { field, value } = await req.json();
    try {
        const { result, error } = await getProblem(field, value);

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch problem' }, { status: 500 });
        }

        return NextResponse.json({ result });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
    }
}
