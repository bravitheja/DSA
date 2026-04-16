#!/usr/bin/env python3
"""
Append N new problems from 1leet_code_frequency.csv onto data.json.
Uses company_questions_by_url.json for titles and difficulty; heuristics for pattern fields.

Example: set EXISTING / NEW_COUNT then run:
  python3 scripts/expand_data_from_frequency_csv.py
"""
from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LC = ROOT.parent / "leetcode-companywise-interview-questions"
CSV_PATH = LC / "1leet_code_frequency.csv"
BIG_JSON = LC / "company_questions_by_url.json"
DATA_JSON = ROOT / "data.json"

# Existing count before expansion; new rows are CSV index slice [EXISTING:, EXISTING + NEW_COUNT)
EXISTING = 500
NEW_COUNT = 500  # -> 1000 total


def norm_url(u: str) -> str:
    u = u.strip()
    for sep in ("#", "?"):
        if sep in u:
            u = u.split(sep, 1)[0]
    return u.rstrip("/")


def slug_title(slug: str) -> str:
    return " ".join(w.capitalize() for w in slug.replace("-", " ").split())


def classify(slug: str, title: str) -> tuple[str, str, str, str]:
    """Return pattern, subPattern, coreIdea, complexity."""
    s = f"{slug} {title}".lower()

    # --- SQL / Database (LeetCode DB problems) ---
    if any(
        k in s
        for k in (
            "sql",
            "mysql",
            "department",
            "employee",
            "salaries",
            "customers",
            "transactions",
            "monthly",
            "immediate",
            "recyclable",
            "article views",
            "exchange seats",
            "nth highest",
            "big countries",
            "duplicate emails",
            "managers with",
            "rank scores",
            "average selling",
            "recyclable-and-low-fat",
            "combine two tables",
            "customer who visited",
            "immediate food delivery",
            "average time of process",
            "employees earning",
            "recyclable",
        )
    ):
        return (
            "SQL",
            "Joins / aggregation",
            "Express filters, joins, and aggregates in SQL as specified.",
            "Varies | Varies",
        )

    # --- Design ---
    if any(
        k in s
        for k in (
            "design-",
            "design ",
            "browser-history",
            "autocomplete",
            "authentication-manager",
            "text-editor",
            "leaderboard",
            "file-system",
            "snake-game",
            "excel-sum-formula",
            "food-delivery",
            "stack-with-increment",
            "all-oone",
            "max-stack",
        )
    ):
        return (
            "Design",
            "Mutable API",
            "Expose operations with correct time complexity using maps, lists, stacks, or trees.",
            "Varies | O(n)",
        )

    # --- Graph (explicit) ---
    if any(
        k in s
        for k in (
            "graph-valid-tree",
            "network-delay",
            "parallel-courses",
            "critical-connections",
            "possible-bipartition",
            "number-of-operations-to-make-network-connected",
            "most-stones-removed",
            "find-all-possible-recipes",
            "the-maze",
            "snakes-and-ladders",
            "minimum-cost-to-connect-all-points",
            "island-perimeter",
            "evaluate-division",
        )
    ):
        return (
            "Graph",
            "BFS / DFS / Union Find",
            "Model vertices and edges; traverse or merge components.",
            "O(V+E) | O(V+E)",
        )

    # --- Tree / BST ---
    if (
        "tree" in s
        or "binary-tree" in s
        or "bst" in s
        or ("binary" in s and "matrix" not in s and "search" in s)
    ):
        if "lca" in s or "lowest-common" in s:
            return (
                "Tree",
                "LCA / ancestor",
                "Traverse or walk up parent pointers to find common ancestor.",
                "O(n) | O(h)",
            )
        if "serialize" in s or "deserialize" in s:
            return (
                "Tree",
                "Codec",
                "Encode structure in preorder or level order and rebuild recursively.",
                "O(n) | O(n)",
            )
        if "next" in s and "pointer" in s:
            return (
                "Tree",
                "Level linking",
                "Link nodes level by level or use next pointers.",
                "O(n) | O(1)",
            )
        return (
            "Tree",
            "DFS / BFS",
            "Recursion or stack/queue to traverse subtrees and aggregate state.",
            "O(n) | O(h)",
        )

    # --- Linked list ---
    if "linked-list" in s or "list-node" in s or "rotate-list" in s or "merge-in-between" in s:
        return (
            "Linked List",
            "Pointer manipulation",
            "Use dummy node and rewire next pointers carefully.",
            "O(n) | O(1)",
        )

    # --- Matrix / grid ---
    if any(
        k in s
        for k in (
            "matrix",
            "grid",
            "spiral-matrix",
            "island",
            "rotting-",
            "pacific-atlantic",
            "surrounded-regions",
            "walls-and-gates",
            "shortest-path-in-a-grid",
            "rotating-the-box",
            "battleships",
        )
    ):
        return (
            "Matrix",
            "Grid traversal",
            "Walk cells with BFS/DFS or directional simulation.",
            "O(mn) | O(mn)",
        )

    # --- Heap ---
    if any(
        k in s
        for k in (
            "kth-largest",
            "kth-smallest",
            "median",
            "furthest-building",
            "swim-in-rising-water",
            "smallest-range-covering",
            "find-k-pairs",
            "last-stone",
            "heaters",
        )
    ):
        return (
            "Heap",
            "Priority queue",
            "Push/pop to maintain order statistics or greedy choice.",
            "O(n log k) | O(k)",
        )

    # --- Binary search (on value or index) ---
    if any(
        k in s
        for k in (
            "smallest-divisor",
            "days-to-make-m-bouquets",
            "magnetic-force",
            "split-array-largest-sum",
            "peak-index",
            "first-bad-version",
            "search-in-rotated",
            "koko-eating-bananas",
        )
    ):
        return (
            "Binary Search",
            "Monotonic predicate",
            "Binary search on answer or index space.",
            "O(n log U) | O(1)",
        )

    # --- Stack / parentheses ---
    if any(
        k in s
        for k in (
            "parentheses",
            "calculator",
            "monotonic",
            "stack",
            "remove-invalid-parentheses",
            "132-pattern",
            "exclusive-time",
            "minimum-add-to-make-parentheses",
        )
    ):
        return (
            "Stack",
            "Nested / monotonic",
            "Push/pop to match nesting or maintain monotonic property.",
            "O(n) | O(n)",
        )

    # --- DP ---
    if any(
        k in s
        for k in (
            "coin-change",
            "house-robber",
            "interleaving",
            "triangle",
            "perfect-squares",
            "target-sum",
            "dungeon-game",
            "cherry-pickup",
            "remove-boxes",
            "strange-printer",
            "palindrome-partitioning",
            "longest-arithmetic",
            "russian-doll",
            "burst-balloon",
            "partition-array",
            "sum-of-subarray-minimums",
            "minimum-cost-for-tickets",
        )
    ):
        return (
            "DP",
            "Tabulation / memo",
            "Define recurrence over subproblems; avoid recomputation.",
            "O(n^2) | O(n^2)",
        )

    # --- Sliding window / two pointers ---
    if any(
        k in s
        for k in (
            "sliding-window",
            "longest-substring",
            "subarray",
            "fruit-into-baskets",
            "longest-mountain",
            "longest-subarray-of-1s",
            "longest-continuous-subarray",
            "count-subarrays-with-fixed-bounds",
        )
    ):
        return (
            "Sliding Window",
            "Two pointers",
            "Expand/shrink window while maintaining a valid invariant.",
            "O(n) | O(k)",
        )

    # --- Greedy / intervals ---
    if any(
        k in s
        for k in (
            "meeting-rooms",
            "car-fleet",
            "jump-game",
            "greedy",
            "interval",
            "partition-labels",
            "minimum-number-of-arrows",
            "non-overlapping",
        )
    ):
        return (
            "Greedy",
            "Sort + scan",
            "Sort by end/start then iterate with local optimal choice.",
            "O(n log n) | O(1)",
        )

    # --- Union find ---
    if any(k in s for k in ("union", "connected-components", "number-of-provinces", "distinct-islands")):
        return (
            "Union Find",
            "Components",
            "Union connected elements; count or query components.",
            "O(α(n)) | O(n)",
        )

    # --- Bit manipulation ---
    if any(k in s for k in ("bit", "reverse-bits", "power-of-two", "number-of-1-bits", "xor", "good-numbers")):
        return (
            "Bit Manipulation",
            "Masks",
            "Use bitwise ops for O(1) checks or counting.",
            "O(n) | O(1)",
        )

    # --- Prefix sum / hashing ---
    if any(k in s for k in ("prefix", "subarray-sum", "contiguous-array", "subarray-sums-divisible")):
        return (
            "Prefix Sum",
            "Hashmap of prefixes",
            "Track cumulative sums; count pairs with target difference.",
            "O(n) | O(n)",
        )

    # --- String ---
    if any(
        k in s
        for k in (
            "string",
            "palindrome",
            "anagram",
            "vowel",
            "word-pattern",
            "reverse-vowels",
            "ransom",
            "rotate-string",
            "decode-string",
        )
    ):
        return (
            "String",
            "Scan / two pointers",
            "Process characters with counts or two pointers.",
            "O(n) | O(1)",
        )

    # --- Default ---
    return (
        "General",
        "Problem-specific",
        "Identify constraints and pick the right data structure (array, hash, sort).",
        "O(n) | O(n)",
    )


def main() -> None:
    with open(BIG_JSON, encoding="utf-8") as f:
        by_url = json.load(f)

    rows: list[tuple[str, int]] = []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            rows.append((row["URL"].strip(), int(row["company"])))

    new_rows = rows[EXISTING : EXISTING + NEW_COUNT]
    if len(new_rows) != NEW_COUNT:
        raise SystemExit(f"Expected {NEW_COUNT} new rows, got {len(new_rows)}")

    with open(DATA_JSON, encoding="utf-8") as f:
        existing = json.load(f)

    if len(existing) != EXISTING:
        print(f"Warning: data.json has {len(existing)} items, expected {EXISTING}")

    additions: list[dict] = []
    for url, freq in new_rows:
        key = norm_url(url)
        slug = key.rsplit("/", 1)[-1]
        meta = by_url.get(key, {})
        title = (meta.get("title") or "").strip() or slug_title(slug)
        difficulty = (meta.get("difficulty") or "Medium").strip()
        pat, sub, core, cplx = classify(slug, title)
        additions.append(
            {
                "problem": title,
                "link": key,
                "pattern": pat,
                "subPattern": sub,
                "difficulty": difficulty,
                "coreIdea": core,
                "complexity": cplx,
                "frequency": freq,
            }
        )

    merged = existing + additions
    DATA_JSON.write_text(json.dumps(merged, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {DATA_JSON} ({len(merged)} problems, +{len(additions)})")


if __name__ == "__main__":
    main()
