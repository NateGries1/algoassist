import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import firebase_app from '@/lib/firebase/firebase';
import getProblem from '@/lib/firebase/getProblem';
import { Problem } from '@/types/problem';

const db = getFirestore(firebase_app);
const paramMappings: Record<string, string> = {
    int: 'number',
    'vector/list': 'array',
    'linked list': 'array',
    string: 'string'
};

const ValidateProblem = (problem: Problem) => {
    try {
        const titleRegex = /^[a-zA-Z0-9 ]+$/;
        if (!problem.title || !titleRegex.test(problem.title)) return false;

        const reservedWords = new Set([
            'and',
            'as',
            'assert',
            'auto',
            'bitand',
            'bitor',
            'bool',
            'break',
            'case',
            'catch',
            'char',
            'class',
            'compl',
            'const',
            'continue',
            'default',
            'delete',
            'do',
            'double',
            'else',
            'enum',
            'export',
            'extern',
            'false',
            'float',
            'for',
            'friend',
            'goto',
            'if',
            'import',
            'inline',
            'int',
            'long',
            'mutable',
            'namespace',
            'new',
            'not',
            'or',
            'private',
            'protected',
            'public',
            'register',
            'return',
            'short',
            'signed',
            'sizeof',
            'static',
            'struct',
            'super',
            'switch',
            'template',
            'this',
            'throw',
            'true',
            'try',
            'typedef',
            'typeid',
            'typename',
            'union',
            'unsigned',
            'using',
            'virtual',
            'void',
            'volatile',
            'while'
        ]); // one-word keywords for JS, C++, and Python
        const functionNameRegex = /^[a-z][a-zA-Z]*$/;
        if (
            !problem.function ||
            !functionNameRegex.test(problem.function) ||
            reservedWords.has(problem.function)
        )
            return false;

        if (problem.lc_number == 0) return false;

        if (problem.param_type.length === 0) return false;

        const paramRegex = /^[a-z][a-zA-Z0-9_]*$/;
        if (
            problem.params
                .split(', ')
                .some((param) => !paramRegex.test(param) || reservedWords.has(param))
        )
            return false;

        if (problem.content.trim() === '') return false;

        if (problem.topic.length === 0) return false;

        const testcases = JSON.parse(problem.testcases);
        if (testcases.length < 3) return false;

        for (const testcase of testcases) {
            const args = testcase.in;
            for (let i = 0; i < args.length; ++i) {
                const expectedType = paramMappings[problem.param_type[i]];
                if (expectedType === 'array') {
                    if (Array.isArray(args[i]) == false) {
                        return false;
                    }
                } else {
                    if (typeof args[i] !== expectedType) {
                        return false;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error adding problem:', error);
        return false;
    }
    return true;
};

export async function POST(req: NextRequest) {
    const problemData = await req.json();
    if (!ValidateProblem(problemData)) {
        return NextResponse.json({ error: 'Failed Validation' }, { status: 400 });
    }

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
