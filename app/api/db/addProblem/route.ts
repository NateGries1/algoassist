import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import firebase_app from '@/lib/firebase/firebase';
import getProblem from '@/lib/firebase/getProblem';
import { Problem } from '@/types/problem';
import keywords from '@/lib/keywords';

const db = getFirestore(firebase_app);

const paramMappings: Record<string, string> = {
    int: 'number',
    'vector<int>': 'array',
    'ListNode*': 'array',
    string: 'string'
};

const ValidateProblem = (problem: Problem) => {
    try {
        let errorMessage = '';
        const titleRegex = /^[a-zA-Z0-9 ]+$/;
        if (!problem.title || !titleRegex.test(problem.title)) {
            errorMessage += 'Invalid title. ';
        }

        const functionNameRegex = /^[a-z][a-zA-Z]*$/;
        if (
            !problem.function ||
            !functionNameRegex.test(problem.function) ||
            keywords.has(problem.function)
        ) {
            errorMessage += 'Invalid function name. ';
        }

        if (problem.lc_number == 0) {
            errorMessage += 'Invalid Leetcode number. ';
        }

        if (problem.param_type.length === 0) {
            errorMessage += 'Invalid parameter type. ';
        }

        const paramRegex = /^[a-z][a-zA-Z0-9_]*$/;
        if (
            problem.params
                .split(', ')
                .some((param) => !paramRegex.test(param) || keywords.has(param))
        ) {
            errorMessage += 'Invalid parameter name. ';
        }

        if (problem.content.trim() === '') {
            errorMessage += 'Invalid problem content. ';
        }

        if (problem.topic.length === 0) {
            errorMessage += 'Invalid problem topic. ';
        }

        const testcases = JSON.parse(problem.testcases);
        if (testcases.length < 3) {
            errorMessage += 'Invalid test cases. ';
        }

        for (const testcase of testcases) {
            const args = testcase.in;
            if (args.length !== problem.param_type.length) {
                errorMessage += 'Invalid test case arguments. ';
            }

            for (let i = 0; i < args.length; ++i) {
                const expectedType = paramMappings[problem.param_type[i]];
                if (expectedType === 'array') {
                    if (Array.isArray(args[i]) == false) {
                        errorMessage += 'Invalid test case argument type. ';
                    }
                } else {
                    if (typeof args[i] !== expectedType) {
                        errorMessage += 'Invalid test case argument type. ';
                    }
                }
            }

            if (paramMappings[problem.output_type] === 'array') {
                if (!Array.isArray(testcase.out)) {
                    errorMessage += `Testcase ${testcases.indexOf(testcase) + 1} output type mismatch. Expected array, got ${typeof testcase.out}. `;
                }
            } else if (typeof testcase.out !== paramMappings[problem.output_type]) {
                errorMessage += `Testcase ${testcases.indexOf(testcase) + 1} output type mismatch. Expected ${paramMappings[problem.output_type]}, got ${typeof testcase.out}. `;
            }
        }

        if (errorMessage) {
            console.error('Validation errors found:', errorMessage);
            return false;
        }
    } catch (error) {
        console.error('Error adding problem:', error);
    }
    return true;
};

export async function POST(req: NextRequest) {
    const problemData = await req.json();
    if (!ValidateProblem(problemData)) {
        return NextResponse.json({ error: 'Failed Validation' });
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
            return NextResponse.json({ error: 'Problem with this title already exists' });
        }

        if (functionResult && functionResult.length > 0) {
            return NextResponse.json({ error: 'Problem with this function already exists' });
        }

        const newDocRef = doc(collection(db, 'unverified'));
        const result = await setDoc(
            newDocRef,
            { ...problemData, testcases: JSON.stringify(problemData.testcases) },
            { merge: true }
        );

        return NextResponse.json({ error: null });
    } catch (error) {
        return NextResponse.json({ error: `Failed to add problem: ${String(error)}` });
    }
}
