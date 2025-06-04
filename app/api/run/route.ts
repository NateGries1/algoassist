import { NextRequest, NextResponse } from 'next/server';

enum SupportedLanguages {
    cpp = 'cpp',
    python = 'python'
    // java = 'java',
    // typescript = 'typescript'
}

export async function POST(req: NextRequest) {
    const ENDPOINT = 'https://emkc.org/api/v2/piston/execute';

    const { language, code, problem_name, testcases, param_type, output_type } = await req.json();

    if (!language || !code || !problem_name || !testcases) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const [version, files] = await generateRunnableCode(
            problem_name,
            language,
            code,
            testcases,
            param_type,
            output_type
        );

        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                language: language,
                version: version,
                files: files,
                stdin: '',
                args: [],
                compile_timeout: 10000,
                run_timeout: 5000,
                compile_memory_limit: -1,
                run_memory_limit: -1
            })
        });

        const data = await response.json();
        console.log(data);

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

const suffix = {
    linkedlist: {
        python: [
            'def linkedlist_to_list(head):',
            '    result = []',
            '    while head != None:',
            '        result.append(head.val)',
            '        head = head.next',
            '    return result',
            '',
            'def list_to_linkedlist(lst):',
            '    if not lst: return None',
            '    head = ListNode(lst[0])',
            '    current = head',
            '    for val in lst[1:]:',
            '        current.next = ListNode(val)',
            '        current = current.next',
            '    return head',
            ''
        ],
        cpp: [
            'std::vector<int> linkedlist_to_vector(ListNode* head) {',
            '    std::vector<int> result;',
            '    while (head) {',
            '        result.push_back(head->val);',
            '        head = head->next;',
            '    }',
            '    return result;',
            '}',
            '',
            'ListNode* vector_to_linkedlist(const std::vector<int>& vec) {',
            '    if (vec.empty()) return nullptr;',
            '    ListNode* head = new ListNode(vec[0]);',
            '    ListNode* current = head;',
            '    for (size_t i = 1; i < vec.size(); ++i) {',
            '        current->next = new ListNode(vec[i]);',
            '        current = current->next;',
            '    }',
            '    return head;',
            '}'
        ]
    }
};

async function generateRunnableCode(
    problem_name: string,
    language: SupportedLanguages,
    code: string,
    testcases: string,
    params_list: string[],
    output_type: string
) {
    let version = '';
    let files = [];

    const isLinkedList = params_list?.includes('ListNode*') || output_type === 'ListNode*';
    const linkedListHelpers: string[] = isLinkedList ? suffix['linkedlist'][language] : [];

    switch (language) {
        case SupportedLanguages.python:
            version = '3.10.0';
            files = [
                {
                    name: 'src',
                    content: [
                        'import json',
                        'import sys',
                        'import io',
                        '',
                        code,
                        '',
                        ...linkedListHelpers,
                        '',
                        'def run_test_cases():',
                        "    testcases = json.loads('''" + JSON.stringify(testcases) + "''')",
                        "    params = json.loads('''" + JSON.stringify(params_list) + "''')",
                        '    results = []',
                        '',
                        '    for testcase in testcases:',
                        "        input_data = testcase['in']",
                        "        expected = testcase['out']",
                        '',
                        isLinkedList
                            ? '        input_data = [list_to_linkedlist(input_data[i]) if params[i] == "ListNode*" else input_data[i] for i in range(len(params))]'
                            : '',
                        '',
                        '        stdout_backup = sys.stdout',
                        '        sys.stdout = io.StringIO()',
                        '        try:',
                        `            result = ${problem_name}(*input_data)`,
                        '            stdout_output = sys.stdout.getvalue().strip()',
                        '        finally:',
                        '            sys.stdout = stdout_backup',
                        '',
                        '        output = result',
                        isLinkedList
                            ? '        if ("' +
                              output_type +
                              '" == "ListNode*"):\n' +
                              '            output = linkedlist_to_list(output)\n'
                            : '',
                        '',
                        '        results.append({',
                        "            'output': output,",
                        "            'stdout': stdout_output",
                        '        })',
                        '',
                        '    json_output = json.dumps(results)',
                        '    print(json_output)',
                        '',
                        "if __name__ == '__main__':",
                        '    run_test_cases()'
                    ].join('\n')
                }
            ];
            break;
        case SupportedLanguages.cpp:
            const res = await fetch(
                'https://raw.githubusercontent.com/nlohmann/json/develop/single_include/nlohmann/json.hpp'
            );
            const jsonHeader = await res.text();
            version = '10.2.0';
            files = [
                {
                    name: 'src',
                    content: [
                        '#include <iostream>',
                        '#include <vector>',
                        '#include <string>',
                        '#include <sstream>',
                        '#include "json.hpp"',
                        'using namespace std;',
                        'using json = nlohmann::json;',
                        '',
                        'struct TestResult {',
                        '    std::string expected;',
                        '    std::string output;',
                        '    std::string stdout;',
                        '};',
                        code,
                        ...linkedListHelpers,
                        '',
                        'int main() {',
                        '    json testcases = json::parse(R"(' + testcases + ')");',
                        '    json params = json::parse(R"(' + JSON.stringify(params_list) + ')");',
                        '    vector<json> results;',
                        '',
                        '    for (const auto& testcase : testcases) {',
                        '        std::vector<std::string> input_data = testcase.at("in").get<std::vector<std::string>>();',
                        '        std::vector<int> expected = testcase.at("out").get<std::vector<int>>();',
                        '',
                        isLinkedList
                            ? '        for (size_t i = 0; i < params.size(); ++i) {\n' +
                              '            if (params[i] == "ListNode*") {\n' +
                              '                // Convert input_data[i] to linked list\n' +
                              '            }\n' +
                              '        }\n'
                            : '',
                        '',
                        '        std::ostringstream oss;',
                        '        std::streambuf* coutbuf = std::cout.rdbuf();',
                        '        std::cout.rdbuf(oss.rdbuf());',
                        '        try {',
                        `            auto result = ${problem_name}(input_data);`,
                        '            std::cout.rdbuf(coutbuf);',
                        '            json result_json;',
                        '            result_json["output"] = result;',
                        '            result_json["stdout"] = oss.str();',
                        '            results.push_back(result_json);',
                        '        } catch (...) {',
                        '            std::cout.rdbuf(coutbuf);',
                        '            results.push_back({',
                        "                {'output', nullptr},",
                        "                {'stdout', oss.str()}",
                        '            });',
                        '        }',
                        '    }',
                        '',
                        '    std::cout << results.dump(4) << std::endl;',
                        '    std::cout << params.dump(4) << std::endl;',
                        '    std::cout << testcases.dump(4) << std::endl;',
                        '}'
                    ].join('\n')
                },
                {
                    name: 'json.hpp',
                    content: jsonHeader
                }
            ];
            break;
        default:
            throw new Error('Unsupported language');
    }

    return [version, files];
}
