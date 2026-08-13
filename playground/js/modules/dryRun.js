// Variable Dry-Run Simulator Module

export const TRACE_DATABASE = {
  'two-sum': {
    title: 'Two Sum (HashMap)',
    code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
    testcases: [
      {
        name: 'nums = [2, 7, 11, 15], target = 9',
        steps: [
          { line: 3, vars: { map: '{}', i: 'N/A', complement: 'N/A' }, explanation: 'Initialize empty HashMap to store values and their index complements.' },
          { line: 4, vars: { map: '{}', i: '0', complement: 'N/A', 'nums[i]': '2' }, explanation: 'Start loop. Check index i = 0 (value nums[0] = 2).' },
          { line: 5, vars: { map: '{}', i: '0', complement: '7', 'nums[i]': '2' }, explanation: 'Calculate complement: target (9) - nums[0] (2) = 7.' },
          { line: 6, vars: { map: '{}', i: '0', complement: '7', 'nums[i]': '2' }, explanation: 'Check map.containsKey(7). Map is empty, returns false.' },
          { line: 9, vars: { map: '{2: 0}', i: '0', complement: '7', 'nums[i]': '2' }, explanation: 'Put nums[0] (2) with index 0 into HashMap.' },
          { line: 4, vars: { map: '{2: 0}', i: '1', complement: '7', 'nums[i]': '7' }, explanation: 'Increment loop. Check index i = 1 (value nums[1] = 7).' },
          { line: 5, vars: { map: '{2: 0}', i: '1', complement: '2', 'nums[i]': '7' }, explanation: 'Calculate complement: target (9) - nums[1] (7) = 2.' },
          { line: 6, vars: { map: '{2: 0}', i: '1', complement: '2', 'nums[i]': '7' }, explanation: 'Check map.containsKey(2). Key 2 exists in map (index 0). Returns true.' },
          { line: 7, vars: { map: '{2: 0}', i: '1', complement: '2', 'nums[i]': '7', result: '[0, 1]' }, explanation: 'Target found! Return index of 2 (0) and current index (1).' }
        ]
      },
      {
        name: 'nums = [3, 2, 4], target = 6',
        steps: [
          { line: 3, vars: { map: '{}', i: 'N/A', complement: 'N/A' }, explanation: 'Initialize empty HashMap.' },
          { line: 4, vars: { map: '{}', i: '0', complement: 'N/A', 'nums[i]': '3' }, explanation: 'Start loop. i = 0 (value 3).' },
          { line: 5, vars: { map: '{}', i: '0', complement: '3', 'nums[i]': '3' }, explanation: 'Calculate complement: 6 - 3 = 3.' },
          { line: 6, vars: { map: '{}', i: '0', complement: '3', 'nums[i]': '3' }, explanation: 'Check map.containsKey(3). Returns false.' },
          { line: 9, vars: { map: '{3: 0}', i: '0', complement: '3', 'nums[i]': '3' }, explanation: 'Put 3 (index 0) into map.' },
          { line: 4, vars: { map: '{3: 0}', i: '1', complement: '3', 'nums[i]': '2' }, explanation: 'Loop increment. i = 1 (value 2).' },
          { line: 5, vars: { map: '{3: 0}', i: '1', complement: '4', 'nums[i]': '2' }, explanation: 'Calculate complement: 6 - 2 = 4.' },
          { line: 6, vars: { map: '{3: 0}', i: '1', complement: '4', 'nums[i]': '2' }, explanation: 'Check map.containsKey(4). Returns false.' },
          { line: 9, vars: { map: '{3: 0, 2: 1}', i: '1', complement: '4', 'nums[i]': '2' }, explanation: 'Put 2 (index 1) into map.' },
          { line: 4, vars: { map: '{3: 0, 2: 1}', i: '2', complement: '4', 'nums[i]': '4' }, explanation: 'Loop increment. i = 2 (value 4).' },
          { line: 5, vars: { map: '{3: 0, 2: 1}', i: '2', complement: '2', 'nums[i]': '4' }, explanation: 'Calculate complement: 6 - 4 = 2.' },
          { line: 6, vars: { map: '{3: 0, 2: 1}', i: '2', complement: '2', 'nums[i]': '4' }, explanation: 'Check map.containsKey(2). Key 2 exists (at index 1). Returns true.' },
          { line: 7, vars: { map: '{3: 0, 2: 1}', i: '2', complement: '2', 'nums[i]': '4', result: '[1, 2]' }, explanation: 'Match found! Return index of 2 (1) and index of 4 (2).' }
        ]
      }
    ]
  },
  'valid-parentheses': {
    title: 'Valid Parentheses (Stack)',
    code: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c)
                return false;
        }
        return stack.isEmpty();
    }
}`,
    testcases: [
      {
        name: 's = "()[]{}"',
        steps: [
          { line: 3, vars: { stack: '[]', c: 'N/A' }, explanation: 'Initialize empty Character stack.' },
          { line: 4, vars: { stack: '[]', c: '(' }, explanation: 'Loop starts. Read char c = \'(\'.' },
          { line: 5, vars: { stack: '[\')\']', c: '(' }, explanation: 'c is \'(\', so push its closing bracket \')\' onto the stack.' },
          { line: 4, vars: { stack: '[\')\']', c: ')' }, explanation: 'Continue loop. Read char c = \')\'.' },
          { line: 8, vars: { stack: '[]', c: ')', popped: ')' }, explanation: 'c is closing. Pop stack. Popped \')\' matches current char \')\'.' },
          { line: 4, vars: { stack: '[]', c: '[' }, explanation: 'Continue loop. Read char c = \'[\'.' },
          { line: 7, vars: { stack: '[\']\']', c: '[' }, explanation: 'c is \'[\', so push its closing bracket \']\' onto the stack.' },
          { line: 4, vars: { stack: '[\']\']', c: ']' }, explanation: 'Continue loop. Read char c = \']\'.' },
          { line: 8, vars: { stack: '[]', c: ']', popped: ']' }, explanation: 'c is closing. Pop stack. Popped \']\' matches current char \']\'.' },
          { line: 4, vars: { stack: '[]', c: '{' }, explanation: 'Continue loop. Read char c = \'{\'.' },
          { line: 6, vars: { stack: '[\'}\']', c: '{' }, explanation: 'c is \'{\', so push its closing bracket \'}\' onto the stack.' },
          { line: 4, vars: { stack: '[\'}\']', c: '}' }, explanation: 'Continue loop. Read char c = \'}\'.' },
          { line: 8, vars: { stack: '[]', c: '}', popped: '}' }, explanation: 'c is closing. Pop stack. Popped \'}\' matches current char \'}\'.' },
          { line: 11, vars: { stack: '[]' }, explanation: 'End loop. Check if stack is empty. Stack is empty, meaning all opened brackets were correctly matched. Return true.' }
        ]
      },
      {
        name: 's = "([)]" (Invalid)',
        steps: [
          { line: 3, vars: { stack: '[]', c: 'N/A' }, explanation: 'Initialize stack.' },
          { line: 4, vars: { stack: '[]', c: '(' }, explanation: 'Read c = \'(\'.' },
          { line: 5, vars: { stack: '[\')\']', c: '(' }, explanation: 'Push \')\' onto the stack.' },
          { line: 4, vars: { stack: '[\')\']', c: '[' }, explanation: 'Read c = \'[\'.' },
          { line: 7, vars: { stack: '[\')\', \']\']', c: '[' }, explanation: 'Push \']\' onto the stack. Stack now contains expected closing brackets in order.' },
          { line: 4, vars: { stack: '[\')\', \']\']', c: ')' }, explanation: 'Read c = \')\'.' },
          { line: 8, vars: { stack: '[\')\']', c: ')', popped: ']' }, explanation: 'c is \')\'. Pop stack. Popped \']\' does NOT match current char \')\'.' },
          { line: 9, vars: { stack: '[\')\']', c: ')', popped: ']' }, explanation: 'Bracket mismatch! Returns false immediately.' }
        ]
      }
    ]
  },
  'binary-tree-inorder': {
    title: 'Binary Tree Inorder DFS',
    code: `class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        helper(root, res);
        return res;
    }

    private void helper(TreeNode node, List<Integer> res) {
        if (node == null) return;
        helper(node.left, res);
        res.add(node.val);
        helper(node.right, res);
    }
}`,
    testcases: [
      {
        name: 'Tree: [1, null, 2, 3]',
        steps: [
          { line: 3, vars: { res: '[]', node: 'N/A' }, explanation: 'Initialize empty results list.' },
          { line: 4, vars: { res: '[]', node: 'Node(1)' }, explanation: 'Invoke helper function starting with the root node (1).' },
          { line: 9, vars: { res: '[]', node: 'Node(1)' }, explanation: 'helper(Node(1)): Node is not null, skip base case.' },
          { line: 10, vars: { res: '[]', node: 'Node(1)' }, explanation: 'Call helper(Node(1).left) which is null.' },
          { line: 9, vars: { res: '[]', node: 'null (left of 1)' }, explanation: 'helper(null): Node is null, return immediately.' },
          { line: 11, vars: { res: '[1]', node: 'Node(1)' }, explanation: 'Resume helper(Node(1)). Add current node value (1) to results.' },
          { line: 12, vars: { res: '[1]', node: 'Node(1)' }, explanation: 'Call helper(Node(1).right) which is Node(2).' },
          { line: 9, vars: { res: '[1]', node: 'Node(2)' }, explanation: 'helper(Node(2)): Node is not null, skip base case.' },
          { line: 10, vars: { res: '[1]', node: 'Node(2)' }, explanation: 'Call helper(Node(2).left) which is Node(3).' },
          { line: 9, vars: { res: '[1]', node: 'Node(3)' }, explanation: 'helper(Node(3)): Node is not null.' },
          { line: 10, vars: { res: '[1]', node: 'Node(3)' }, explanation: 'Call helper(Node(3).left) which is null.' },
          { line: 9, vars: { res: '[1]', node: 'null' }, explanation: 'helper(null): Returns.' },
          { line: 11, vars: { res: '[1, 3]', node: 'Node(3)' }, explanation: 'Resume helper(Node(3)). Add Node(3) value (3) to results.' },
          { line: 12, vars: { res: '[1, 3]', node: 'Node(3)' }, explanation: 'Call helper(Node(3).right) which is null. Returns immediately.' },
          { line: 11, vars: { res: '[1, 3, 2]', node: 'Node(2)' }, explanation: 'Resume helper(Node(2)). Add Node(2) value (2) to results.' },
          { line: 12, vars: { res: '[1, 3, 2]', node: 'Node(2)' }, explanation: 'Call helper(Node(2).right) which is null. Returns immediately.' },
          { line: 5, vars: { res: '[1, 3, 2]' }, explanation: 'Helper execution complete. Return final list: [1, 3, 2].' }
        ]
      }
    ]
  }
};

export function loadDryRun(problemKey) {
  const problem = TRACE_DATABASE[problemKey];
  if (!problem) return null;
  return problem;
}

// Fallback for custom code when not pre-configured
export function generateGenericTrace(code) {
  return {
    title: 'Custom Note Code Trace',
    code: code || `// No code block found in note`,
    testcases: [
      {
        name: 'Default Test Case',
        steps: [
          { line: 1, vars: { state: 'Initial' }, explanation: 'Starting execution tracing of your custom implementation.' },
          { line: 2, vars: { state: 'Processing' }, explanation: 'Scanning elements. Check variables list for states.' },
          { line: 3, vars: { state: 'Finished' }, explanation: 'Trace completed successfully.' }
        ]
      }
    ]
  };
}
