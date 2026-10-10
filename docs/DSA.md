# Data Structures and Algorithms (DSA) Specification & Viva Guide

## 1. DSA-to-Feature Architecture Mapping

| Hospital Feature | Data Structure | Why This Structure? | Core Operations | Time Complexity | Space Complexity |
|---|---|---|---|---|---|
| **Normal Patient Consultation Queue** | Singly Linked List Queue with Head & Tail pointers | Preserves strict First-In First-Out (FIFO) consultation flow without memory shifts | `enqueue()`, `dequeue()`, `peek()`, `isEmpty()` | **O(1)** Enqueue<br>**O(1)** Dequeue<br>**O(1)** Peek | **O(n)** |
| **Emergency Triage Queue** | Binary Min-Heap Priority Queue | Immediately routes highest-urgency patients to critical care regardless of arrival order | `insert()`, `extractMin()`, `peekMin()`, `updatePriority()` | **O(log n)** Insert<br>**O(log n)** ExtractMin<br>**O(1)** Peek<br>**O(log n)** Reposition | **O(n)** |
| **Instant Patient Directory Search** | Hash Table with Separate Chaining | Enables sub-millisecond lookup by Patient ID or Phone without linear scans | `insert()`, `search()`, `remove()` | **O(1)** Average<br>O(n) Worst | **O(B + n)** |
| **Ordered Patient Records Directory** | Binary Search Tree (BST) | Maintains dynamic lexicographical ordering by Patient ID for sorted medical indexing | `insert()`, `search()`, `delete()`, `inorderTraversal()` | **O(log n)** Avg Search<br>**O(n)** In-order Traversal | **O(n)** |
| **Hospital Department Navigation** | Undirected Weighted Graph (Adjacency List) | Computes shortest walking corridor and transit time between medical units | `dijkstra()`, `bfs()`, `dfs()` | **O((V + E) log V)** Dijkstra<br>**O(V + E)** BFS | **O(V + E)** |

---

## 2. Core Mathematical Formulas & Algorithms

### 2.1 Deterministic Triage Scoring Formula (Section 5.3)
The hospital assigns a simulated priority score $S$ used to position patients inside the C++ Binary Min-Heap:

$$S = \max\Big(0.10, \;\; \text{BaseSeverity} - \text{AgeAdjustment} - \text{WaitTimeAdjustment}\Big)$$

- **$\text{BaseSeverity}$**:
  - $\text{Critical} = 1.0$ (immediate resuscitation)
  - $\text{Serious} = 2.0$ (urgent intervention)
  - $\text{Moderate} = 3.0$ (semi-urgent)
  - $\text{Normal} = 4.0$ (routine consultation)
- **$\text{AgeAdjustment}$**:
  - If $\text{Age} \ge 65$ or $\text{Age} \le 5$, $\text{AgeAdjustment} = 0.20$ (vulnerable boost)
  - Otherwise, $0.00$
- **$\text{WaitTimeAdjustment}$**:
  - For every 15 minutes spent waiting: $+0.10$ boost
  - Capped at $+0.50$ maximum boost
- **Heap Rule**: Lower $S$ value indicates higher urgency. If $S_A = S_B$, the arrival timestamp $T$ breaks the tie, serving the earlier patient first.

---

### 2.2 Hash Function (`djb2`)
To guarantee uniform distribution across buckets with minimal collisions:

$$\text{hash}(k) = \left( \sum_{i=0}^{m-1} \left( \text{hash}_{i-1} \times 33 + k_i \right) \right) \pmod{\text{capacity}}$$

Collision resolution is implemented via **Separate Chaining** (linked list bucket chains).

---

### 2.3 Dijkstra's Algorithm for Hospital Navigation
Given the weighted hospital corridor graph $G = (V, E, w)$:
- Vertices $V$: Emergency (`ER`), Radiology (`RAD`), General Medicine (`GEN`), Cardiology (`CARD`), Neurology (`NEUR`), Orthopedics (`ORTH`), Pediatrics (`PED`).
- Weights $w(u, v)$: Physical corridor distance in meters and walking time.
- Uses a priority queue (min-heap) to greedily expand the minimum distance vertex in $O((V + E) \log V)$ time.

---

## 3. C++ Architecture & Integration

All core DSA logic resides in standalone C++11 source code in `/dsa`:
- `dsa/queue/queue.exe`: Compiled Linked List Queue engine
- `dsa/priority_queue/priority_queue.exe`: Compiled Binary Min-Heap engine
- `dsa/hash_table/hash_table.exe`: Compiled Separate Chaining Hash Table engine
- `dsa/bst/bst.exe`: Compiled Binary Search Tree engine
- `dsa/graph/graph.exe`: Compiled Adjacency List Graph engine

### Backend IPC Protocol:
Communication between Next.js/Node.js and C++ uses `child_process.execFile` via standard input (`stdin`) and standard output (`stdout`) encoded in structured JSON:
```
Node.js Route Handler ---> [JSON Payload via stdin] ---> C++ Binary
                                                            |
Node.js Route Handler <--- [JSON Result via stdout]  <------┘
```

---

## 4. Viva / Defense Preparation Questions

**Q1: Why use a Linked List for the Normal Queue instead of an array/vector?**
> In a static or dynamic array, `dequeue` (removing the first element) requires shifting all subsequent $n-1$ elements to the left, taking $O(n)$ time. A singly linked list maintains a `head` and `tail` pointer, allowing both `enqueue` (append at tail) and `dequeue` (pop from head) in strict $O(1)$ constant time.

**Q2: How does the Binary Heap handle patients with identical priority scores?**
> The manual heap implements a composite comparison comparator: primary comparison on `priorityScore`. When scores are equal, it compares `arrivalTimestamp`, guaranteeing that two patients with identical urgency are served in FIFO arrival order.

**Q3: How does the Hash Table handle collisions?**
> Each bucket index in the primary array stores a pointer to a linked list (`HashPatientRecord*`). If two keys hash to the same bucket (collision), the new node is prepended to the bucket's linked list in $O(1)$ time.

**Q4: What is the advantage of BST for patient records over an array?**
> A BST allows dynamic insertion, search, and deletion in $O(\log n)$ average time without needing contiguous block memory reallocations, and naturally produces alphabetically/numerically sorted patient records through an in-order traversal in $O(n)$ time.
