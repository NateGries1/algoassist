import { Testcases } from '@/types/testcases';
export type Problem = {
    id?: string;
    content: string;
    difficulty: string;
    title: string;
    topic: string[];
    lc_number: number;
    function: string;
    testcases: Testcases;
    params: string;
    param_type: string[];
    output_type: string;
};
