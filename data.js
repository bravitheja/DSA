/* Auto-generated from data.json — run: node scripts/build-data-js.mjs */
window.__DSA_DATA = [
  {
    "problem": "LRU Cache",
    "link": "https://leetcode.com/problems/lru-cache",
    "pattern": "Design",
    "subPattern": "HashMap + Doubly Linked List",
    "difficulty": "Medium",
    "coreIdea": "Combine hashmap for O(1) lookup with doubly linked list for O(1) eviction/order updates.",
    "complexity": "O(1) | O(capacity)",
    "frequency": 616
  },
  {
    "problem": "Two Sum",
    "link": "https://leetcode.com/problems/two-sum",
    "pattern": "Hashing",
    "subPattern": "Complement lookup",
    "difficulty": "Easy",
    "coreIdea": "Store visited numbers and check whether complement already exists.",
    "complexity": "O(n) | O(n)",
    "frequency": 616
  },
  {
    "problem": "Longest Substring Without Repeating Characters",
    "link": "https://leetcode.com/problems/longest-substring-without-repeating-characters",
    "pattern": "Sliding Window",
    "subPattern": "Variable window with last seen index",
    "difficulty": "Medium",
    "coreIdea": "Expand right pointer and move left pointer past duplicates using last-seen positions.",
    "complexity": "O(n) | O(k)",
    "frequency": 544
  },
  {
    "problem": "Valid Parentheses",
    "link": "https://leetcode.com/problems/valid-parentheses",
    "pattern": "Stack",
    "subPattern": "Bracket matching",
    "difficulty": "Easy",
    "coreIdea": "Push opening brackets and ensure each closing bracket matches stack top.",
    "complexity": "O(n) | O(n)",
    "frequency": 542
  },
  {
    "problem": "Merge Intervals",
    "link": "https://leetcode.com/problems/merge-intervals",
    "pattern": "Intervals",
    "subPattern": "Sort and sweep",
    "difficulty": "Medium",
    "coreIdea": "Sort by start time and merge overlapping intervals while scanning once.",
    "complexity": "O(n log n) | O(n)",
    "frequency": 488
  },
  {
    "problem": "Best Time to Buy and Sell Stock",
    "link": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock",
    "pattern": "Greedy",
    "subPattern": "Track running minimum",
    "difficulty": "Easy",
    "coreIdea": "Track lowest price so far and update max profit at each day.",
    "complexity": "O(n) | O(1)",
    "frequency": 480
  },
  {
    "problem": "Number of Islands",
    "link": "https://leetcode.com/problems/number-of-islands",
    "pattern": "Graph",
    "subPattern": "Grid DFS/BFS flood fill",
    "difficulty": "Medium",
    "coreIdea": "Count connected components by flooding each unvisited land cell.",
    "complexity": "O(mn) | O(mn)",
    "frequency": 436
  },
  {
    "problem": "Group Anagrams",
    "link": "https://leetcode.com/problems/group-anagrams",
    "pattern": "Hashing",
    "subPattern": "Canonical key grouping",
    "difficulty": "Medium",
    "coreIdea": "Map each string by sorted key or frequency signature to group anagrams.",
    "complexity": "O(nk log k) | O(nk)",
    "frequency": 408
  },
  {
    "problem": "Longest Palindromic Substring",
    "link": "https://leetcode.com/problems/longest-palindromic-substring",
    "pattern": "Two Pointers",
    "subPattern": "Expand around center",
    "difficulty": "Medium",
    "coreIdea": "Expand from each center (odd/even) and keep the longest palindrome.",
    "complexity": "O(n^2) | O(1)",
    "frequency": 372
  },
  {
    "problem": "Trapping Rain Water",
    "link": "https://leetcode.com/problems/trapping-rain-water",
    "pattern": "Two Pointers",
    "subPattern": "Left-right max boundaries",
    "difficulty": "Hard",
    "coreIdea": "Move pointer on smaller side while tracking leftMax/rightMax to accumulate trapped water.",
    "complexity": "O(n) | O(1)",
    "frequency": 368
  },
  {
    "problem": "Maximum Subarray",
    "link": "https://leetcode.com/problems/maximum-subarray",
    "pattern": "Dynamic Programming",
    "subPattern": "Kadane's algorithm",
    "difficulty": "Medium",
    "coreIdea": "Either extend current subarray or restart at current number to maximize sum.",
    "complexity": "O(n) | O(1)",
    "frequency": 312
  },
  {
    "problem": "3Sum",
    "link": "https://leetcode.com/problems/3sum",
    "pattern": "Two Pointers",
    "subPattern": "Sort with fixed anchor",
    "difficulty": "Medium",
    "coreIdea": "Sort array, fix one element, and use two pointers to find complementary pair.",
    "complexity": "O(n^2) | O(1)",
    "frequency": 286
  },
  {
    "problem": "Container With Most Water",
    "link": "https://leetcode.com/problems/container-with-most-water",
    "pattern": "Two Pointers",
    "subPattern": "Shrink from shorter side",
    "difficulty": "Medium",
    "coreIdea": "Start with widest container and move shorter wall inward to seek larger area.",
    "complexity": "O(n) | O(1)",
    "frequency": 278
  },
  {
    "problem": "Longest Common Prefix",
    "link": "https://leetcode.com/problems/longest-common-prefix",
    "pattern": "String",
    "subPattern": "Vertical scanning",
    "difficulty": "Easy",
    "coreIdea": "Compare characters column-wise across all strings until mismatch.",
    "complexity": "O(nm) | O(1)",
    "frequency": 264
  },
  {
    "problem": "Search in Rotated Sorted Array",
    "link": "https://leetcode.com/problems/search-in-rotated-sorted-array",
    "pattern": "Binary Search",
    "subPattern": "Sorted half detection",
    "difficulty": "Medium",
    "coreIdea": "At each step identify sorted half and decide if target lies inside it.",
    "complexity": "O(log n) | O(1)",
    "frequency": 260
  },
  {
    "problem": "Merge k Sorted Lists",
    "link": "https://leetcode.com/problems/merge-k-sorted-lists",
    "pattern": "Heap",
    "subPattern": "Min-heap of list heads",
    "difficulty": "Hard",
    "coreIdea": "Push each list head into min-heap and repeatedly extract/push next nodes.",
    "complexity": "O(N log k) | O(k)",
    "frequency": 254
  },
  {
    "problem": "Top K Frequent Elements",
    "link": "https://leetcode.com/problems/top-k-frequent-elements",
    "pattern": "Heap",
    "subPattern": "Frequency map + heap",
    "difficulty": "Medium",
    "coreIdea": "Count frequencies and keep top-k using heap or bucket sort.",
    "complexity": "O(n log k) | O(n)",
    "frequency": 254
  },
  {
    "problem": "Rotting Oranges",
    "link": "https://leetcode.com/problems/rotting-oranges",
    "pattern": "Graph",
    "subPattern": "Multi-source BFS",
    "difficulty": "Medium",
    "coreIdea": "Run BFS from all rotten oranges simultaneously and track elapsed minutes by levels.",
    "complexity": "O(mn) | O(mn)",
    "frequency": 252
  },
  {
    "problem": "Spiral Matrix",
    "link": "https://leetcode.com/problems/spiral-matrix",
    "pattern": "Matrix",
    "subPattern": "Boundary traversal",
    "difficulty": "Medium",
    "coreIdea": "Traverse matrix in layers using top, bottom, left, and right boundaries.",
    "complexity": "O(mn) | O(1)",
    "frequency": 246
  },
  {
    "problem": "Move Zeroes",
    "link": "https://leetcode.com/problems/move-zeroes",
    "pattern": "Two Pointers",
    "subPattern": "Stable compaction",
    "difficulty": "Easy",
    "coreIdea": "Compact non-zero values forward and fill remaining positions with zeros.",
    "complexity": "O(n) | O(1)",
    "frequency": 238
  },
  {
    "problem": "Sliding Window Maximum",
    "link": "https://leetcode.com/problems/sliding-window-maximum",
    "pattern": "Deque",
    "subPattern": "Monotonic decreasing queue",
    "difficulty": "Hard",
    "coreIdea": "Maintain deque of candidate indices in decreasing order for O(1) max access.",
    "complexity": "O(n) | O(k)",
    "frequency": 236
  },
  {
    "problem": "Median of Two Sorted Arrays",
    "link": "https://leetcode.com/problems/median-of-two-sorted-arrays",
    "pattern": "Binary Search",
    "subPattern": "Partition on smaller array",
    "difficulty": "Hard",
    "coreIdea": "Binary search partition so left halves contain exactly half the elements with valid ordering.",
    "complexity": "O(log(min(m,n))) | O(1)",
    "frequency": 230
  },
  {
    "problem": "Subarray Sum Equals K",
    "link": "https://leetcode.com/problems/subarray-sum-equals-k",
    "pattern": "Prefix Sum",
    "subPattern": "Prefix frequency hashmap",
    "difficulty": "Medium",
    "coreIdea": "For each prefix sum, count how many previous prefixes equal current-k.",
    "complexity": "O(n) | O(n)",
    "frequency": 228
  },
  {
    "problem": "Course Schedule",
    "link": "https://leetcode.com/problems/course-schedule",
    "pattern": "Graph",
    "subPattern": "Topological cycle detection",
    "difficulty": "Medium",
    "coreIdea": "Detect cycle with indegree BFS or DFS states to verify DAG feasibility.",
    "complexity": "O(V+E) | O(V+E)",
    "frequency": 224
  },
  {
    "problem": "Meeting Rooms II",
    "link": "https://leetcode.com/problems/meeting-rooms-ii",
    "pattern": "Heap",
    "subPattern": "Min-heap of end times",
    "difficulty": "Medium",
    "coreIdea": "Sort by start time and reuse room if earliest ending meeting has finished.",
    "complexity": "O(n log n) | O(n)",
    "frequency": 218
  },
  {
    "problem": "Insert Delete GetRandom O(1)",
    "link": "https://leetcode.com/problems/insert-delete-getrandom-o1",
    "pattern": "Design",
    "subPattern": "Array + hashmap index swap",
    "difficulty": "Medium",
    "coreIdea": "Store values in array and map value->index for O(1) insert/remove/random.",
    "complexity": "O(1) | O(n)",
    "frequency": 214
  },
  {
    "problem": "Product of Array Except Self",
    "link": "https://leetcode.com/problems/product-of-array-except-self",
    "pattern": "Prefix Sum",
    "subPattern": "Prefix and suffix products",
    "difficulty": "Medium",
    "coreIdea": "Use left products then multiply by running right products without division.",
    "complexity": "O(n) | O(1)",
    "frequency": 214
  },
  {
    "problem": "Decode String",
    "link": "https://leetcode.com/problems/decode-string",
    "pattern": "Stack",
    "subPattern": "Nested repetition parsing",
    "difficulty": "Medium",
    "coreIdea": "Use stacks to decode bracketed substrings with repeat counts.",
    "complexity": "O(n) | O(n)",
    "frequency": 212
  },
  {
    "problem": "Kth Largest Element in an Array",
    "link": "https://leetcode.com/problems/kth-largest-element-in-an-array",
    "pattern": "Heap",
    "subPattern": "Min-heap of size k",
    "difficulty": "Medium",
    "coreIdea": "Maintain min-heap of k largest seen values so root is kth largest.",
    "complexity": "O(n log k) | O(k)",
    "frequency": 212
  },
  {
    "problem": "Valid Palindrome",
    "link": "https://leetcode.com/problems/valid-palindrome",
    "pattern": "Two Pointers",
    "subPattern": "Skip non-alphanumeric",
    "difficulty": "Easy",
    "coreIdea": "Move inward from both ends comparing normalized alphanumeric characters.",
    "complexity": "O(n) | O(1)",
    "frequency": 210
  },
  {
    "problem": "Text Justification",
    "link": "https://leetcode.com/problems/text-justification",
    "pattern": "Greedy",
    "subPattern": "Line packing with space distribution",
    "difficulty": "Hard",
    "coreIdea": "Greedily fill each line then distribute spaces evenly, left-biased remainder.",
    "complexity": "O(n) | O(1)",
    "frequency": 204
  },
  {
    "problem": "Merge Sorted Array",
    "link": "https://leetcode.com/problems/merge-sorted-array",
    "pattern": "Two Pointers",
    "subPattern": "Reverse merge from tail",
    "difficulty": "Easy",
    "coreIdea": "Fill nums1 from the end using largest of nums1 tail and nums2 tail.",
    "complexity": "O(m+n) | O(1)",
    "frequency": 204
  },
  {
    "problem": "Roman to Integer",
    "link": "https://leetcode.com/problems/roman-to-integer",
    "pattern": "String",
    "subPattern": "Subtractive pair parsing",
    "difficulty": "Easy",
    "coreIdea": "Add symbol values, subtract when a smaller symbol appears before a larger one.",
    "complexity": "O(n) | O(1)",
    "frequency": 204
  },
  {
    "problem": "Coin Change",
    "link": "https://leetcode.com/problems/coin-change",
    "pattern": "Dynamic Programming",
    "subPattern": "Unbounded knapsack minimum coins",
    "difficulty": "Medium",
    "coreIdea": "Build dp[amount] from smaller amounts using each coin choice.",
    "complexity": "O(amount*n) | O(amount)",
    "frequency": 202
  },
  {
    "problem": "Word Search",
    "link": "https://leetcode.com/problems/word-search",
    "pattern": "Backtracking",
    "subPattern": "Grid DFS with visited marking",
    "difficulty": "Medium",
    "coreIdea": "Try DFS from each cell while marking used cells along current path.",
    "complexity": "O(mn*4^L) | O(L)",
    "frequency": 196
  },
  {
    "problem": "Valid Anagram",
    "link": "https://leetcode.com/problems/valid-anagram",
    "pattern": "Hashing",
    "subPattern": "Character frequency counting",
    "difficulty": "Easy",
    "coreIdea": "Count character frequencies and compare both strings' counts.",
    "complexity": "O(n) | O(1)",
    "frequency": 196
  },
  {
    "problem": "String Compression",
    "link": "https://leetcode.com/problems/string-compression",
    "pattern": "Two Pointers",
    "subPattern": "Read-write pointer compaction",
    "difficulty": "Medium",
    "coreIdea": "Scan runs and write character plus count digits in-place.",
    "complexity": "O(n) | O(1)",
    "frequency": 196
  },
  {
    "problem": "Climbing Stairs",
    "link": "https://leetcode.com/problems/climbing-stairs",
    "pattern": "Dynamic Programming",
    "subPattern": "Fibonacci transition",
    "difficulty": "Easy",
    "coreIdea": "Ways to reach step i equals ways(i-1)+ways(i-2).",
    "complexity": "O(n) | O(1)",
    "frequency": 190
  },
  {
    "problem": "Koko Eating Bananas",
    "link": "https://leetcode.com/problems/koko-eating-bananas",
    "pattern": "Binary Search",
    "subPattern": "Search answer space",
    "difficulty": "Medium",
    "coreIdea": "Binary search minimal eating speed that finishes all piles within h hours.",
    "complexity": "O(n log m) | O(1)",
    "frequency": 190
  },
  {
    "problem": "Course Schedule II",
    "link": "https://leetcode.com/problems/course-schedule-ii",
    "pattern": "Graph",
    "subPattern": "Topological ordering",
    "difficulty": "Medium",
    "coreIdea": "Run Kahn’s algorithm to output valid topological order if no cycle exists.",
    "complexity": "O(V+E) | O(V+E)",
    "frequency": 188
  },
  {
    "problem": "Word Ladder",
    "link": "https://leetcode.com/problems/word-ladder",
    "pattern": "Graph",
    "subPattern": "BFS shortest transformation",
    "difficulty": "Hard",
    "coreIdea": "Use BFS over word transformations to find minimum number of steps.",
    "complexity": "O(N*L*26) | O(N)",
    "frequency": 188
  },
  {
    "problem": "Generate Parentheses",
    "link": "https://leetcode.com/problems/generate-parentheses",
    "pattern": "Backtracking",
    "subPattern": "Balanced parenthesis generation",
    "difficulty": "Medium",
    "coreIdea": "Build strings recursively while never allowing closing count to exceed opening count.",
    "complexity": "O(4^n/sqrt(n)) | O(n)",
    "frequency": 186
  },
  {
    "problem": "Merge Two Sorted Lists",
    "link": "https://leetcode.com/problems/merge-two-sorted-lists",
    "pattern": "Linked List",
    "subPattern": "Dummy-head merge",
    "difficulty": "Easy",
    "coreIdea": "Use dummy node and repeatedly append smaller current list node.",
    "complexity": "O(m+n) | O(1)",
    "frequency": 186
  },
  {
    "problem": "Minimum Window Substring",
    "link": "https://leetcode.com/problems/minimum-window-substring",
    "pattern": "Sliding Window",
    "subPattern": "Need/have frequency window",
    "difficulty": "Hard",
    "coreIdea": "Expand to satisfy required counts, then contract to minimize valid window.",
    "complexity": "O(n) | O(k)",
    "frequency": 184
  },
  {
    "problem": "Find Median from Data Stream",
    "link": "https://leetcode.com/problems/find-median-from-data-stream",
    "pattern": "Heap",
    "subPattern": "Two-heaps balancing",
    "difficulty": "Hard",
    "coreIdea": "Maintain max-heap for lower half and min-heap for upper half balanced by size.",
    "complexity": "O(log n) | O(n)",
    "frequency": 184
  },
  {
    "problem": "House Robber",
    "link": "https://leetcode.com/problems/house-robber",
    "pattern": "Dynamic Programming",
    "subPattern": "Take-or-skip linear DP",
    "difficulty": "Medium",
    "coreIdea": "At each house choose max of robbing it plus i-2 or skipping it with i-1.",
    "complexity": "O(n) | O(1)",
    "frequency": 182
  },
  {
    "problem": "Rotate Image",
    "link": "https://leetcode.com/problems/rotate-image",
    "pattern": "Matrix",
    "subPattern": "Transpose + reverse rows",
    "difficulty": "Medium",
    "coreIdea": "Rotate 90° clockwise by transposing matrix then reversing each row.",
    "complexity": "O(n^2) | O(1)",
    "frequency": 182
  },
  {
    "problem": "Letter Combinations of a Phone Number",
    "link": "https://leetcode.com/problems/letter-combinations-of-a-phone-number",
    "pattern": "Backtracking",
    "subPattern": "Cartesian product DFS",
    "difficulty": "Medium",
    "coreIdea": "Recursively append each possible letter for current digit.",
    "complexity": "O(4^n) | O(n)",
    "frequency": 180
  },
  {
    "problem": "Palindrome Number",
    "link": "https://leetcode.com/problems/palindrome-number",
    "pattern": "Math",
    "subPattern": "Reverse half integer",
    "difficulty": "Easy",
    "coreIdea": "Reverse half of the number and compare with remaining half.",
    "complexity": "O(log n) | O(1)",
    "frequency": 178
  },
  {
    "problem": "Longest Consecutive Sequence",
    "link": "https://leetcode.com/problems/longest-consecutive-sequence",
    "pattern": "Hashing",
    "subPattern": "Sequence start detection",
    "difficulty": "Medium",
    "coreIdea": "Only start counting from numbers whose predecessor is absent.",
    "complexity": "O(n) | O(n)",
    "frequency": 178
  },
  {
    "problem": "Min Stack",
    "link": "https://leetcode.com/problems/min-stack",
    "pattern": "Stack",
    "subPattern": "Stack with running minimum",
    "difficulty": "Medium",
    "coreIdea": "Store value with current minimum at each push for O(1) min queries.",
    "complexity": "O(1) | O(n)",
    "frequency": 178
  },
  {
    "problem": "Add Two Numbers",
    "link": "https://leetcode.com/problems/add-two-numbers",
    "pattern": "Linked List",
    "subPattern": "Digit-wise carry simulation",
    "difficulty": "Medium",
    "coreIdea": "Traverse both lists adding digits and carry into a new result list.",
    "complexity": "O(max(m,n)) | O(max(m,n))",
    "frequency": 178
  },
  {
    "problem": "Time Based Key-Value Store",
    "link": "https://leetcode.com/problems/time-based-key-value-store",
    "pattern": "Binary Search",
    "subPattern": "Timestamped map lookup",
    "difficulty": "Medium",
    "coreIdea": "Store sorted timestamp-value pairs per key and binary search latest <= query timestamp.",
    "complexity": "O(log n) | O(n)",
    "frequency": 174
  },
  {
    "problem": "Reverse Linked List",
    "link": "https://leetcode.com/problems/reverse-linked-list",
    "pattern": "Linked List",
    "subPattern": "Pointer reversal",
    "difficulty": "Easy",
    "coreIdea": "Iteratively reverse next pointers while moving through list.",
    "complexity": "O(n) | O(1)",
    "frequency": 170
  },
  {
    "problem": "Jump Game",
    "link": "https://leetcode.com/problems/jump-game",
    "pattern": "Greedy",
    "subPattern": "Farthest reachable index",
    "difficulty": "Medium",
    "coreIdea": "Track farthest reachable position and fail if current index exceeds it.",
    "complexity": "O(n) | O(1)",
    "frequency": 170
  },
  {
    "problem": "Asteroid Collision",
    "link": "https://leetcode.com/problems/asteroid-collision",
    "pattern": "Stack",
    "subPattern": "Collision simulation",
    "difficulty": "Medium",
    "coreIdea": "Use stack to resolve collisions between right-moving and left-moving asteroids.",
    "complexity": "O(n) | O(n)",
    "frequency": 166
  },
  {
    "problem": "Word Break",
    "link": "https://leetcode.com/problems/word-break",
    "pattern": "Dynamic Programming",
    "subPattern": "Prefix segmentation DP",
    "difficulty": "Medium",
    "coreIdea": "dp[i] is true if some j<i has dp[j] true and s[j:i] in dictionary.",
    "complexity": "O(n^2) | O(n)",
    "frequency": 164
  },
  {
    "problem": "Basic Calculator II",
    "link": "https://leetcode.com/problems/basic-calculator-ii",
    "pattern": "Stack",
    "subPattern": "Operator precedence parsing",
    "difficulty": "Medium",
    "coreIdea": "Process numbers/operators left to right, applying * and / immediately via stack.",
    "complexity": "O(n) | O(n)",
    "frequency": 164
  },
  {
    "problem": "Find First and Last Position of Element in Sorted Array",
    "link": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array",
    "pattern": "Binary Search",
    "subPattern": "Lower and upper bound search",
    "difficulty": "Medium",
    "coreIdea": "Run binary search twice to find first and last index of target.",
    "complexity": "O(log n) | O(1)",
    "frequency": 162
  },
  {
    "problem": "Daily Temperatures",
    "link": "https://leetcode.com/problems/daily-temperatures",
    "pattern": "Stack",
    "subPattern": "Monotonic decreasing stack",
    "difficulty": "Medium",
    "coreIdea": "Maintain stack of unresolved indices; pop when warmer day appears.",
    "complexity": "O(n) | O(n)",
    "frequency": 160
  },
  {
    "problem": "Sort Colors",
    "link": "https://leetcode.com/problems/sort-colors",
    "pattern": "Two Pointers",
    "subPattern": "Dutch national flag partition",
    "difficulty": "Medium",
    "coreIdea": "Partition array into 0s,1s,2s using low/mid/high pointers.",
    "complexity": "O(n) | O(1)",
    "frequency": 158
  },
  {
    "problem": "First Missing Positive",
    "link": "https://leetcode.com/problems/first-missing-positive",
    "pattern": "Array",
    "subPattern": "Index placement hashing",
    "difficulty": "Hard",
    "coreIdea": "Place each value x at index x-1 when possible, then scan for mismatch.",
    "complexity": "O(n) | O(1)",
    "frequency": 156
  },
  {
    "problem": "Find Peak Element",
    "link": "[https://leetcode.com/problems/find-peak-element](https://leetcode.com/problems/find-peak-element)",
    "pattern": "Binary Search",
    "subPattern": "Local Maxima",
    "difficulty": "Medium",
    "coreIdea": "Binary search to find an index where neighbors are smaller",
    "complexity": "O(log n) | O(1)",
    "frequency": 156
  },
  {
    "problem": "Integer to Roman",
    "link": "[https://leetcode.com/problems/integer-to-roman](https://leetcode.com/problems/integer-to-roman)",
    "pattern": "Math",
    "subPattern": "Greedy subtraction",
    "difficulty": "Medium",
    "coreIdea": "Iteratively subtract largest possible Roman values",
    "complexity": "O(1) | O(1)",
    "frequency": 154
  },
  {
    "problem": "Valid Sudoku",
    "link": "[https://leetcode.com/problems/valid-sudoku](https://leetcode.com/problems/valid-sudoku)",
    "pattern": "Hashing",
    "subPattern": "Matrix validation",
    "difficulty": "Medium",
    "coreIdea": "Use hash sets to track seen digits in rows, columns, and boxes",
    "complexity": "O(1) | O(1)",
    "frequency": 150
  },
  {
    "problem": "Best Time to Buy and Sell Stock II",
    "link": "[https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii)",
    "pattern": "Greedy",
    "subPattern": "Peak-Valley",
    "difficulty": "Medium",
    "coreIdea": "Accumulate all positive price differences between consecutive days",
    "complexity": "O(n) | O(1)",
    "frequency": 150
  },
  {
    "problem": "Longest Increasing Subsequence",
    "link": "[https://leetcode.com/problems/longest-increasing-subsequence](https://leetcode.com/problems/longest-increasing-subsequence)",
    "pattern": "DP",
    "subPattern": "Patience Sorting",
    "difficulty": "Medium",
    "coreIdea": "Maintain smallest possible tail values for subsequences via binary search",
    "complexity": "O(n log n) | O(n)",
    "frequency": 148
  },
  {
    "problem": "Largest Rectangle in Histogram",
    "link": "[https://leetcode.com/problems/largest-rectangle-in-histogram](https://leetcode.com/problems/largest-rectangle-in-histogram)",
    "pattern": "Stack",
    "subPattern": "Monotonic Stack",
    "difficulty": "Hard",
    "coreIdea": "Find nearest smaller heights to the left and right using a stack",
    "complexity": "O(n) | O(n)",
    "frequency": 148
  },
  {
    "problem": "Next Permutation",
    "link": "[https://leetcode.com/problems/next-permutation](https://leetcode.com/problems/next-permutation)",
    "pattern": "Two Pointers",
    "subPattern": "Lexicographical order",
    "difficulty": "Medium",
    "coreIdea": "Find first decreasing element, swap with next larger, and reverse suffix",
    "complexity": "O(n) | O(1)",
    "frequency": 148
  },
  {
    "problem": "Happy Number",
    "link": "[https://leetcode.com/problems/happy-number](https://leetcode.com/problems/happy-number)",
    "pattern": "Hashing",
    "subPattern": "Cycle Detection",
    "difficulty": "Easy",
    "coreIdea": "Use a hash set to detect cycles in sum of squares of digits",
    "complexity": "O(log n) | O(log n)",
    "frequency": 148
  },
  {
    "problem": "Rotate Array",
    "link": "[https://leetcode.com/problems/rotate-array](https://leetcode.com/problems/rotate-array)",
    "pattern": "Array",
    "subPattern": "Reversal Strategy",
    "difficulty": "Medium",
    "coreIdea": "Reverse entire array, then reverse segments divided by k",
    "complexity": "O(n) | O(1)",
    "frequency": 146
  },
  {
    "problem": "Reverse Words in a String",
    "link": "[https://leetcode.com/problems/reverse-words-in-a-string](https://leetcode.com/problems/reverse-words-in-a-string)",
    "pattern": "String",
    "subPattern": "Two Pointers",
    "difficulty": "Medium",
    "coreIdea": "Reverse the entire string and then reverse each individual word",
    "complexity": "O(n) | O(n)",
    "frequency": 144
  },
  {
    "problem": "Edit Distance",
    "link": "[https://leetcode.com/problems/edit-distance](https://leetcode.com/problems/edit-distance)",
    "pattern": "DP",
    "subPattern": "2D Grid DP",
    "difficulty": "Hard",
    "coreIdea": "Compute min operations to transform one string into another",
    "complexity": "O(m*n) | O(m*n)",
    "frequency": 140
  },
  {
    "problem": "Longest Valid Parentheses",
    "link": "[https://leetcode.com/problems/longest-valid-parentheses](https://leetcode.com/problems/longest-valid-parentheses)",
    "pattern": "Stack",
    "subPattern": "Index tracking",
    "difficulty": "Hard",
    "coreIdea": "Use stack to store indices and calculate gap between invalid points",
    "complexity": "O(n) | O(n)",
    "frequency": 140
  },
  {
    "problem": "LFU Cache",
    "link": "[https://leetcode.com/problems/lfu-cache](https://leetcode.com/problems/lfu-cache)",
    "pattern": "Design",
    "subPattern": "Frequency Doubly Linked List",
    "difficulty": "Hard",
    "coreIdea": "Use map for nodes and frequency lists to maintain access order",
    "complexity": "O(1) | O(capacity)",
    "frequency": 138
  },
  {
    "problem": "Reverse Integer",
    "link": "[https://leetcode.com/problems/reverse-integer](https://leetcode.com/problems/reverse-integer)",
    "pattern": "Math",
    "subPattern": "Digit manipulation",
    "difficulty": "Medium",
    "coreIdea": "Pop digits and push them back while checking for 32-bit overflow",
    "complexity": "O(log n) | O(1)",
    "frequency": 138
  },
  {
    "problem": "Remove Duplicates from Sorted Array",
    "link": "[https://leetcode.com/problems/remove-duplicates-from-sorted-array](https://leetcode.com/problems/remove-duplicates-from-sorted-array)",
    "pattern": "Two Pointers",
    "subPattern": "In-place modification",
    "difficulty": "Easy",
    "coreIdea": "Overwrite duplicate indices using a slow/fast pointer approach",
    "complexity": "O(n) | O(1)",
    "frequency": 138
  },
  {
    "problem": "Gas Station",
    "link": "[https://leetcode.com/problems/gas-station](https://leetcode.com/problems/gas-station)",
    "pattern": "Greedy",
    "subPattern": "Running Sum",
    "difficulty": "Medium",
    "coreIdea": "Start from the point where the running gas total never drops below zero",
    "complexity": "O(n) | O(1)",
    "frequency": 136
  },
  {
    "problem": "Task Scheduler",
    "link": "[https://leetcode.com/problems/task-scheduler](https://leetcode.com/problems/task-scheduler)",
    "pattern": "Greedy",
    "subPattern": "Frequency Filling",
    "difficulty": "Medium",
    "coreIdea": "Arrange tasks with cooling time based on the most frequent task",
    "complexity": "O(n) | O(1)",
    "frequency": 134
  },
  {
    "problem": "Combination Sum",
    "link": "[https://leetcode.com/problems/combination-sum](https://leetcode.com/problems/combination-sum)",
    "pattern": "Backtracking",
    "subPattern": "DFS recursion",
    "difficulty": "Medium",
    "coreIdea": "Explore all inclusion/exclusion paths to reach target sum",
    "complexity": "O(2^n) | O(target)",
    "frequency": 134
  },
  {
    "problem": "Random Pick with Weight",
    "link": "[https://leetcode.com/problems/random-pick-with-weight](https://leetcode.com/problems/random-pick-with-weight)",
    "pattern": "Binary Search",
    "subPattern": "Prefix Sums",
    "difficulty": "Medium",
    "coreIdea": "Map weights to ranges using prefix sums and pick via binary search",
    "complexity": "O(log n) | O(n)",
    "frequency": 130
  },
  {
    "problem": "Maximal Square",
    "link": "[https://leetcode.com/problems/maximal-square](https://leetcode.com/problems/maximal-square)",
    "pattern": "DP",
    "subPattern": "2D Grid DP",
    "difficulty": "Medium",
    "coreIdea": "Size of square at (i,j) depends on min of neighbors + 1",
    "complexity": "O(m*n) | O(m*n)",
    "frequency": 130
  },
  {
    "problem": "Regular Expression Matching",
    "link": "[https://leetcode.com/problems/regular-expression-matching](https://leetcode.com/problems/regular-expression-matching)",
    "pattern": "DP",
    "subPattern": "String matching",
    "difficulty": "Hard",
    "coreIdea": "Handle '.' and '*' wildcards using recursion with memoization",
    "complexity": "O(m*n) | O(m*n)",
    "frequency": 126
  },
  {
    "problem": "Permutations",
    "link": "[https://leetcode.com/problems/permutations](https://leetcode.com/problems/permutations)",
    "pattern": "Backtracking",
    "subPattern": "Swap-based search",
    "difficulty": "Medium",
    "coreIdea": "Recursively swap elements to build all ordered arrangements",
    "complexity": "O(n*n!) | O(n!)",
    "frequency": 126
  },
  {
    "problem": "Simplify Path",
    "link": "[https://leetcode.com/problems/simplify-path](https://leetcode.com/problems/simplify-path)",
    "pattern": "Stack",
    "subPattern": "Directory Simulation",
    "difficulty": "Medium",
    "coreIdea": "Use a stack to process file parts and handle '..' and '.'",
    "complexity": "O(n) | O(n)",
    "frequency": 126
  },
  {
    "problem": "Binary Tree Maximum Path Sum",
    "link": "[https://leetcode.com/problems/binary-tree-maximum-path-sum](https://leetcode.com/problems/binary-tree-maximum-path-sum)",
    "pattern": "Tree",
    "subPattern": "Post-order DFS",
    "difficulty": "Hard",
    "coreIdea": "Compute max path through each node while tracking global max",
    "complexity": "O(n) | O(h)",
    "frequency": 124
  },
  {
    "problem": "Reverse Nodes in k-Group",
    "link": "[https://leetcode.com/problems/reverse-nodes-in-k-group](https://leetcode.com/problems/reverse-nodes-in-k-group)",
    "pattern": "Linked List",
    "subPattern": "Recursive Reversal",
    "difficulty": "Hard",
    "coreIdea": "Reverse k nodes and link with the result of recursive call on rest",
    "complexity": "O(n) | O(1)",
    "frequency": 124
  },
  {
    "problem": "Design Hit Counter",
    "link": "[https://leetcode.com/problems/design-hit-counter](https://leetcode.com/problems/design-hit-counter)",
    "pattern": "Design",
    "subPattern": "Circular Buffer",
    "difficulty": "Medium",
    "coreIdea": "Use a queue or bucket system to store hits in the last 300 seconds",
    "complexity": "O(1) | O(300)",
    "frequency": 124
  },
  {
    "problem": "Jump Game II",
    "link": "[https://leetcode.com/problems/jump-game-ii](https://leetcode.com/problems/jump-game-ii)",
    "pattern": "Greedy",
    "subPattern": "Range Expansion",
    "difficulty": "Medium",
    "coreIdea": "Count jumps needed to reach the end of the current furthest range",
    "complexity": "O(n) | O(1)",
    "frequency": 124
  },
  {
    "problem": "Basic Calculator",
    "link": "[https://leetcode.com/problems/basic-calculator](https://leetcode.com/problems/basic-calculator)",
    "pattern": "Stack",
    "subPattern": "Expression Parsing",
    "difficulty": "Hard",
    "coreIdea": "Use a stack to manage sign context and nested parentheses",
    "complexity": "O(n) | O(n)",
    "frequency": 122
  },
  {
    "problem": "Lowest Common Ancestor of a Binary Tree",
    "link": "[https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree)",
    "pattern": "Tree",
    "subPattern": "DFS Search",
    "difficulty": "Medium",
    "coreIdea": "Return current node if targets are found in both left and right subtrees",
    "complexity": "O(n) | O(h)",
    "frequency": 122
  },
  {
    "problem": "Serialize and Deserialize Binary Tree",
    "link": "[https://leetcode.com/problems/serialize-and-deserialize-binary-tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree)",
    "pattern": "Tree",
    "subPattern": "Level-order BFS",
    "difficulty": "Hard",
    "coreIdea": "Encode tree to string with BFS and reconstruct using a queue",
    "complexity": "O(n) | O(n)",
    "frequency": 122
  },
  {
    "problem": "First Unique Character in a String",
    "link": "[https://leetcode.com/problems/first-unique-character-in-a-string](https://leetcode.com/problems/first-unique-character-in-a-string)",
    "pattern": "Hashing",
    "subPattern": "Character frequency",
    "difficulty": "Easy",
    "coreIdea": "Find the first character with a count of 1 in the frequency map",
    "complexity": "O(n) | O(1)",
    "frequency": 122
  },
  {
    "problem": "Majority Element",
    "link": "[https://leetcode.com/problems/majority-element](https://leetcode.com/problems/majority-element)",
    "pattern": "Greedy",
    "subPattern": "Boyer-Moore Voting",
    "difficulty": "Easy",
    "coreIdea": "Maintain a candidate and increment/decrement count based on matches",
    "complexity": "O(n) | O(1)",
    "frequency": 120
  },
  {
    "problem": "Contains Duplicate",
    "link": "[https://leetcode.com/problems/contains-duplicate](https://leetcode.com/problems/contains-duplicate)",
    "pattern": "Hashing",
    "subPattern": "Set Membership",
    "difficulty": "Easy",
    "coreIdea": "Check if an element already exists in a hash set",
    "complexity": "O(n) | O(n)",
    "frequency": 120
  },
  {
    "problem": "Maximum Profit in Job Scheduling",
    "link": "[https://leetcode.com/problems/maximum-profit-in-job-scheduling](https://leetcode.com/problems/maximum-profit-in-job-scheduling)",
    "pattern": "DP",
    "subPattern": "Binary Search + Sorting",
    "difficulty": "Hard",
    "coreIdea": "Sort by end time and use binary search to find previous non-overlapping job",
    "complexity": "O(n log n) | O(n)",
    "frequency": 120
  },
  {
    "problem": "Integer to English Words",
    "link": "[https://leetcode.com/problems/integer-to-english-words](https://leetcode.com/problems/integer-to-english-words)",
    "pattern": "Math",
    "subPattern": "Chunk processing",
    "difficulty": "Hard",
    "coreIdea": "Process digits in thousands-based groups and recursively build string",
    "complexity": "O(1) | O(1)",
    "frequency": 118
  },
  {
    "problem": "Linked List Cycle",
    "link": "[https://leetcode.com/problems/linked-list-cycle](https://leetcode.com/problems/linked-list-cycle)",
    "pattern": "Two Pointers",
    "subPattern": "Floyd's Cycle",
    "difficulty": "Easy",
    "coreIdea": "Fast and slow pointers will eventually meet if a cycle exists",
    "complexity": "O(n) | O(1)",
    "frequency": 118
  },
  {
    "problem": "Copy List with Random Pointer",
    "link": "[https://leetcode.com/problems/copy-list-with-random-pointer](https://leetcode.com/problems/copy-list-with-random-pointer)",
    "pattern": "Hashing",
    "subPattern": "Node Map",
    "difficulty": "Medium",
    "coreIdea": "Map original nodes to new nodes to replicate pointers",
    "complexity": "O(n) | O(n)",
    "frequency": 116
  },
  {
    "problem": "Largest Number",
    "link": "[https://leetcode.com/problems/largest-number](https://leetcode.com/problems/largest-number)",
    "pattern": "Greedy",
    "subPattern": "Custom Sort",
    "difficulty": "Medium",
    "coreIdea": "Sort based on string concatenation result (a+b vs b+a)",
    "complexity": "O(n log n) | O(n)",
    "frequency": 116
  },
  {
    "problem": "Candy",
    "link": "[https://leetcode.com/problems/candy](https://leetcode.com/problems/candy)",
    "pattern": "Greedy",
    "subPattern": "Two-pass constraints",
    "difficulty": "Hard",
    "coreIdea": "Satisfy constraints via left-to-right and right-to-left passes",
    "complexity": "O(n) | O(n)",
    "frequency": 114
  },
  {
    "problem": "Reorganize String",
    "link": "[https://leetcode.com/problems/reorganize-string](https://leetcode.com/problems/reorganize-string)",
    "pattern": "Greedy",
    "subPattern": "Heap + Frequency",
    "difficulty": "Medium",
    "coreIdea": "Place most frequent characters first at non-adjacent indices",
    "complexity": "O(n log A) | O(A)",
    "frequency": 114
  },
  {
    "problem": "Palindromic Substrings",
    "link": "[https://leetcode.com/problems/palindromic-substrings](https://leetcode.com/problems/palindromic-substrings)",
    "pattern": "Two Pointers",
    "subPattern": "Expand center",
    "difficulty": "Medium",
    "coreIdea": "Count palindromes by expanding outward from each character/pair",
    "complexity": "O(n^2) | O(1)",
    "frequency": 114
  },
  {
    "problem": "Max Consecutive Ones III",
    "link": "[https://leetcode.com/problems/max-consecutive-ones-iii](https://leetcode.com/problems/max-consecutive-ones-iii)",
    "pattern": "Sliding Window",
    "subPattern": "Two Pointers",
    "difficulty": "Medium",
    "coreIdea": "Expand window until k zeros are used, then shrink",
    "complexity": "O(n) | O(1)",
    "frequency": 114
  },
  {
    "problem": "Set Matrix Zeroes",
    "link": "[https://leetcode.com/problems/set-matrix-zeroes](https://leetcode.com/problems/set-matrix-zeroes)",
    "pattern": "Matrix",
    "subPattern": "In-place markers",
    "difficulty": "Medium",
    "coreIdea": "Use first row and column as markers for zeroing remainder",
    "complexity": "O(m*n) | O(1)",
    "frequency": 114
  },
  {
    "problem": "Implement Trie (Prefix Tree)",
    "link": "[https://leetcode.com/problems/implement-trie-prefix-tree](https://leetcode.com/problems/implement-trie-prefix-tree)",
    "pattern": "Design",
    "subPattern": "Prefix Tree",
    "difficulty": "Medium",
    "coreIdea": "Store string paths in a tree structure for efficient lookup",
    "complexity": "O(L) | O(N*L)",
    "frequency": 112
  },
  {
    "problem": "Evaluate Division",
    "link": "[https://leetcode.com/problems/evaluate-division](https://leetcode.com/problems/evaluate-division)",
    "pattern": "Graph",
    "subPattern": "DFS / Union-Find",
    "difficulty": "Medium",
    "coreIdea": "Build a weighted directed graph and perform path finding",
    "complexity": "O(Q * (V+E)) | O(V+E)",
    "frequency": 112
  },
  {
    "problem": "Isomorphic Strings",
    "link": "[https://leetcode.com/problems/isomorphic-strings](https://leetcode.com/problems/isomorphic-strings)",
    "pattern": "Hashing",
    "subPattern": "Bijective Mapping",
    "difficulty": "Easy",
    "coreIdea": "Verify character mappings between strings are unique and consistent",
    "complexity": "O(n) | O(1)",
    "frequency": 110
  },
  {
    "problem": "Pow(x, n)",
    "link": "[https://leetcode.com/problems/powx-n](https://leetcode.com/problems/powx-n)",
    "pattern": "Math",
    "subPattern": "Binary Exponentiation",
    "difficulty": "Medium",
    "coreIdea": "Recursively square base to compute power in logarithmic steps",
    "complexity": "O(log n) | O(log n)",
    "frequency": 110
  },
  {
    "problem": "Count Binary Substrings",
    "link": "[https://leetcode.com/problems/count-binary-substrings](https://leetcode.com/problems/count-binary-substrings)",
    "pattern": "String",
    "subPattern": "Group counting",
    "difficulty": "Easy",
    "coreIdea": "Sum minimum of counts of consecutive zeros and ones",
    "complexity": "O(n) | O(1)",
    "frequency": 108
  },
  {
    "problem": "Find the Duplicate Number",
    "link": "[https://leetcode.com/problems/find-the-duplicate-number](https://leetcode.com/problems/find-the-duplicate-number)",
    "pattern": "Two Pointers",
    "subPattern": "Floyd's Cycle",
    "difficulty": "Medium",
    "coreIdea": "Treat array indices as pointers to detect the entry point of cycle",
    "complexity": "O(n) | O(1)",
    "frequency": 108
  },
  {
    "problem": "Longest Repeating Character Replacement",
    "link": "[https://leetcode.com/problems/longest-repeating-character-replacement](https://leetcode.com/problems/longest-repeating-character-replacement)",
    "pattern": "Sliding Window",
    "subPattern": "Two Pointers",
    "difficulty": "Medium",
    "coreIdea": "Expand window while character swaps needed is within k",
    "complexity": "O(n) | O(1)",
    "frequency": 106
  },
  {
    "problem": "Top K Frequent Words",
    "link": "[https://leetcode.com/problems/top-k-frequent-words](https://leetcode.com/problems/top-k-frequent-words)",
    "pattern": "Heap",
    "subPattern": "Priority Queue",
    "difficulty": "Medium",
    "coreIdea": "Count frequencies and use a heap to extract top k words",
    "complexity": "O(n log k) | O(n)",
    "frequency": 106
  },
  {
    "problem": "Subsets",
    "link": "[https://leetcode.com/problems/subsets](https://leetcode.com/problems/subsets)",
    "pattern": "Backtracking",
    "subPattern": "Power Set",
    "difficulty": "Medium",
    "coreIdea": "Include or exclude each element to build all combinations",
    "complexity": "O(n * 2^n) | O(n * 2^n)",
    "frequency": 106
  },
  {
    "problem": "Zigzag Conversion",
    "link": "[https://leetcode.com/problems/zigzag-conversion](https://leetcode.com/problems/zigzag-conversion)",
    "pattern": "String",
    "subPattern": "Simulation",
    "difficulty": "Medium",
    "coreIdea": "Append characters to rows using a direction-reversing pointer",
    "complexity": "O(n) | O(n)",
    "frequency": 106
  },
  {
    "problem": "Decode Ways",
    "link": "[https://leetcode.com/problems/decode-ways](https://leetcode.com/problems/decode-ways)",
    "pattern": "DP",
    "subPattern": "1D Linear DP",
    "difficulty": "Medium",
    "coreIdea": "Ways depend on validity of previous 1 and 2 character groups",
    "complexity": "O(n) | O(n)",
    "frequency": 106
  },
  {
    "problem": "Capacity To Ship Packages Within D Days",
    "link": "[https://leetcode.com/problems/capacity-to-ship-packages-within-d-days](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days)",
    "pattern": "Binary Search",
    "subPattern": "Range Search",
    "difficulty": "Medium",
    "coreIdea": "Binary search on possible capacities and validate via greedy",
    "complexity": "O(n log S) | O(1)",
    "frequency": 104
  },
  {
    "problem": "Design Circular Queue",
    "link": "[https://leetcode.com/problems/design-circular-queue](https://leetcode.com/problems/design-circular-queue)",
    "pattern": "Design",
    "subPattern": "Array Implementation",
    "difficulty": "Medium",
    "coreIdea": "Use a fixed array with head and tail pointers",
    "complexity": "O(1) | O(k)",
    "frequency": 104
  },
  {
    "problem": "Fizz Buzz",
    "link": "[https://leetcode.com/problems/fizz-buzz](https://leetcode.com/problems/fizz-buzz)",
    "pattern": "Math",
    "subPattern": "Simulation",
    "difficulty": "Easy",
    "coreIdea": "Map numbers to strings based on divisibility by 3 and 5",
    "complexity": "O(n) | O(1)",
    "frequency": 104
  },
  {
    "problem": "Word Search II",
    "link": "[https://leetcode.com/problems/word-search-ii](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/word-search-ii)",
    "pattern": "Backtracking",
    "subPattern": "Trie-optimized search",
    "difficulty": "Hard",
    "coreIdea": "Use a Trie to prune DFS paths that cannot form valid words",
    "complexity": "O(M * 4^L) | O(N * L)",
    "frequency": 104
  },
  {
    "problem": "Maximum Product Subarray",
    "link": "[https://leetcode.com/problems/maximum-product-subarray](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/maximum-product-subarray)",
    "pattern": "DP",
    "subPattern": "Min-Max Tracking",
    "difficulty": "Medium",
    "coreIdea": "Maintain both max and min products to handle negative number flips",
    "complexity": "O(n) | O(1)",
    "frequency": 104
  },
  {
    "problem": "Maximal Rectangle",
    "link": "[https://leetcode.com/problems/maximal-rectangle](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/maximal-rectangle)",
    "pattern": "Stack",
    "subPattern": "Histogram Transformation",
    "difficulty": "Hard",
    "coreIdea": "Convert grid into 1D histograms and find largest rectangle for each row",
    "complexity": "O(R*C) | O(C)",
    "frequency": 104
  },
  {
    "problem": "Missing Number",
    "link": "[https://leetcode.com/problems/missing-number](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/missing-number)",
    "pattern": "Math",
    "subPattern": "Gauss Summation",
    "difficulty": "Easy",
    "coreIdea": "Compare expected sum of 0 to n with the actual sum of array elements",
    "complexity": "O(n) | O(1)",
    "frequency": 102
  },
  {
    "problem": "4Sum",
    "link": "[https://leetcode.com/problems/4sum](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/4sum)",
    "pattern": "Two Pointers",
    "subPattern": "N-sum reduction",
    "difficulty": "Medium",
    "coreIdea": "Sort array and use nested loops to reduce problem to 2Sum",
    "complexity": "O(n^3) | O(n)",
    "frequency": 102
  },
  {
    "problem": "Max Area of Island",
    "link": "[https://leetcode.com/problems/max-area-of-island](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/max-area-of-island)",
    "pattern": "Graph",
    "subPattern": "DFS recursion",
    "difficulty": "Medium",
    "coreIdea": "Traverse each land cell and recursively count size of connected components",
    "complexity": "O(M*N) | O(M*N)",
    "frequency": 102
  },
  {
    "problem": "Pascal's Triangle",
    "link": "[https://leetcode.com/problems/pascals-triangle](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/pascals-triangle)",
    "pattern": "Array",
    "subPattern": "Row Simulation",
    "difficulty": "Easy",
    "coreIdea": "Generate current row by summing adjacent elements from the previous row",
    "complexity": "O(n^2) | O(n^2)",
    "frequency": 100
  },
  {
    "problem": "Split Array Largest Sum",
    "link": "[https://leetcode.com/problems/split-array-largest-sum](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/split-array-largest-sum)",
    "pattern": "Binary Search",
    "subPattern": "Binary Search on Answer",
    "difficulty": "Hard",
    "coreIdea": "Search range of possible sums and greedily check if k splits are possible",
    "complexity": "O(n log(Sum)) | O(1)",
    "frequency": 100
  },
  {
    "problem": "Fibonacci Number",
    "link": "[https://leetcode.com/problems/fibonacci-number](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/fibonacci-number)",
    "pattern": "DP",
    "subPattern": "State variables",
    "difficulty": "Easy",
    "coreIdea": "Sum previous two numbers while tracking states to save space",
    "complexity": "O(n) | O(1)",
    "frequency": 100
  },
  {
    "problem": "Diameter of Binary Tree",
    "link": "[https://leetcode.com/problems/diameter-of-binary-tree](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/diameter-of-binary-tree)",
    "pattern": "Tree",
    "subPattern": "Post-order DFS",
    "difficulty": "Easy",
    "coreIdea": "Track max value of (left height + right height) across all nodes",
    "complexity": "O(n) | O(h)",
    "frequency": 100
  },
  {
    "problem": "Single Element in a Sorted Array",
    "link": "[https://leetcode.com/problems/single-element-in-a-sorted-array](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/single-element-in-a-sorted-array)",
    "pattern": "Binary Search",
    "subPattern": "Index parity",
    "difficulty": "Medium",
    "coreIdea": "Check pair symmetry to decide whether to search left or right half",
    "complexity": "O(log n) | O(1)",
    "frequency": 100
  },
  {
    "problem": "String to Integer (atoi)",
    "link": "[https://leetcode.com/problems/string-to-integer-atoi](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/string-to-integer-atoi)",
    "pattern": "String",
    "subPattern": "Edge-case Handling",
    "difficulty": "Medium",
    "coreIdea": "Iteratively process digits while managing signs and integer overflows",
    "complexity": "O(n) | O(1)",
    "frequency": 100
  },
  {
    "problem": "Remove All Adjacent Duplicates in String II",
    "link": "[https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii)",
    "pattern": "Stack",
    "subPattern": "Character Frequency Stack",
    "difficulty": "Medium",
    "coreIdea": "Use a stack to track character counts and pop when count hits k",
    "complexity": "O(n) | O(n)",
    "frequency": 100
  },
  {
    "problem": "Accounts Merge",
    "link": "[https://leetcode.com/problems/accounts-merge](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/accounts-merge)",
    "pattern": "Graph",
    "subPattern": "Union-Find",
    "difficulty": "Medium",
    "coreIdea": "Group emails as graph nodes and find connected components",
    "complexity": "O(NK log NK) | O(NK)",
    "frequency": 98
  },
  {
    "problem": "House Robber II",
    "link": "[https://leetcode.com/problems/house-robber-ii](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/house-robber-ii)",
    "pattern": "DP",
    "subPattern": "Circular array reduction",
    "difficulty": "Medium",
    "coreIdea": "Solve linear version twice: once without first and once without last",
    "complexity": "O(n) | O(1)",
    "frequency": 98
  },
  {
    "problem": "Unique Paths",
    "link": "[https://leetcode.com/problems/unique-paths](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/unique-paths)",
    "pattern": "DP",
    "subPattern": "Grid Combinatorics",
    "difficulty": "Medium",
    "coreIdea": "Ways to reach (i,j) is sum of ways to reach top and left neighbors",
    "complexity": "O(M*N) | O(M*N)",
    "frequency": 98
  },
  {
    "problem": "Intersection of Two Arrays",
    "link": "[https://leetcode.com/problems/intersection-of-two-arrays](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/intersection-of-two-arrays)",
    "pattern": "Hashing",
    "subPattern": "Set Intersection",
    "difficulty": "Easy",
    "coreIdea": "Store one array in set and iterate through other to find matches",
    "complexity": "O(n+m) | O(n)",
    "frequency": 98
  },
  {
    "problem": "Search Suggestions System",
    "link": "[https://leetcode.com/problems/search-suggestions-system](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/search-suggestions-system)",
    "pattern": "Trie",
    "subPattern": "Prefix Search + Sorting",
    "difficulty": "Medium",
    "coreIdea": "Sort products and use binary search or Trie to find common prefixes",
    "complexity": "O(N log N + L) | O(N)",
    "frequency": 98
  },
  {
    "problem": "Subarray Product Less Than K",
    "link": "[https://leetcode.com/problems/subarray-product-less-than-k](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/subarray-product-less-than-k)",
    "pattern": "Sliding Window",
    "subPattern": "Two Pointers",
    "difficulty": "Medium",
    "coreIdea": "Maintain window product < k and count window size at each expansion",
    "complexity": "O(n) | O(1)",
    "frequency": 98
  },
  {
    "problem": "Sqrt(x)",
    "link": "[https://leetcode.com/problems/sqrtx](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/sqrtx)",
    "pattern": "Binary Search",
    "subPattern": "Range Search",
    "difficulty": "Easy",
    "coreIdea": "Binary search between 0 and x to find highest square <= x",
    "complexity": "O(log n) | O(1)",
    "frequency": 98
  },
  {
    "problem": "Longest Common Subsequence",
    "link": "[https://leetcode.com/problems/longest-common-subsequence](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/longest-common-subsequence)",
    "pattern": "DP",
    "subPattern": "2D String DP",
    "difficulty": "Medium",
    "coreIdea": "Match characters at current indices and carry forward max score",
    "complexity": "O(M*N) | O(M*N)",
    "frequency": 98
  },
  {
    "problem": "Remove Nth Node From End of List",
    "link": "[https://leetcode.com/problems/remove-nth-node-from-end-of-list](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/remove-nth-node-from-end-of-list)",
    "pattern": "Linked List",
    "subPattern": "Fast & Slow Pointers",
    "difficulty": "Medium",
    "coreIdea": "Advance fast pointer n steps, then move both to find gap",
    "complexity": "O(n) | O(1)",
    "frequency": 96
  },
  {
    "problem": "Second Highest Salary",
    "link": "[https://leetcode.com/problems/second-highest-salary](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/second-highest-salary)",
    "pattern": "Math",
    "subPattern": "Sorting logic",
    "difficulty": "Medium",
    "coreIdea": "Identify max element and find the largest element strictly less than it",
    "complexity": "O(n) | O(1)",
    "frequency": 96
  },
  {
    "problem": "Simple Bank System",
    "link": "[https://leetcode.com/problems/simple-bank-system](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/simple-bank-system)",
    "pattern": "Design",
    "subPattern": "Array Simulation",
    "difficulty": "Medium",
    "coreIdea": "Implement bank operations with index and balance validation",
    "complexity": "O(1) | O(n)",
    "frequency": 96
  },
  {
    "problem": "Validate Binary Search Tree",
    "link": "[https://leetcode.com/problems/validate-binary-search-tree](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/validate-binary-search-tree)",
    "pattern": "Tree",
    "subPattern": "Recursive Bounds",
    "difficulty": "Medium",
    "coreIdea": "Validate each node against min and max bounds inherited from parents",
    "complexity": "O(n) | O(h)",
    "frequency": 96
  },
  {
    "problem": "Evaluate Reverse Polish Notation",
    "link": "[https://leetcode.com/problems/evaluate-reverse-polish-notation](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/evaluate-reverse-polish-notation)",
    "pattern": "Stack",
    "subPattern": "Arithmetic simulation",
    "difficulty": "Medium",
    "coreIdea": "Push operands to stack and pop top two when operator is found",
    "complexity": "O(n) | O(n)",
    "frequency": 96
  },
  {
    "problem": "Squares of a Sorted Array",
    "link": "[https://leetcode.com/problems/squares-of-a-sorted-array](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/squares-of-a-sorted-array)",
    "pattern": "Two Pointers",
    "subPattern": "Two-end merge",
    "difficulty": "Easy",
    "coreIdea": "Compare squares at both ends and fill result array from back to front",
    "complexity": "O(n) | O(n)",
    "frequency": 96
  },
  {
    "problem": "Remove K Digits",
    "link": "[https://leetcode.com/problems/remove-k-digits](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/remove-k-digits)",
    "pattern": "Stack",
    "subPattern": "Monotonic Stack",
    "difficulty": "Medium",
    "coreIdea": "Maintain non-decreasing sequence in stack to minimize result",
    "complexity": "O(n) | O(n)",
    "frequency": 96
  },
  {
    "problem": "Palindrome Linked List",
    "link": "[https://leetcode.com/problems/palindrome-linked-list](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/palindrome-linked-list)",
    "pattern": "Linked List",
    "subPattern": "Reversal strategy",
    "difficulty": "Easy",
    "coreIdea": "Reverse second half of list and compare with first half",
    "complexity": "O(n) | O(1)",
    "frequency": 96
  },
  {
    "problem": "Logger Rate Limiter",
    "link": "[https://leetcode.com/problems/logger-rate-limiter](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/logger-rate-limiter)",
    "pattern": "Hashing",
    "subPattern": "Message timestamp map",
    "difficulty": "Easy",
    "coreIdea": "Store timestamps for each message and check 10-second gap",
    "complexity": "O(1) | O(n)",
    "frequency": 96
  },
  {
    "problem": "Making A Large Island",
    "link": "[https://leetcode.com/problems/making-a-large-island](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/making-a-large-island)",
    "pattern": "Graph",
    "subPattern": "Connected Components",
    "difficulty": "Hard",
    "coreIdea": "Label islands and sum sizes of unique neighbors for each water cell",
    "complexity": "O(M*N) | O(M*N)",
    "frequency": 94
  },
  {
    "problem": "Valid Palindrome II",
    "link": "[https://leetcode.com/problems/valid-palindrome-ii](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/valid-palindrome-ii)",
    "pattern": "Two Pointers",
    "subPattern": "One-skip check",
    "difficulty": "Easy",
    "coreIdea": "Try skipping one character when a mismatch occurs in palindrome check",
    "complexity": "O(n) | O(1)",
    "frequency": 94
  },
  {
    "problem": "Search a 2D Matrix",
    "link": "[https://leetcode.com/problems/search-a-2d-matrix](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/search-a-2d-matrix)",
    "pattern": "Binary Search",
    "subPattern": "Grid Unrolling",
    "difficulty": "Medium",
    "coreIdea": "Treat 2D grid as a flattened sorted array for binary search",
    "complexity": "O(log(M*N)) | O(1)",
    "frequency": 94
  },
  {
    "problem": "Snapshot Array",
    "link": "[https://leetcode.com/problems/snapshot-array](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/snapshot-array)",
    "pattern": "Design",
    "subPattern": "Binary Search on Snapshots",
    "difficulty": "Medium",
    "coreIdea": "Store value history for each index and pick via binary search",
    "complexity": "O(log S) | O(N*S)",
    "frequency": 92
  },
  {
    "problem": "Reverse Linked List II",
    "link": "[https://leetcode.com/problems/reverse-linked-list-ii](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/reverse-linked-list-ii)",
    "pattern": "Linked List",
    "subPattern": "In-place reversal",
    "difficulty": "Medium",
    "coreIdea": "Identify segment range and reverse pointers within that segment",
    "complexity": "O(n) | O(1)",
    "frequency": 92
  },
  {
    "problem": "Is Subsequence",
    "link": "[https://leetcode.com/problems/is-subsequence](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/is-subsequence)",
    "pattern": "Two Pointers",
    "subPattern": "Iterative matching",
    "difficulty": "Easy",
    "coreIdea": "Scan both strings and advance target pointer on every match",
    "complexity": "O(n) | O(1)",
    "frequency": 92
  },
  {
    "problem": "Minimum Absolute Difference",
    "link": "[https://leetcode.com/problems/minimum-absolute-difference](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/minimum-absolute-difference)",
    "pattern": "Sorting",
    "subPattern": "Adjacent comparison",
    "difficulty": "Easy",
    "coreIdea": "Sort array and find pairs with minimum gap in one pass",
    "complexity": "O(n log n) | O(1)",
    "frequency": 92
  },
  {
    "problem": "Next Greater Element I",
    "link": "[https://leetcode.com/problems/next-greater-element-i](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/next-greater-element-i)",
    "pattern": "Stack",
    "subPattern": "Monotonic Stack",
    "difficulty": "Easy",
    "coreIdea": "Pre-calculate all next greater values using a stack and map",
    "complexity": "O(n) | O(n)",
    "frequency": 90
  },
  {
    "problem": "Find Minimum in Rotated Sorted Array",
    "link": "[https://leetcode.com/problems/find-minimum-in-rotated-sorted-array](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/find-minimum-in-rotated-sorted-array)",
    "pattern": "Binary Search",
    "subPattern": "Inflection point",
    "difficulty": "Medium",
    "coreIdea": "Identify the unsorted half to find the pivot point of rotation",
    "complexity": "O(log n) | O(1)",
    "frequency": 90
  },
  {
    "problem": "Sudoku Solver",
    "link": "[https://leetcode.com/problems/sudoku-solver](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/sudoku-solver)",
    "pattern": "Backtracking",
    "subPattern": "Constraint Satisfaction",
    "difficulty": "Hard",
    "coreIdea": "Exhaustively try numbers 1-9 for every empty cell",
    "complexity": "O(9^81) | O(1)",
    "frequency": 90
  },
  {
    "problem": "Find the Index of the First Occurrence in a String",
    "link": "[https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string)",
    "pattern": "String",
    "subPattern": "KMP / Sliding Window",
    "difficulty": "Easy",
    "coreIdea": "Check all window substrings or use KMP preprocessing for speed",
    "complexity": "O(n) | O(1)",
    "frequency": 90
  },
  {
    "problem": "Find All Anagrams in a String",
    "link": "[https://leetcode.com/problems/find-all-anagrams-in-a-string](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/find-all-anagrams-in-a-string)",
    "pattern": "Sliding Window",
    "subPattern": "Frequency Hashing",
    "difficulty": "Medium",
    "coreIdea": "Maintain character count window and compare with target frequency",
    "complexity": "O(n) | O(1)",
    "frequency": 90
  },
  {
    "problem": "Insert Interval",
    "link": "[https://leetcode.com/problems/insert-interval](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/insert-interval)",
    "pattern": "Intervals",
    "subPattern": "Merge Strategy",
    "difficulty": "Medium",
    "coreIdea": "Merge overlapping parts while adding non-overlapping ones sequentially",
    "complexity": "O(n) | O(n)",
    "frequency": 90
  },
  {
    "problem": "Remove All Adjacent Duplicates In String",
    "link": "[https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string)",
    "pattern": "Stack",
    "subPattern": "Recursive simplification",
    "difficulty": "Easy",
    "coreIdea": "Use a stack to cancel out adjacent identical characters",
    "complexity": "O(n) | O(n)",
    "frequency": 88
  },
  {
    "problem": "Combination Sum II",
    "link": "[https://leetcode.com/problems/combination-sum-ii](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/combination-sum-ii)",
    "pattern": "Backtracking",
    "subPattern": "Skip Duplicates",
    "difficulty": "Medium",
    "coreIdea": "Sort elements and skip consecutive identical numbers in recursion",
    "complexity": "O(2^n) | O(n)",
    "frequency": 88
  },
  {
    "problem": "N-Queens",
    "link": "[https://leetcode.com/problems/n-queens](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/n-queens)",
    "pattern": "Backtracking",
    "subPattern": "Matrix Pruning",
    "difficulty": "Hard",
    "coreIdea": "Place queens row by row while checking row, col, and diagonal constraints",
    "complexity": "O(n!) | O(n^2)",
    "frequency": 88
  },
  {
    "problem": "Subarrays with K Different Integers",
    "link": "[https://leetcode.com/problems/subarrays-with-k-different-integers](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/subarrays-with-k-different-integers)",
    "pattern": "Sliding Window",
    "subPattern": "Difference calculation",
    "difficulty": "Hard",
    "coreIdea": "Solve for 'at most K' minus 'at most K-1' unique integers",
    "complexity": "O(n) | O(k)",
    "frequency": 88
  },
  {
    "problem": "Find K Closest Elements",
    "link": "[https://leetcode.com/problems/find-k-closest-elements](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/find-k-closest-elements)",
    "pattern": "Binary Search",
    "subPattern": "Window Search",
    "difficulty": "Medium",
    "coreIdea": "Find the left bound of the k-length window using binary search",
    "complexity": "O(log(N-K) + K) | O(1)",
    "frequency": 86
  },
  {
    "problem": "Reconstruct Itinerary",
    "link": "[https://leetcode.com/problems/reconstruct-itinerary](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/reconstruct-itinerary)",
    "pattern": "Graph",
    "subPattern": "Eulerian Path",
    "difficulty": "Hard",
    "coreIdea": "Use Hierholzer's algorithm via DFS to visit all edges lexicographically",
    "complexity": "O(E log E) | O(V+E)",
    "frequency": 86
  },
  {
    "problem": "Reorder List",
    "link": "[https://leetcode.com/problems/reorder-list](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/reorder-list)",
    "pattern": "Linked List",
    "subPattern": "Reverse and Merge",
    "difficulty": "Medium",
    "coreIdea": "Find middle, reverse second half, and interleave nodes",
    "complexity": "O(n) | O(1)",
    "frequency": 86
  },
  {
    "problem": "Open the Lock",
    "link": "[https://leetcode.com/problems/open-the-lock](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/open-the-lock)",
    "pattern": "Graph",
    "subPattern": "BFS Search",
    "difficulty": "Medium",
    "coreIdea": "Level-order traversal of all possible wheel rotations while avoiding deadends",
    "complexity": "O(10^4) | O(10^4)",
    "frequency": 86
  },
  {
    "problem": "Permutation in String",
    "link": "[https://leetcode.com/problems/permutation-in-string](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/permutation-in-string)",
    "pattern": "Sliding Window",
    "subPattern": "Fixed frequency window",
    "difficulty": "Medium",
    "coreIdea": "Compare character frequency window in s2 with s1's frequency",
    "complexity": "O(n) | O(1)",
    "frequency": 86
  },
  {
    "problem": "Clone Graph",
    "link": "[https://leetcode.com/problems/clone-graph](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/clone-graph)",
    "pattern": "Graph",
    "subPattern": "Deep Copy / Hashing",
    "difficulty": "Medium",
    "coreIdea": "Use a hash map to map original nodes to their copies during DFS",
    "complexity": "O(V+E) | O(V)",
    "frequency": 86
  },
  {
    "problem": "Design HashMap",
    "link": "[https://leetcode.com/problems/design-hashmap](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/design-hashmap)",
    "pattern": "Design",
    "subPattern": "Chaining / Modulo",
    "difficulty": "Easy",
    "coreIdea": "Use a list of buckets with modulo indexing to handle collisions",
    "complexity": "O(1) avg | O(n)",
    "frequency": 86
  },
  {
    "problem": "Alien Dictionary",
    "link": "[https://leetcode.com/problems/alien-dictionary](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/alien-dictionary)",
    "pattern": "Graph",
    "subPattern": "Topological Sort",
    "difficulty": "Hard",
    "coreIdea": "Build dependency graph from word pairs and find valid ordering",
    "complexity": "O(V+E) | O(V+E)",
    "frequency": 86
  },
  {
    "problem": "Two Sum II - Input Array Is Sorted",
    "link": "[https://leetcode.com/problems/two-sum-ii-input-array-is-sorted](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/two-sum-ii-input-array-is-sorted)",
    "pattern": "Two Pointers",
    "subPattern": "Opposite ends",
    "difficulty": "Medium",
    "coreIdea": "Move pointers based on sum magnitude relative to target",
    "complexity": "O(n) | O(1)",
    "frequency": 86
  },
  {
    "problem": "Multiply Strings",
    "link": "[https://leetcode.com/problems/multiply-strings](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/multiply-strings)",
    "pattern": "Math",
    "subPattern": "Digit Simulation",
    "difficulty": "Medium",
    "coreIdea": "Manually compute products for each digit and handle carries",
    "complexity": "O(M*N) | O(M+N)",
    "frequency": 86
  },
  {
    "problem": "Wildcard Matching",
    "link": "[https://leetcode.com/problems/wildcard-matching](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/wildcard-matching)",
    "pattern": "DP",
    "subPattern": "String matching",
    "difficulty": "Hard",
    "coreIdea": "Handle '?' and '*' by comparing characters or skipping with '*' wildcard",
    "complexity": "O(M*N) | O(M*N)",
    "frequency": 86
  },
  {
    "problem": "Minimum Path Sum",
    "link": "[https://leetcode.com/problems/minimum-path-sum](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/minimum-path-sum)",
    "pattern": "DP",
    "subPattern": "2D Grid DP",
    "difficulty": "Medium",
    "coreIdea": "Accumulate min path value by checking top and left neighbors",
    "complexity": "O(M*N) | O(1)",
    "frequency": 84
  },
  {
    "problem": "Cheapest Flights Within K Stops",
    "link": "[https://leetcode.com/problems/cheapest-flights-within-k-stops](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/cheapest-flights-within-k-stops)",
    "pattern": "Graph",
    "subPattern": "Bellman-Ford / BFS",
    "difficulty": "Medium",
    "coreIdea": "Update min costs over k+1 iterations of edge relaxation",
    "complexity": "O(K*E) | O(V)",
    "frequency": 84
  },
  {
    "problem": "Bus Routes",
    "link": "[https://leetcode.com/problems/bus-routes](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/bus-routes)",
    "pattern": "Graph",
    "subPattern": "BFS BFS / Layered",
    "difficulty": "Hard",
    "coreIdea": "Treat buses as nodes and transfer stops as edges to find shortest path",
    "complexity": "O(N^2 + \\u03a3routes) | O(N^2)",
    "frequency": 84
  },
  {
    "problem": "Non-overlapping Intervals",
    "link": "[https://leetcode.com/problems/non-overlapping-intervals](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/non-overlapping-intervals)",
    "pattern": "Greedy",
    "subPattern": "Interval Sorting",
    "difficulty": "Medium",
    "coreIdea": "Sort by end times to fit the maximum number of non-overlapping intervals",
    "complexity": "O(n log n) | O(1)",
    "frequency": 82
  },
  {
    "problem": "Add Binary",
    "link": "[https://leetcode.com/problems/add-binary](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/add-binary)",
    "pattern": "Math",
    "subPattern": "Bitwise Simulation",
    "difficulty": "Easy",
    "coreIdea": "Iterate backwards from both strings while managing a carry bit",
    "complexity": "O(max(n, m)) | O(max(n, m))",
    "frequency": 82
  },
  {
    "problem": "Valid Parenthesis String",
    "link": "[https://leetcode.com/problems/valid-parenthesis-string](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/valid-parenthesis-string)",
    "pattern": "Greedy",
    "subPattern": "Balanced Count Range",
    "difficulty": "Medium",
    "coreIdea": "Track the minimum and maximum possible number of open parentheses",
    "complexity": "O(n) | O(1)",
    "frequency": 82
  },
  {
    "problem": "Sort Characters By Frequency",
    "link": "[https://leetcode.com/problems/sort-characters-by-frequency](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/sort-characters-by-frequency)",
    "pattern": "Heap",
    "subPattern": "Frequency Sorting",
    "difficulty": "Medium",
    "coreIdea": "Count frequencies and use a heap or bucket sort to rebuild the string",
    "complexity": "O(n log k) | O(n)",
    "frequency": 82
  },
  {
    "problem": "Binary Tree Zigzag Level Order Traversal",
    "link": "[https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal)",
    "pattern": "Tree",
    "subPattern": "BFS Deque",
    "difficulty": "Medium",
    "coreIdea": "Use a deque to alternate insertion order for each tree level",
    "complexity": "O(n) | O(n)",
    "frequency": 82
  },
  {
    "problem": "Plus One",
    "link": "[https://leetcode.com/problems/plus-one](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/plus-one)",
    "pattern": "Math",
    "subPattern": "Array Manipulation",
    "difficulty": "Easy",
    "coreIdea": "Traverse from the end, incrementing and handling carry specifically for '9's",
    "complexity": "O(n) | O(n)",
    "frequency": 82
  },
  {
    "problem": "Single Number",
    "link": "[https://leetcode.com/problems/single-number](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/single-number)",
    "pattern": "Bit Manipulation",
    "subPattern": "XOR Cancellation",
    "difficulty": "Easy",
    "coreIdea": "XOR all elements together; identical pairs cancel out to zero",
    "complexity": "O(n) | O(1)",
    "frequency": 82
  },
  {
    "problem": "Reverse String",
    "link": "[https://leetcode.com/problems/reverse-string](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/reverse-string)",
    "pattern": "Two Pointers",
    "subPattern": "Swapping",
    "difficulty": "Easy",
    "coreIdea": "Swap characters at the start and end pointers moving inward",
    "complexity": "O(n) | O(1)",
    "frequency": 82
  },
  {
    "problem": "Partition Equal Subset Sum",
    "link": "[https://leetcode.com/problems/partition-equal-subset-sum](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/partition-equal-subset-sum)",
    "pattern": "DP",
    "subPattern": "0/1 Knapsack",
    "difficulty": "Medium",
    "coreIdea": "Determine if a subset exists that sums to exactly half of the total sum",
    "complexity": "O(n * sum) | O(sum)",
    "frequency": 80
  },
  {
    "problem": "Binary Tree Level Order Traversal",
    "link": "[https://leetcode.com/problems/binary-tree-level-order-traversal](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/binary-tree-level-order-traversal)",
    "pattern": "Tree",
    "subPattern": "BFS Queue",
    "difficulty": "Medium",
    "coreIdea": "Use a queue to process all nodes level by level",
    "complexity": "O(n) | O(n)",
    "frequency": 80
  },
  {
    "problem": "Count Primes",
    "link": "[https://leetcode.com/problems/count-primes](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/count-primes)",
    "pattern": "Math",
    "subPattern": "Sieve of Eratosthenes",
    "difficulty": "Medium",
    "coreIdea": "Efficiently mark multiples of primes as non-prime",
    "complexity": "O(n log log n) | O(n)",
    "frequency": 80
  },
  {
    "problem": "Shortest Path in Binary Matrix",
    "link": "[https://leetcode.com/problems/shortest-path-in-binary-matrix](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/shortest-path-in-binary-matrix)",
    "pattern": "Graph",
    "subPattern": "BFS Grid",
    "difficulty": "Medium",
    "coreIdea": "Perform BFS to find the shortest clear path to the target cell",
    "complexity": "O(n^2) | O(n^2)",
    "frequency": 78
  },
  {
    "problem": "K Closest Points to Origin",
    "link": "[https://leetcode.com/problems/k-closest-points-to-origin](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/k-closest-points-to-origin)",
    "pattern": "Heap",
    "subPattern": "Max Heap",
    "difficulty": "Medium",
    "coreIdea": "Maintain a max-heap of size k to keep the points with smallest distances",
    "complexity": "O(n log k) | O(k)",
    "frequency": 78
  },
  {
    "problem": "Shortest Bridge",
    "link": "[https://leetcode.com/problems/shortest-bridge](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/shortest-bridge)",
    "pattern": "Graph",
    "subPattern": "DFS + BFS",
    "difficulty": "Medium",
    "coreIdea": "Identify first island with DFS, then expand with BFS to find the second",
    "complexity": "O(n^2) | O(n^2)",
    "frequency": 78
  },
  {
    "problem": "Can Place Flowers",
    "link": "[https://leetcode.com/problems/can-place-flowers](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/can-place-flowers)",
    "pattern": "Greedy",
    "subPattern": "Boundary Check",
    "difficulty": "Easy",
    "coreIdea": "Check current and adjacent plots to see if a flower can be placed",
    "complexity": "O(n) | O(1)",
    "frequency": 78
  },
  {
    "problem": "Restore IP Addresses",
    "link": "[https://leetcode.com/problems/restore-ip-addresses](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/restore-ip-addresses)",
    "pattern": "Backtracking",
    "subPattern": "Partitioning",
    "difficulty": "Medium",
    "coreIdea": "Recursively split string into four segments valid for IP addressing",
    "complexity": "O(3^4) | O(1)",
    "frequency": 78
  },
  {
    "problem": "Add Strings",
    "link": "[https://leetcode.com/problems/add-strings](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/add-strings)",
    "pattern": "Math",
    "subPattern": "Digit Simulation",
    "difficulty": "Easy",
    "coreIdea": "Simulate manual addition digit-by-digit from the end of strings",
    "complexity": "O(max(n, m)) | O(max(n, m))",
    "frequency": 78
  },
  {
    "problem": "Next Greater Element II",
    "link": "[https://leetcode.com/problems/next-greater-element-ii](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/next-greater-element-ii)",
    "pattern": "Stack",
    "subPattern": "Circular Monotonic Stack",
    "difficulty": "Medium",
    "coreIdea": "Simulate a circular array by iterating through the array twice with a stack",
    "complexity": "O(n) | O(n)",
    "frequency": 78
  },
  {
    "problem": "Find Pivot Index",
    "link": "[https://leetcode.com/problems/find-pivot-index](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/find-pivot-index)",
    "pattern": "Array",
    "subPattern": "Prefix Sum",
    "difficulty": "Easy",
    "coreIdea": "Check if left sum equals (total sum - left sum - current value)",
    "complexity": "O(n) | O(1)",
    "frequency": 78
  },
  {
    "problem": "Contains Duplicate II",
    "link": "[https://leetcode.com/problems/contains-duplicate-ii](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/contains-duplicate-ii)",
    "pattern": "Hashing",
    "subPattern": "Sliding Window Map",
    "difficulty": "Easy",
    "coreIdea": "Track the last seen index of each element in a hash map",
    "complexity": "O(n) | O(n)",
    "frequency": 78
  },
  {
    "problem": "Flatten Nested List Iterator",
    "link": "[https://leetcode.com/problems/flatten-nested-list-iterator](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/flatten-nested-list-iterator)",
    "pattern": "Design",
    "subPattern": "Stack Unfolding",
    "difficulty": "Medium",
    "coreIdea": "Use a stack to lazily flatten the nested structure as we iterate",
    "complexity": "O(n) | O(n)",
    "frequency": 78
  },
  {
    "problem": "Search a 2D Matrix II",
    "link": "[https://leetcode.com/problems/search-a-2d-matrix-ii](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/search-a-2d-matrix-ii)",
    "pattern": "Binary Search",
    "subPattern": "Corner Pivot",
    "difficulty": "Medium",
    "coreIdea": "Start from top-right corner and move left or down to find the target",
    "complexity": "O(m + n) | O(1)",
    "frequency": 76
  },
  {
    "problem": "Binary Tree Right Side View",
    "link": "[https://leetcode.com/problems/binary-tree-right-side-view](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/binary-tree-right-side-view)",
    "pattern": "Tree",
    "subPattern": "BFS/DFS Level Last",
    "difficulty": "Medium",
    "coreIdea": "Collect the last node encountered at each level of the tree",
    "complexity": "O(n) | O(h)",
    "frequency": 76
  },
  {
    "problem": "Longest String Chain",
    "link": "[https://leetcode.com/problems/longest-string-chain](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/longest-string-chain)",
    "pattern": "DP",
    "subPattern": "Word Building Hashing",
    "difficulty": "Medium",
    "coreIdea": "Sort words and use a map to build chains by removing one char at a time",
    "complexity": "O(n log n + n * L^2) | O(n * L)",
    "frequency": 76
  },
  {
    "problem": "Longest Increasing Path in a Matrix",
    "link": "[https://leetcode.com/problems/longest-increasing-path-in-a-matrix](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/longest-increasing-path-in-a-matrix)",
    "pattern": "Graph",
    "subPattern": "DFS + Memoization",
    "difficulty": "Hard",
    "coreIdea": "Explore all paths with DFS while memoizing results for each cell",
    "complexity": "O(M*N) | O(M*N)",
    "frequency": 76
  },
  {
    "problem": "Search Insert Position",
    "link": "[https://leetcode.com/problems/search-insert-position](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/search-insert-position)",
    "pattern": "Binary Search",
    "subPattern": "Target Placement",
    "difficulty": "Easy",
    "coreIdea": "Standard binary search returning the low pointer for insertion",
    "complexity": "O(log n) | O(1)",
    "frequency": 76
  },
  {
    "problem": "Max Consecutive Ones",
    "link": "[https://leetcode.com/problems/max-consecutive-ones](https://leetcode.com/problems/max-consecutive-ones)",
    "pattern": "Array",
    "subPattern": "Counter",
    "difficulty": "Easy",
    "coreIdea": "Maintain a counter that resets to zero whenever a '0' is encountered",
    "complexity": "O(n) | O(1)",
    "frequency": 76
  },
  {
    "problem": "Middle of the Linked List",
    "link": "[https://leetcode.com/problems/middle-of-the-linked-list](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/middle-of-the-linked-list)",
    "pattern": "Two Pointers",
    "subPattern": "Fast & Slow Pointers",
    "difficulty": "Easy",
    "coreIdea": "A fast pointer twice as fast as the slow one reaches end when slow is at middle",
    "complexity": "O(n) | O(1)",
    "frequency": 76
  },
  {
    "problem": "Max Points on a Line",
    "link": "[https://leetcode.com/problems/max-points-on-a-line](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/max-points-on-a-line)",
    "pattern": "Hashing",
    "subPattern": "Slope Tracking",
    "difficulty": "Hard",
    "coreIdea": "For each point, calculate slopes with other points and store counts in a map",
    "complexity": "O(n^2) | O(n)",
    "frequency": 76
  },
  {
    "problem": "Number of Visible People in a Queue",
    "link": "[https://leetcode.com/problems/number-of-visible-people-in-a-queue](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/number-of-visible-people-in-a-queue)",
    "pattern": "Stack",
    "subPattern": "Monotonic Stack",
    "difficulty": "Hard",
    "coreIdea": "Use a monotonic decreasing stack from right to left to count visible neighbors",
    "complexity": "O(n) | O(n)",
    "frequency": 76
  },
  {
    "problem": "Minimum Size Subarray Sum",
    "link": "[https://leetcode.com/problems/minimum-size-subarray-sum](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/minimum-size-subarray-sum)",
    "pattern": "Sliding Window",
    "subPattern": "Variable Window",
    "difficulty": "Medium",
    "coreIdea": "Expand window until sum >= target, then shrink to find minimum size",
    "complexity": "O(n) | O(1)",
    "frequency": 76
  },
  {
    "problem": "Swap Nodes in Pairs",
    "link": "[https://leetcode.com/problems/swap-nodes-in-pairs](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/swap-nodes-in-pairs)",
    "pattern": "Linked List",
    "subPattern": "Pointer Manipulation",
    "difficulty": "Medium",
    "coreIdea": "Iteratively or recursively re-link pairs of nodes",
    "complexity": "O(n) | O(1)",
    "frequency": 74
  },
  {
    "problem": "Binary Tree Cameras",
    "link": "[https://leetcode.com/problems/binary-tree-cameras](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/binary-tree-cameras)",
    "pattern": "Tree",
    "subPattern": "Greedy DFS",
    "difficulty": "Hard",
    "coreIdea": "Post-order DFS to place cameras greedily from bottom up",
    "complexity": "O(n) | O(h)",
    "frequency": 74
  },
  {
    "problem": "Intersection of Two Linked Lists",
    "link": "[https://leetcode.com/problems/intersection-of-two-linked-lists](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/intersection-of-two-linked-lists)",
    "pattern": "Linked List",
    "subPattern": "Offset Comparison",
    "difficulty": "Easy",
    "coreIdea": "Iterate through both lists; switch to the other head upon reaching end to meet at intersection",
    "complexity": "O(n + m) | O(1)",
    "frequency": 74
  },
  {
    "problem": "Maximum Depth of Binary Tree",
    "link": "[https://leetcode.com/problems/maximum-depth-of-binary-tree](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/maximum-depth-of-binary-tree)",
    "pattern": "Tree",
    "subPattern": "DFS Recursion",
    "difficulty": "Easy",
    "coreIdea": "Max depth is 1 + max of left and right child depths",
    "complexity": "O(n) | O(h)",
    "frequency": 74
  },
  {
    "problem": "Design Tic-Tac-Toe",
    "link": "[https://leetcode.com/problems/design-tic-tac-toe](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/design-tic-tac-toe)",
    "pattern": "Design",
    "subPattern": "Row/Col Sums",
    "difficulty": "Medium",
    "coreIdea": "Track sums for rows, cols, and diagonals to detect winners in O(1)",
    "complexity": "O(1) | O(n)",
    "frequency": 74
  },
  {
    "problem": "Distinct Subsequences",
    "link": "[https://leetcode.com/problems/distinct-subsequences](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/distinct-subsequences)",
    "pattern": "DP",
    "subPattern": "2D Pattern Matching",
    "difficulty": "Hard",
    "coreIdea": "Match target characters with source characters using 2D DP",
    "complexity": "O(M*N) | O(M*N)",
    "frequency": 74
  },
  {
    "problem": "Design Add and Search Words Data Structure",
    "link": "[https://leetcode.com/problems/design-add-and-search-words-data-structure](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/design-add-and-search-words-data-structure)",
    "pattern": "Design",
    "subPattern": "Trie with Wildcards",
    "difficulty": "Medium",
    "coreIdea": "Implement a Trie and use DFS to handle '.' wildcard searches",
    "complexity": "O(L) | O(Nodes)",
    "frequency": 72
  },
  {
    "problem": "Trapping Rain Water II",
    "link": "[https://leetcode.com/problems/trapping-rain-water-ii](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/trapping-rain-water-ii)",
    "pattern": "Heap",
    "subPattern": "Priority Queue BFS",
    "difficulty": "Hard",
    "coreIdea": "Use a min-heap to explore inward from the boundaries of the grid",
    "complexity": "O(M*N log(M*N)) | O(M*N)",
    "frequency": 72
  },
  {
    "problem": "Find the Length of the Longest Common Prefix",
    "link": "[https://leetcode.com/problems/find-the-length-of-the-longest-common-prefix](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/find-the-length-of-the-longest-common-prefix)",
    "pattern": "Trie",
    "subPattern": "Prefix Mapping",
    "difficulty": "Medium",
    "coreIdea": "Build a Trie for one set and find the deepest match for strings in the second set",
    "complexity": "O(n*L) | O(n*L)",
    "frequency": 72
  },
  {
    "problem": "Binary Search",
    "link": "[https://leetcode.com/problems/binary-search](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/binary-search)",
    "pattern": "Binary Search",
    "subPattern": "Standard Search",
    "difficulty": "Easy",
    "coreIdea": "Divide and conquer the sorted search range by half",
    "complexity": "O(log n) | O(1)",
    "frequency": 72
  },
  {
    "problem": "Design Twitter",
    "link": "[https://leetcode.com/problems/design-twitter](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/design-twitter)",
    "pattern": "Design",
    "subPattern": "Heap k-merge",
    "difficulty": "Medium",
    "coreIdea": "Merge most recent posts from followed users using a heap",
    "complexity": "O(log n) | O(User*Tweet)",
    "frequency": 72
  },
  {
    "problem": "Find the Celebrity",
    "link": "[https://leetcode.com/problems/find-the-celebrity](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/find-the-celebrity)",
    "pattern": "Greedy",
    "subPattern": "Logical Elimination",
    "difficulty": "Medium",
    "coreIdea": "Eliminate non-celebrities in one pass, then verify the last candidate",
    "complexity": "O(n) | O(1)",
    "frequency": 72
  },
  {
    "problem": "Maximum Product of Three Numbers",
    "link": "[https://leetcode.com/problems/maximum-product-of-three-numbers](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/maximum-product-of-three-numbers)",
    "pattern": "Greedy",
    "subPattern": "Sorting logic",
    "difficulty": "Easy",
    "coreIdea": "Compare product of three largest with product of two smallest and the largest",
    "complexity": "O(n) | O(1)",
    "frequency": 70
  },
  {
    "problem": "Word Break II",
    "link": "[https://leetcode.com/problems/word-break-ii](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/word-break-ii)",
    "pattern": "Backtracking",
    "subPattern": "DFS + Memoization",
    "difficulty": "Hard",
    "coreIdea": "Split string and recursively solve for remaining parts using memoization",
    "complexity": "O(2^n) | O(2^n)",
    "frequency": 70
  },
  {
    "problem": "Maximum Number of Events That Can Be Attended",
    "link": "[https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended)",
    "pattern": "Greedy",
    "subPattern": "Heap Priority Queue",
    "difficulty": "Medium",
    "coreIdea": "Attend events that end earliest on each available day using a heap",
    "complexity": "O(n log n) | O(n)",
    "frequency": 70
  },
  {
    "problem": "Boats to Save People",
    "link": "[https://leetcode.com/problems/boats-to-save-people](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/boats-to-save-people)",
    "pattern": "Two Pointers",
    "subPattern": "Greedy Matching",
    "difficulty": "Medium",
    "coreIdea": "Pair heaviest and lightest people together if their sum is within limit",
    "complexity": "O(n log n) | O(1)",
    "frequency": 70
  },
  {
    "problem": "Interval List Intersections",
    "link": "[https://leetcode.com/problems/interval-list-intersections](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/interval-list-intersections)",
    "pattern": "Two Pointers",
    "subPattern": "Range Comparison",
    "difficulty": "Medium",
    "coreIdea": "Find the intersection of two current intervals and advance pointers accordingly",
    "complexity": "O(n + m) | O(n + m)",
    "frequency": 70
  },
  {
    "problem": "Best Time to Buy and Sell Stock III",
    "link": "[https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii)",
    "pattern": "DP",
    "subPattern": "State Machine",
    "difficulty": "Hard",
    "coreIdea": "Track max profits for up to two transactions via distinct states",
    "complexity": "O(n) | O(1)",
    "frequency": 70
  },
  {
    "problem": "Game of Life",
    "link": "[https://leetcode.com/problems/game-of-life](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/game-of-life)",
    "pattern": "Matrix",
    "subPattern": "State Encoding",
    "difficulty": "Medium",
    "coreIdea": "Encode current and next state in bits to update the board in-place",
    "complexity": "O(M*N) | O(1)",
    "frequency": 70
  },
  {
    "problem": "Longest Palindromic Subsequence",
    "link": "[https://leetcode.com/problems/longest-palindromic-subsequence](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/longest-palindromic-subsequence)",
    "pattern": "DP",
    "subPattern": "2D String DP",
    "difficulty": "Medium",
    "coreIdea": "LCS of string and its reverse provides the longest palindromic subsequence",
    "complexity": "O(n^2) | O(n^2)",
    "frequency": 70
  },
  {
    "problem": "Design Memory Allocator",
    "link": "[https://leetcode.com/problems/design-memory-allocator](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/design-memory-allocator)",
    "pattern": "Design",
    "subPattern": "Array Simulation",
    "difficulty": "Medium",
    "coreIdea": "Find contiguous empty blocks in an array for allocation and clear by ID",
    "complexity": "O(n) | O(n)",
    "frequency": 70
  },
  {
    "problem": "Flood Fill",
    "link": "[https://leetcode.com/problems/flood-fill](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/flood-fill)",
    "pattern": "Graph",
    "subPattern": "DFS/BFS",
    "difficulty": "Easy",
    "coreIdea": "Recursively color all connected pixels of the same starting color",
    "complexity": "O(M*N) | O(M*N)",
    "frequency": 68
  },
  {
    "problem": "Minimum Remove to Make Valid Parentheses",
    "link": "[https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses)",
    "pattern": "Stack",
    "subPattern": "Balanced Removal",
    "difficulty": "Medium",
    "coreIdea": "Use a stack to find indices of invalid parentheses to remove them",
    "complexity": "O(n) | O(n)",
    "frequency": 68
  },
  {
    "problem": "Count and Say",
    "link": "[https://leetcode.com/problems/count-and-say](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/count-and-say)",
    "pattern": "String",
    "subPattern": "Run-length Encoding",
    "difficulty": "Medium",
    "coreIdea": "Iteratively describe the frequency of digit groups in the previous term",
    "complexity": "O(2^n) | O(2^n)",
    "frequency": 68
  },
  {
    "problem": "Diagonal Traverse",
    "link": "[https://leetcode.com/problems/diagonal-traverse](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/diagonal-traverse)",
    "pattern": "Matrix",
    "subPattern": "Simulation",
    "difficulty": "Medium",
    "coreIdea": "Traverse the matrix in zigzag diagonal paths by toggling direction",
    "complexity": "O(M*N) | O(1)",
    "frequency": 68
  },
  {
    "problem": "Design In-Memory File System",
    "link": "[https://leetcode.com/problems/design-in-memory-file-system](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/design-in-memory-file-system)",
    "pattern": "Design",
    "subPattern": "Trie Hierarchy",
    "difficulty": "Hard",
    "coreIdea": "Represent the file system as a trie-like structure of nodes",
    "complexity": "O(PathLength) | O(Nodes)",
    "frequency": 68
  },
  {
    "problem": "Contiguous Array",
    "link": "[https://leetcode.com/problems/contiguous-array](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/contiguous-array)",
    "pattern": "Hashing",
    "subPattern": "Prefix Sum Map",
    "difficulty": "Medium",
    "coreIdea": "Map running relative counts of 0s and 1s to their first seen index",
    "complexity": "O(n) | O(n)",
    "frequency": 68
  },
  {
    "problem": "Merge Strings Alternately",
    "link": "[https://leetcode.com/problems/merge-strings-alternately](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/merge-strings-alternately)",
    "pattern": "String",
    "subPattern": "Two Pointers",
    "difficulty": "Easy",
    "coreIdea": "Iterate through both strings and pick characters alternately",
    "complexity": "O(n + m) | O(n + m)",
    "frequency": 68
  },
  {
    "problem": "01 Matrix",
    "link": "[https://leetcode.com/problems/01-matrix](https://www.google.com/url?sa=E&source=gmail&q=https://leetcode.com/problems/01-matrix)",
    "pattern": "Graph",
    "subPattern": "Multi-source BFS",
    "difficulty": "Medium",
    "coreIdea": "BFS from all '0's simultaneously to find minimum distance for each '1'",
    "complexity": "O(M*N) | O(M*N)",
    "frequency": 68
  }
]
;
