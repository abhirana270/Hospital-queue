#ifndef QUEUE_HPP
#define QUEUE_HPP

#include <string>
#include <sstream>
#include <vector>

/**
 * Node for manual singly linked list queue.
 */
struct QueueNode {
    std::string patientId;
    std::string name;
    int age;
    std::string emergencyLevel;
    std::string department;
    long long arrivalTimestamp;
    QueueNode* next;

    QueueNode(std::string id, std::string n, int a, std::string el, std::string dept, long long ts)
        : patientId(id), name(n), age(a), emergencyLevel(el), department(dept), arrivalTimestamp(ts), next(nullptr) {}
};

/**
 * Manually implemented FIFO Queue using a Singly Linked List with Head and Tail pointers.
 * No STL queue or list used.
 * Complexity:
 *   - Enqueue: O(1)
 *   - Dequeue: O(1)
 *   - Peek: O(1)
 *   - IsEmpty: O(1)
 *   - Size: O(1)
 */
class LinkedListQueue {
private:
    QueueNode* head;
    QueueNode* tail;
    int count;

public:
    LinkedListQueue() : head(nullptr), tail(nullptr), count(0) {}

    ~LinkedListQueue() {
        clear();
    }

    bool isEmpty() const {
        return head == nullptr;
    }

    int size() const {
        return count;
    }

    void enqueue(const std::string& id, const std::string& name, int age,
                 const std::string& emergencyLevel, const std::string& department, long long arrivalTimestamp) {
        QueueNode* newNode = new QueueNode(id, name, age, emergencyLevel, department, arrivalTimestamp);
        if (isEmpty()) {
            head = tail = newNode;
        } else {
            tail->next = newNode;
            tail = newNode;
        }
        count++;
    }

    QueueNode* dequeue() {
        if (isEmpty()) {
            return nullptr;
        }
        QueueNode* temp = head;
        head = head->next;
        if (head == nullptr) {
            tail = nullptr;
        }
        count--;
        temp->next = nullptr;
        return temp;
    }

    QueueNode* peek() const {
        return head;
    }

    bool removeById(const std::string& id) {
        if (isEmpty()) return false;
        if (head->patientId == id) {
            QueueNode* temp = dequeue();
            delete temp;
            return true;
        }
        QueueNode* curr = head;
        while (curr->next != nullptr && curr->next->patientId != id) {
            curr = curr->next;
        }
        if (curr->next != nullptr) {
            QueueNode* target = curr->next;
            curr->next = target->next;
            if (target == tail) {
                tail = curr;
            }
            delete target;
            count--;
            return true;
        }
        return false;
    }

    std::vector<QueueNode> getAll() const {
        std::vector<QueueNode> nodes;
        QueueNode* curr = head;
        while (curr != nullptr) {
            nodes.push_back(*curr);
            curr = curr->next;
        }
        return nodes;
    }

    void clear() {
        while (!isEmpty()) {
            QueueNode* node = dequeue();
            delete node;
        }
    }
};

#endif // QUEUE_HPP
