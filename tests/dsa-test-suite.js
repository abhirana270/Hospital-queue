const { execFileSync } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('  HOSPITAL QUEUE MANAGEMENT SYSTEM — DSA TEST SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(description, condition) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${description}`);
  } else {
    console.error(`  ❌ FAIL: ${description}`);
  }
}

const isWindows = process.platform === 'win32';
const ext = isWindows ? '.exe' : '';

function runModule(moduleName, args = [], input = null) {
  const binPath = path.join(process.cwd(), 'dsa', moduleName, `${moduleName}${ext}`);
  const opts = { timeout: 5000, encoding: 'utf-8' };
  if (input) opts.input = input;
  const stdout = execFileSync(binPath, args, opts);
  return JSON.parse(stdout.trim());
}

// -----------------------------------------------------------------------------
// TEST SUITE 1: Linked List Queue (Phase 2)
// -----------------------------------------------------------------------------
console.log('▶ [1/5] Testing C++ Singly Linked List Queue (dsa/queue/queue.exe)...');

// 1.1 Internal Unit Tests
const queueSelfTest = runModule('queue', ['--test']);
assert('Queue internal unit tests pass', queueSelfTest.success === true);

// 1.2 Empty Queue Check
const emptyQ = runModule('queue', [], JSON.stringify({ operation: 'display', patients: [] }));
assert('Empty queue returns length 0', emptyQ.queueLength === 0);

// 1.3 Multi-Patient Enqueue & Strict FIFO Dequeue
const testPatients = [
  { patientId: 'P101', name: 'Alice', age: 30, emergencyLevel: 'Normal', department: 'GEN', arrivalTimestamp: 1000 },
  { patientId: 'P102', name: 'Bob', age: 40, emergencyLevel: 'Normal', department: 'GEN', arrivalTimestamp: 2000 },
  { patientId: 'P103', name: 'Charlie', age: 50, emergencyLevel: 'Normal', department: 'GEN', arrivalTimestamp: 3000 },
];
const builtQ = runModule('queue', [], JSON.stringify({ operation: 'display', patients: testPatients }));
assert('Queue maintains exactly 3 patients', builtQ.queueLength === 3);
assert('Visualization string matches P101 → P102 → P103', builtQ.visualization.includes('P101 → P102 → P103'));

// Dequeue first
const deqResult = runModule('queue', [], JSON.stringify({ operation: 'dequeue', patients: testPatients }));
assert('FIFO Dequeue returns P101 first (O(1))', deqResult.dequeued?.patientId === 'P101');
assert('Remaining queue length after dequeue is 2', deqResult.queue?.queueLength === 2);
assert('Next in line after dequeue is P102', deqResult.queue?.patients[0]?.patientId === 'P102');

// -----------------------------------------------------------------------------
// TEST SUITE 2: Binary Min-Heap Priority Queue (Phase 3)
// -----------------------------------------------------------------------------
console.log('\n▶ [2/5] Testing C++ Binary Min-Heap Priority Queue (dsa/priority_queue/priority_queue.exe)...');

const heapSelfTest = runModule('priority_queue', ['--test']);
assert('Binary Heap unit tests pass', heapSelfTest.success === true);

const triagePatients = [
  { patientId: 'P_STABLE', name: 'Stable Patient', age: 25, emergencyLevel: 'Normal', department: 'GEN', priorityScore: 4.0, arrivalTimestamp: 100 },
  { patientId: 'P_CRITICAL', name: 'Cardiac Arrest', age: 60, emergencyLevel: 'Critical', department: 'ER', priorityScore: 0.8, arrivalTimestamp: 300 },
  { patientId: 'P_SERIOUS', name: 'Fracture', age: 45, emergencyLevel: 'Serious', department: 'ORTH', priorityScore: 2.0, arrivalTimestamp: 200 },
];

const heapBuilt = runModule('priority_queue', [], JSON.stringify({ operation: 'display', patients: triagePatients }));
assert('Root of Min-Heap is lowest score (Critical P_CRITICAL)', heapBuilt.patients[0]?.patientId === 'P_CRITICAL');
assert('Order is sorted by ascending priority score', heapBuilt.patients[1]?.patientId === 'P_SERIOUS' && heapBuilt.patients[2]?.patientId === 'P_STABLE');

// Test ExtractMin
const extMin = runModule('priority_queue', [], JSON.stringify({ operation: 'extract_min', patients: triagePatients }));
assert('ExtractMin admits P_CRITICAL first in O(log n)', extMin.extracted?.patientId === 'P_CRITICAL');

// Test Priority Repositioning
const repoRes = runModule('priority_queue', [], JSON.stringify({
  operation: 'update_priority',
  patients: triagePatients,
  patientId: 'P_STABLE',
  newPriorityScore: 0.2, // becomes highest priority
}));
assert('P_STABLE successfully repositioned to root after score drops to 0.2', repoRes.queue?.patients[0]?.patientId === 'P_STABLE');

// -----------------------------------------------------------------------------
// TEST SUITE 3: Hash Table with Chaining (Phase 7)
// -----------------------------------------------------------------------------
console.log('\n▶ [3/5] Testing C++ Hash Table with Chaining (dsa/hash_table/hash_table.exe)...');

const hashSelfTest = runModule('hash_table', ['--test']);
assert('Hash Table unit tests pass', hashSelfTest.success === true);

const hashLookup1 = runModule('hash_table', [], JSON.stringify({
  operation: 'search',
  query: 'P102',
  patients: [
    { patientId: 'P101', name: 'Alice', age: 30, gender: 'Female', phone: '555-0101', emergencyLevel: 'Normal', department: 'GEN', queueStatus: 'Waiting', priorityScore: 4.0 },
    { patientId: 'P102', name: 'Bob Chen', age: 45, gender: 'Male', phone: '555-0102', emergencyLevel: 'Critical', department: 'ER', queueStatus: 'Waiting', priorityScore: 1.0 },
  ],
}));
assert('Hash Table finds patient P102 in O(1) average time', hashLookup1.found === true && hashLookup1.patient?.name === 'Bob Chen');

// Search by Phone Number
const hashLookupPhone = runModule('hash_table', [], JSON.stringify({
  operation: 'search',
  query: '555-0101',
  patients: [
    { patientId: 'P101', name: 'Alice', age: 30, gender: 'Female', phone: '555-0101', emergencyLevel: 'Normal', department: 'GEN', queueStatus: 'Waiting', priorityScore: 4.0 },
  ],
}));
assert('Hash Table finds patient via phone number secondary key', hashLookupPhone.found === true && hashLookupPhone.patient?.patientId === 'P101');

// Missing patient
const hashMissing = runModule('hash_table', [], JSON.stringify({
  operation: 'search',
  query: 'P9999',
  patients: [{ patientId: 'P101', name: 'Alice', age: 30, gender: 'Female', phone: '555-0101', emergencyLevel: 'Normal', department: 'GEN', queueStatus: 'Waiting', priorityScore: 4.0 }],
}));
assert('Hash Table correctly returns not found for non-existent patient', hashMissing.found === false);

// -----------------------------------------------------------------------------
// TEST SUITE 4: Binary Search Tree (Phase 8)
// -----------------------------------------------------------------------------
console.log('\n▶ [4/5] Testing C++ Binary Search Tree (dsa/bst/bst.exe)...');

const bstSelfTest = runModule('bst', ['--test']);
assert('BST unit tests pass', bstSelfTest.success === true);

const bstRecords = runModule('bst', [], JSON.stringify({
  operation: 'inorder',
  patients: [
    { patientId: 'P105', name: 'Eve', age: 22, gender: 'Female', phone: '555-0105', emergencyLevel: 'Normal', department: 'GEN', queueStatus: 'Waiting', priorityScore: 4.0 },
    { patientId: 'P101', name: 'Alice', age: 30, gender: 'Female', phone: '555-0101', emergencyLevel: 'Normal', department: 'GEN', queueStatus: 'Waiting', priorityScore: 4.0 },
    { patientId: 'P108', name: 'Hank', age: 50, gender: 'Male', phone: '555-0108', emergencyLevel: 'Critical', department: 'ER', queueStatus: 'Waiting', priorityScore: 1.0 },
  ],
}));
assert('BST In-order traversal produces sorted patient list', bstRecords.patients[0]?.patientId === 'P101' && bstRecords.patients[1]?.patientId === 'P105' && bstRecords.patients[2]?.patientId === 'P108');

// -----------------------------------------------------------------------------
// TEST SUITE 5: Graph Navigation (Phase 9)
// -----------------------------------------------------------------------------
console.log('\n▶ [5/5] Testing C++ Graph Navigation (dsa/graph/graph.exe)...');

const graphSelfTest = runModule('graph', ['--test']);
assert('Graph unit tests pass', graphSelfTest.success === true);

const dijkstraRes = runModule('graph', [], JSON.stringify({
  startDepartment: 'ER',
  targetDepartment: 'PED',
  algorithm: 'dijkstra',
}));
assert('Dijkstra finds shortest path from ER to PED', dijkstraRes.reachable === true);
assert('Dijkstra path is optimal distance 125 meters', dijkstraRes.totalDistanceMeters === 125);
assert('Dijkstra hops sequence is [ER, ORTH, PED]', dijkstraRes.path?.join(' -> ') === 'ER -> ORTH -> PED');

const bfsRes = runModule('graph', [], JSON.stringify({
  startDepartment: 'ER',
  targetDepartment: 'PED',
  algorithm: 'bfs',
}));
assert('BFS successfully finds valid transfer path', bfsRes.reachable === true);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`  TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
