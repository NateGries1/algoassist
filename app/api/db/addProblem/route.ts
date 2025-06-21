import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import firebase_app from '@/lib/firebase/firebase';
import getProblem from '@/lib/firebase/getProblem';

const db = getFirestore(firebase_app);

export async function POST(req: NextRequest) {
    const problemData = await req.json();
    try {
        const { result: titleResult, error: titleError } = await getProblem(
            'title',
            problemData.title
        );
        const { result: functionResult, error: problemError } = await getProblem(
            'function',
            problemData.function
        );

        if (titleError || problemError) {
            return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
        }

        if (titleResult && titleResult.length > 0) {
            console.log('Problem already found:', titleResult);
            return NextResponse.json(
                { error: 'Problem with this title already exists' },
                { status: 400 }
            );
        }

        if (functionResult && functionResult.length > 0) {
            return NextResponse.json(
                { error: 'Problem with this function already exists' },
                { status: 400 }
            );
        }

        const newDocRef = doc(collection(db, 'problem'));
        const result = await setDoc(newDocRef, problemData, { merge: true });

        return NextResponse.json({ message: 'Problem Added Successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add problem:' + error }, { status: 500 });
    }
}
