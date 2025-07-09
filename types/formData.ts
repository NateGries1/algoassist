import { Testcase } from '@/types/testcase';
import { TestcaseForm } from '@/types/testcaseForm';

export type FormData = {
    titleName: string;
    titleError: string;
    functionName: string;
    functionNameError: string;
    lcNumber: number;
    lcError: string;
    returnType: string;
    parameters: string[];
    paramNames: string[];
    paramError: string;
    testcaseForms: TestcaseForm[];
    testcases: Testcase[];
    testcaseError: string;
    description: string;
    descriptionError: string;
    difficulty: string;
    selectedTopics: string[];
    topicError: string;
};
