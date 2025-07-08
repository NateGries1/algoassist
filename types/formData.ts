import { Testcases } from '@/types/testcases';
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
    testcases: Testcases;
    testcaseError: string;
    description: string;
    descriptionError: string;
    difficulty: string;
    selectedTopics: string[];
    topicError: string;
};
