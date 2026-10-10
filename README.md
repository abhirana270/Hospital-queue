# 🏥 Hospital Patient Queue Management System
### Full-Stack Next.js + Real-World C++ Data Structures & Algorithms

A production-style hospital management application powered by **manually implemented Data Structures and Algorithms in C++**. Core hospital workflows (consultation lines, emergency triage, patient lookup, record ordering, and department wayfinding) execute on compiled C++ engines connected to a Next.js full-stack interface.

---

## 🎯 Architecture

```
 Next.js Frontend (React 18 + Tailwind CSS)
                   │
                   ▼
 Next.js API Route Handlers (app/api/...)
        │                           │
        ▼                           ▼
 MongoDB / Local Store        C++ DSA Engine (IPC via stdin/stdout JSON)
 (Persistent Records)         ├── Linked List Queue (Normal Queue)
                              ├── Binary Min-Heap (Emergency Triage)
                              ├── Hash Table (Patient Lookup)
                              ├── Binary Search Tree (Records)
                              └── Graph + Dijkstra/BFS (Navigation)
```

---

## 📊 DSA-to-Feature Mapping

| Feature | Data Structure | Complexity | C++ Engine Location |
|---|---|---|---|
| **Normal Consultation Queue** | Singly Linked List Queue | **O(1)** Enqueue/Dequeue | `dsa/queue/` |
| **Emergency Triage Queue** | Binary Min-Heap Priority Queue | **O(log n)** Insert/Extract | `dsa/priority_queue/` |
| **Instant Patient Search** | Hash Table with Separate Chaining | **O(1)** Average Search | `dsa/hash_table/` |
| **Sorted Patient Records** | Binary Search Tree (BST) | **O(log n)** Avg / O(n) Inorder | `dsa/bst/` |
| **Hospital Corridor Navigation**| Weighted Graph + Dijkstra / BFS | **O((V+E)log V)** / O(V+E) | `dsa/graph/` |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** 18+ (tested on Node v24)
- **MinGW GCC / g++** compiler (for compiling C++ modules)
- **MongoDB** (optional; app includes automatic local persistence fallback)

### 2. Compilation of C++ DSA Engines
All C++ binaries can be compiled with:
```powershell
# Compile Queue
g++ -std=c++11 -O2 "dsa/queue/main.cpp" -o "dsa/queue/queue.exe"

# Compile Priority Queue
g++ -std=c++11 -O2 "dsa/priority_queue/main.cpp" -o "dsa/priority_queue/priority_queue.exe"

# Compile Hash Table
g++ -std=c++11 -O2 "dsa/hash_table/main.cpp" -o "dsa/hash_table/hash_table.exe"

# Compile Binary Search Tree
g++ -std=c++11 -O2 "dsa/bst/main.cpp" -o "dsa/bst/bst.exe"

# Compile Graph Navigation
g++ -std=c++11 -O2 "dsa/graph/main.cpp" -o "dsa/graph/graph.exe"
```

### 3. Run Automated DSA Test Suite
Verify that all 5 C++ modules pass 100% of internal test cases:
```bash
node tests/dsa-test-suite.js
```

### 4. Start the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Accounts & Role-Based Access Control

Visit `/login` and use one-click quick login for:
- 👑 **Admin**: `admin@hospital.org` (Full system access & analytics)
- 👨‍⚕️ **Doctor**: `dr.jenkins@hospital.org` (Consultations & doctor workloads)
- 📋 **Receptionist**: `receptionist@hospital.org` (Patient registration & queuing)

---

## 🧪 Comprehensive Feature Walkthrough

1. **Dashboard (`/dashboard`)**:
   - Real-time hospital metrics and department loads.
   - Live pointer chain visualizer (`P104 → P106 → NULL`).
   - "Call Next Patient" (`dequeue`) and "Admit Critical Patient" (`extract_min`) buttons.

2. **Normal Queue (`/queue`)**:
   - Visualizes singly linked list nodes with head and tail pointers.
   - Demonstrates constant $O(1)$ operations with zero memory shifting.

3. **Emergency Triage (`/emergency`)**:
   - Live Binary Min-Heap sorted by urgency.
   - Priority Repositioning tool: change a patient's score to see real-time $O(\log n)$ heap reorganization.

4. **Patient Search & Records (`/patients`)**:
   - Sub-millisecond lookup via C++ Hash Table with chaining.
   - Toggle to switch to Binary Search Tree in-order sorted view.

5. **Hospital Navigation (`/departments`)**:
   - Choose start and destination departments.
   - Runs C++ Dijkstra to calculate shortest path in meters, estimated walking time, and step-by-step corridor directions.

6. **Doctors & Load Balancing (`/doctors`)**:
   - Live capacity utilization bars.
   - Automated routing assigns new patients to the least-loaded doctor.

7. **Analytics (`/analytics`)**:
   - Average wait times, maximum wait times, and throughput.
   - DSA execution benchmark comparisons.

---

## 📚 Technical Documentation
Detailed complexity proofs, mathematical scoring formulas, and viva questions are documented in **[`docs/DSA.md`](file:///c:/Users/hp/Desktop/Projects/hospital%20queue%20system/docs/DSA.md)**.
