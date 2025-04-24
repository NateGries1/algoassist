import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const ENDPOINT = 'https://emkc.org/api/v2/piston/execute';

  const { language, code, problem_name, testcases, problem } = await req.json();

  if (!language || !code || !problem_name || !testcases) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const [version, template] = generateRunnableCode(
      problem_name,
      language,
      code,
      testcases,
      problem.param_type
    );

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language: language,
        version: version,
        files: [
          {
            name: 'src',
            content: template
          }
        ],
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
      '    while head:',
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
    ]
  }
};

function generateRunnableCode(
  problem_name: string,
  language: string,
  code: string,
  testcases: string,
  params_list: string[]
) {
  let version = '';
  let template = '';

  const isLinkedList = params_list?.includes('linked list');

  switch (language) {
    case 'python':
      version = '3.10.0';
      const linkedListHelpers = isLinkedList ? suffix['linkedlist']['python'] : [];

      template = [
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
          ? '        input_data = [list_to_linkedlist(input_data[i]) if params[i] == "linked list" else input_data[i] for i in range(len(params))]'
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
          ? '        if isinstance(output, ListNode):\n' +
            '            output = linkedlist_to_list(output)\n' +
            '        elif output is None:\n' +
            '            output = []'
          : '',
        '',
        '        results.append({',
        "            'input': testcase['in'],",
        "            'expected': expected,",
        "            'output': output,",
        "            'stdout': stdout_output",
        '        })',
        '',
        '    json_output = json.dumps(results)',
        '    print(json_output)',
        '',
        "if __name__ == '__main__':",
        '    run_test_cases()'
      ].join('\n');
      break;

    default:
      throw new Error('Unsupported language');
  }

  return [version, template];
}
