#ifndef PRIORITY_QUEUE_HPP
#define PRIORITY_QUEUE_HPP

#include <string>
#include <vector>
#include <cmath>
#include <iostream>

struct HeapPatient {
    std::string patientId;
    std::string name;
    int age;
    std::string emergencyLevel;
    std::string department;
    double priorityScore; // Lower score = higher medical urgency
    long long arrivalTimestamp;

    HeapPatient() : age(0), priorityScore(4.0), arrivalTimestamp(0) {}

    HeapPatient(std::string id, std::string n, int a, std::string el, std::string dept, double score, long long ts)
        : patientId(id), name(n), age(a), emergencyLevel(el), department(dept), priorityScore(score), arrivalTimestamp(ts) {}
};

/**
 * Manually implemented Min-Heap Priority Queue in C++.
 * NO std::priority_queue used.
 *
 * Ordering Criteria:
 *   1. Primary: priorityScore (ascending, lower score = higher urgency)
 *   2. Secondary (tie-breaker): arrivalTimestamp (ascending, earlier arrival = higher priority)
 *
 * Complexity:
 *   - Insert: O(log n)
 *   - ExtractMin: O(log n)
 *   - PeekMin: O(1)
 *   - UpdatePriority: O(log n) after locating node
 */
class BinaryHeapPriorityQueue {
private:
    std::vector<HeapPatient> heap;

    int parent(int i) const { return (i - 1) / 2; }
    int left(int i) const { return 2 * i + 1; }
    int right(int i) const { return 2 * i + 2; }

    // Returns true if a has STRICTLY higher priority than b
    bool hasHigherPriority(const HeapPatient& a, const HeapPatient& b) const {
        if (std::abs(a.priorityScore - b.priorityScore) > 0.0001) {
            return a.priorityScore < b.priorityScore; // Lower score is more urgent
        }
        // Tie-breaker: earlier arrival timestamp is served first
        return a.arrivalTimestamp < b.arrivalTimestamp;
    }

    void swap(int i, int j) {
        HeapPatient temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
    }

    void heapifyUp(int i) {
        while (i > 0 && hasHigherPriority(heap[i], heap[parent(i)])) {
            swap(i, parent(i));
            i = parent(i);
        }
    }

    void heapifyDown(int i) {
        int smallest = i;
        int l = left(i);
        int r = right(i);

        if (l < (int)heap.size() && hasHigherPriority(heap[l], heap[smallest])) {
            smallest = l;
        }
        if (r < (int)heap.size() && hasHigherPriority(heap[r], heap[smallest])) {
            smallest = r;
        }

        if (smallest != i) {
            swap(i, smallest);
            heapifyDown(smallest);
        }
    }

public:
    BinaryHeapPriorityQueue() {}

    bool isEmpty() const {
        return heap.empty();
    }

    int size() const {
        return (int)heap.size();
    }

    void insert(const HeapPatient& patient) {
        heap.push_back(patient);
        heapifyUp((int)heap.size() - 1);
    }

    HeapPatient peekMin() const {
        if (isEmpty()) return HeapPatient();
        return heap[0];
    }

    bool extractMin(HeapPatient& result) {
        if (isEmpty()) return false;
        result = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        if (!isEmpty()) {
            heapifyDown(0);
        }
        return true;
    }

    bool updatePriority(const std::string& patientId, double newScore) {
        int index = -1;
        for (int i = 0; i < (int)heap.size(); i++) {
            if (heap[i].patientId == patientId) {
                index = i;
                break;
            }
        }
        if (index == -1) return false;

        double oldScore = heap[index].priorityScore;
        heap[index].priorityScore = newScore;

        if (newScore < oldScore) {
            heapifyUp(index);
        } else {
            heapifyDown(index);
        }
        return true;
    }

    bool remove(const std::string& patientId) {
        int index = -1;
        for (int i = 0; i < (int)heap.size(); i++) {
            if (heap[i].patientId == patientId) {
                index = i;
                break;
            }
        }
        if (index == -1) return false;

        // Move target to top, then extract
        heap[index].priorityScore = -999999.0;
        heapifyUp(index);
        HeapPatient dummy;
        extractMin(dummy);
        return true;
    }

    // Returns a copy sorted by priority without destroying the internal heap
    std::vector<HeapPatient> getSortedPatients() const {
        BinaryHeapPriorityQueue copy = *this;
        std::vector<HeapPatient> result;
        HeapPatient p;
        while (copy.extractMin(p)) {
            result.push_back(p);
        }
        return result;
    }

    // Direct heap array view (for heap structure tree visualization)
    const std::vector<HeapPatient>& getHeapArray() const {
        return heap;
    }
};

#endif // PRIORITY_QUEUE_HPP
