# Two Sum

> **Difficulty:** Easy  
> **Topic / Pattern:** Arrays & Hashing  
> **Link:** [Two Sum]()

---

## 📝 Problem Statement

Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Constraints:
* 2 <= nums.length <= 10^4
* -10^9 <= nums[i] <= 10^9
* -10^9 <= target <= 10^9
* Only one valid answer exists.

### Examples
```text
Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]
```

---

## 💡 Intuition & Core Approach

* **The Core Idea:** Use a hash map to store each number's value and its index as we iterate. For each number, check if its complement (target minus current number) already exists in the map to find the matching pair in a single pass.
* **Key Steps:**
  - Initialize an empty hash map to store number-index pairs.
  - Iterate through the array, calculating the complement needed for each element.
  - If the complement exists in the map, return the current index and the complement's index.
  - Otherwise, add the current element and its index to the map.

---

---

## 💻 Implementation (Java)

```java
public class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}
```

---

## 📊 Complexity Analysis

| Metric | Complexity | Explanation |
| :--- | :--- | :--- |
| **Time Complexity** | O(N) | We traverse the array of size N exactly once, performing constant-time O(1) lookups and insertions in the hash map. |
| **Space Complexity** | O(N) | In the worst case, we may need to store up to N elements in the hash map before finding the target pair. |

---

## ⚠️ Edge Cases & Pitfalls to Avoid

- The array contains duplicate values that add up to the target (e.g., [3, 3] with target 6).
- The array contains negative numbers and the target is zero or negative.
- The target is formed by the first and last elements of the array.
