import { NextRequest, NextResponse } from 'next/server';
import { Testcase } from '@/types/testcase';

enum SupportedLanguages {
    cpp = 'cpp',
    python = 'python'
    // java = 'java',
    // typescript = 'typescript'
}

export async function POST(req: NextRequest) {
    const ENDPOINT = 'https://emkc.org/api/v2/piston/execute';

    const { language, code, function_name, testcases, param_type, output_type } = await req.json();

    if (!language || !code || !function_name || !testcases) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const [version, files] = await generateRunnableCode(
            function_name,
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
            'string ListNodeToString(ListNode* head) {',
            '    if (!head) return "[]";',
            '    string result = "[";',
            '    while (head) {',
            '        result += to_string(head->val);',
            '        head = head->next;',
            '        if (head) result += ", ";',
            '    }',
            '    result += "]";',
            '    return result;',
            '}'
        ]
    }
};

const vectorHelper: string[] = [
    'string vectorToString(const vector<int>& vec) {',
    '    if (vec.empty()) return "[]";',
    '    string result = "[";',
    '    for (size_t i = 0; i < vec.size(); ++i) {',
    '        result += to_string(vec[i]);',
    '        if (i < vec.size() - 1) result += ", ";',
    '    }',
    '    result += "]";',
    '    return result;',
    '}'
];

function generateCppCode(
    testcases: Testcase[],
    functionName: string,
    params_list: string[],
    output_type: string
): string[] {
    const res: string[] = [];
    res.push('        string res = "[";');
    for (let i = 0; i < params_list.length; i++) {
        const type = params_list[i];
        const varName = String.fromCharCode(97 + i); // 'a', 'b', 'c', ...
        let line: string = `        ${type} ${varName};`;
        res.push(line);
    }
    res.push(
        '        std::ostringstream oss;',
        '        std::streambuf* original_coutbuf = std::cout.rdbuf();'
    );

    for (const testcase of testcases) {
        const input_list = testcase.in;
        for (let i = 0; i < params_list.length; i++) {
            const type = params_list[i];
            const varName = String.fromCharCode(97 + i); // 'a', 'b', 'c', ...
            let line: string = '        ' + varName + ' = ';
            switch (type) {
                case 'ListNode*':
                    if (!input_list[i] || input_list[i].length === 0) {
                        line += 'nullptr;';
                        break;
                    }
                    let nodes: string[] = [];
                    for (let idx = 0; idx < input_list[i].length; idx++) {
                        nodes.push(`new ListNode(${input_list[i][idx]}`);
                    }
                    line += nodes.join(',') + ')'.repeat(nodes.length) + ';';
                    break;
                case 'int':
                    line += input_list[i].toString() + ';';
                    break;
                case 'vector<int>':
                    line += 'vector<int>{' + input_list[i].join(', ') + '};';
                    break;
            }
            res.push(line);
        }

        res.push(
            '        oss.str("");',
            '        oss.clear();',
            '        std::cout.rdbuf(oss.rdbuf());',
            '        try {'
        );
        res.push(
            `            ${output_type} output = ${functionName}(${params_list.map((_, i) => String.fromCharCode(97 + i)).join(', ')});`,
            output_type === 'ListNode*'
                ? '            string output_json = ListNodeToString(output);'
                : output_type === 'vector<int>'
                  ? '            string output_json = vectorToString(output);'
                  : `            string output_json = to_string(output);`,
            `            res += "{\\"output\\": " + output_json + ", \\"stdout\\": \\"" + oss.str() + "\\"},";`,
            '            std::cout.rdbuf(original_coutbuf);'
        );
        res.push(
            '        } catch (const std::exception& e) {',
            '            std::cout.rdbuf(original_coutbuf);',
            '            std::cerr << "Error: " << e.what() << std::endl;',
            '            return 1;',
            '        }'
        );
    }
    return res;
}

async function generateRunnableCode(
    function_name: string,
    language: SupportedLanguages,
    code: string,
    testcases: Testcase[],
    params_list: string[],
    output_type: string
) {
    let version = '';
    let files = [];

    console.log('Code Info:\n', testcases, function_name, params_list, output_type);

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
                        `            result = ${function_name}(*input_data)`,
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
            version = '10.2.0';
            const helperCode = generateCppCode(testcases, function_name, params_list, output_type);

            files = [
                {
                    name: 'src',
                    content: [
                        '#include <bits/stdc++.h>',
                        'using namespace std;',
                        code,
                        ...vectorHelper,
                        ...linkedListHelpers,
                        'int main() {',
                        ...helperCode,
                        `    if (res.back() == ',') res.back() = ']';`,
                        `    std::cout << res;`,
                        '    return 0;',
                        '}',
                        ''
                    ].join('\n')
                }
            ];
            break;
        default:
            throw new Error('Unsupported language');
    }

    return [version, files];
}
