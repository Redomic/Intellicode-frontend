/**
 * Sample coding questions data
 * Structure follows LeetCode-style problems
 */

export const sampleQuestions = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    description: `
      <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
      <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
      <p>You can return the answer in any order.</p>
    `,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 6, we return [0, 1]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    functionSignature: {
      python: "nums: List[int], target: int",
      java: "int[] twoSum(int[] nums, int target)"
    },
    pythonTemplate: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    pass

# Test your solution
if __name__ == "__main__":
    # Test case 1
    nums1 = [2, 7, 11, 15]
    target1 = 9
    result1 = twoSum(nums1, target1)
    print(f"Input: nums = {nums1}, target = {target1}")
    print(f"Output: {result1}")
    print()
    
    # Test case 2
    nums2 = [3, 2, 4]
    target2 = 6
    result2 = twoSum(nums2, target2)
    print(f"Input: nums = {nums2}, target = {target2}")
    print(f"Output: {result2}")`,
    javaTemplate: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        
        // Test case 1
        int[] nums1 = {2, 7, 11, 15};
        int target1 = 9;
        int[] result1 = solution.twoSum(nums1, target1);
        System.out.println("Input: nums = " + java.util.Arrays.toString(nums1) + ", target = " + target1);
        System.out.println("Output: " + java.util.Arrays.toString(result1));
        System.out.println();
        
        // Test case 2
        int[] nums2 = {3, 2, 4};
        int target2 = 6;
        int[] result2 = solution.twoSum(nums2, target2);
        System.out.println("Input: nums = " + java.util.Arrays.toString(nums2) + ", target = " + target2);
        System.out.println("Output: " + java.util.Arrays.toString(result2));
    }
}`
  },
  {
    id: 2,
    title: "Reverse Integer",
    difficulty: "Medium",
    tags: ["Math"],
    description: `
      <p>Given a signed 32-bit integer <code>x</code>, return <code>x</code> with its digits reversed. If reversing <code>x</code> causes the value to go outside the signed 32-bit integer range <code>[-2^31, 2^31 - 1]</code>, then return <code>0</code>.</p>
      <p><strong>Assume the environment does not allow you to store 64-bit integers (signed or unsigned).</strong></p>
    `,
    examples: [
      {
        input: "x = 123",
        output: "321",
        explanation: ""
      },
      {
        input: "x = -123",
        output: "-321",
        explanation: ""
      },
      {
        input: "x = 120",
        output: "21",
        explanation: ""
      }
    ],
    constraints: [
      "-2^31 <= x <= 2^31 - 1"
    ],
    functionSignature: {
      python: "x: int",
      java: "int reverse(int x)"
    },
    pythonTemplate: `def reverse(x):
    """
    :type x: int
    :rtype: int
    """
    # Write your solution here
    pass

# Test your solution
if __name__ == "__main__":
    # Test cases
    test_cases = [123, -123, 120, 0]
    
    for x in test_cases:
        result = reverse(x)
        print(f"Input: x = {x}")
        print(f"Output: {result}")
        print()`,
    javaTemplate: `class Solution {
    public int reverse(int x) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        
        // Test cases
        int[] testCases = {123, -123, 120, 0};
        
        for (int x : testCases) {
            int result = solution.reverse(x);
            System.out.println("Input: x = " + x);
            System.out.println("Output: " + result);
            System.out.println();
        }
    }
}`
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    description: `
      <p>Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.</p>
    `,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation: 'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.'
      }
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    functionSignature: {
      python: "s: str",
      java: "int lengthOfLongestSubstring(String s)"
    },
    pythonTemplate: `def lengthOfLongestSubstring(s):
    """
    :type s: str
    :rtype: int
    """
    # Write your solution here
    pass

# Test your solution
if __name__ == "__main__":
    test_cases = ["abcabcbb", "bbbbb", "pwwkew", ""]
    
    for s in test_cases:
        result = lengthOfLongestSubstring(s)
        print(f'Input: s = "{s}"')
        print(f"Output: {result}")
        print()`,
    javaTemplate: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        
        String[] testCases = {"abcabcbb", "bbbbb", "pwwkew", ""};
        
        for (String s : testCases) {
            int result = solution.lengthOfLongestSubstring(s);
            System.out.println("Input: s = \\"" + s + "\\"");
            System.out.println("Output: " + result);
            System.out.println();
        }
    }
}`
  },
  {
    id: 4,
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    description: `
      <p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p>
      <p>An input string is valid if:</p>
      <ol>
        <li>Open brackets must be closed by the same type of brackets.</li>
        <li>Open brackets must be closed in the correct order.</li>
        <li>Every close bracket has a corresponding open bracket of the same type.</li>
      </ol>
    `,
    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: ""
      },
      {
        input: 's = "()[]{}"',
        output: "true",
        explanation: ""
      },
      {
        input: 's = "(]"',
        output: "false",
        explanation: ""
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    functionSignature: {
      python: "s: str",
      java: "boolean isValid(String s)"
    },
    pythonTemplate: `def isValid(s):
    """
    :type s: str
    :rtype: bool
    """
    # Write your solution here
    pass

# Test your solution
if __name__ == "__main__":
    test_cases = ["()", "()[]{}", "(]", "([)]", "{[]}"]
    
    for s in test_cases:
        result = isValid(s)
        print(f'Input: s = "{s}"')
        print(f"Output: {result}")
        print()`,
    javaTemplate: `class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        return false;
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        
        String[] testCases = {"()", "()[]{}", "(]", "([)]", "{[]}"};
        
        for (String s : testCases) {
            boolean result = solution.isValid(s);
            System.out.println("Input: s = \\"" + s + "\\"");
            System.out.println("Output: " + result);
            System.out.println();
        }
    }
}`
  },
  {
    id: 5,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    description: `
      <p>You are given the heads of two sorted linked lists <code>list1</code> and <code>list2</code>.</p>
      <p>Merge the two lists into one <strong>sorted</strong> list. The list should be made by splicing together the nodes of the first two lists.</p>
      <p>Return <em>the head of the merged linked list</em>.</p>
    `,
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
        explanation: ""
      },
      {
        input: "list1 = [], list2 = []",
        output: "[]",
        explanation: ""
      },
      {
        input: "list1 = [], list2 = [0]",
        output: "[0]",
        explanation: ""
      }
    ],
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order."
    ],
    functionSignature: {
      python: "list1: Optional[ListNode], list2: Optional[ListNode]",
      java: "ListNode mergeTwoLists(ListNode list1, ListNode list2)"
    },
    pythonTemplate: `# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def mergeTwoLists(list1, list2):
    """
    :type list1: Optional[ListNode]
    :type list2: Optional[ListNode]
    :rtype: Optional[ListNode]
    """
    # Write your solution here
    pass

# Helper function to create linked list from array
def create_linked_list(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    current = head
    for val in arr[1:]:
        current.next = ListNode(val)
        current = current.next
    return head

# Helper function to convert linked list to array
def linked_list_to_array(head):
    result = []
    current = head
    while current:
        result.append(current.val)
        current = current.next
    return result

# Test your solution
if __name__ == "__main__":
    # Test case 1
    list1 = create_linked_list([1, 2, 4])
    list2 = create_linked_list([1, 3, 4])
    result = mergeTwoLists(list1, list2)
    print("Input: list1 = [1,2,4], list2 = [1,3,4]")
    print(f"Output: {linked_list_to_array(result)}")`,
    javaTemplate: `/**
 * Definition for singly-linked list.
 */
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Write your solution here
        return null;
    }
    
    // Helper method to create linked list from array
    public static ListNode createLinkedList(int[] arr) {
        if (arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode current = head;
        for (int i = 1; i < arr.length; i++) {
            current.next = new ListNode(arr[i]);
            current = current.next;
        }
        return head;
    }
    
    // Helper method to print linked list
    public static void printLinkedList(ListNode head) {
        System.out.print("[");
        while (head != null) {
            System.out.print(head.val);
            if (head.next != null) System.out.print(",");
            head = head.next;
        }
        System.out.println("]");
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        
        // Test case 1
        ListNode list1 = createLinkedList(new int[]{1, 2, 4});
        ListNode list2 = createLinkedList(new int[]{1, 3, 4});
        ListNode result = solution.mergeTwoLists(list1, list2);
        System.out.println("Input: list1 = [1,2,4], list2 = [1,3,4]");
        System.out.print("Output: ");
        printLinkedList(result);
    }
}`
  }
];

export default sampleQuestions;


