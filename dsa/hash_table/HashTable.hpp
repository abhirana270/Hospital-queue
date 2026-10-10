#ifndef HASH_TABLE_HPP
#define HASH_TABLE_HPP

#include <string>
#include <vector>
#include <sstream>

struct HashPatientRecord {
    std::string patientId;
    std::string name;
    int age;
    std::string gender;
    std::string phone;
    std::string emergencyLevel;
    std::string department;
    std::string queueStatus;
    double priorityScore;
    HashPatientRecord* next;

    HashPatientRecord(std::string id, std::string n, int a, std::string g, std::string p,
                      std::string el, std::string dept, std::string qs, double ps)
        : patientId(id), name(n), age(a), gender(g), phone(p), emergencyLevel(el),
          department(dept), queueStatus(qs), priorityScore(ps), next(nullptr) {}
};

/**
 * Manually implemented Hash Table using Separate Chaining for collision resolution.
 * NO std::unordered_map or STL hash tables used.
 *
 * Hash Function:
 *   djb2 rolling polynomial hash algorithm
 *
 * Complexity:
 *   - Search: O(1) average, O(n) worst-case
 *   - Insert: O(1) average
 *   - Delete: O(1) average
 *   - Space: O(B + N) where B is bucket count and N is total entries
 */
class HashTable {
private:
    static const int DEFAULT_CAPACITY = 37; // Prime number to minimize clustering
    int capacity;
    int elementCount;
    int collisionCount;
    std::vector<HashPatientRecord*> table;

    // Custom djb2 hash function
    unsigned long hashFunction(const std::string& key) const {
        unsigned long hash = 5381;
        for (char c : key) {
            hash = ((hash << 5) + hash) + (unsigned char)c; // hash * 33 + c
        }
        return hash % capacity;
    }

public:
    HashTable(int cap = DEFAULT_CAPACITY)
        : capacity(cap), elementCount(0), collisionCount(0) {
        table.resize(capacity, nullptr);
    }

    ~HashTable() {
        clear();
    }

    void insert(const std::string& id, const std::string& name, int age, const std::string& gender,
                const std::string& phone, const std::string& emergencyLevel,
                const std::string& department, const std::string& queueStatus, double priorityScore) {
        // Search if already exists to update
        unsigned long bucket = hashFunction(id);
        HashPatientRecord* curr = table[bucket];
        while (curr != nullptr) {
            if (curr->patientId == id) {
                // Update record
                curr->name = name;
                curr->age = age;
                curr->gender = gender;
                curr->phone = phone;
                curr->emergencyLevel = emergencyLevel;
                curr->department = department;
                curr->queueStatus = queueStatus;
                curr->priorityScore = priorityScore;
                return;
            }
            curr = curr->next;
        }

        // Insert new node at front of bucket list (Separate Chaining)
        HashPatientRecord* newNode = new HashPatientRecord(id, name, age, gender, phone, emergencyLevel, department, queueStatus, priorityScore);
        if (table[bucket] != nullptr) {
            collisionCount++;
        }
        newNode->next = table[bucket];
        table[bucket] = newNode;
        elementCount++;
    }

    HashPatientRecord* searchById(const std::string& id, int& comparisons) const {
        comparisons = 0;
        unsigned long bucket = hashFunction(id);
        HashPatientRecord* curr = table[bucket];
        while (curr != nullptr) {
            comparisons++;
            if (curr->patientId == id) {
                return curr;
            }
            curr = curr->next;
        }
        return nullptr;
    }

    HashPatientRecord* searchByPhone(const std::string& phone, int& comparisons) const {
        comparisons = 0;
        for (int i = 0; i < capacity; i++) {
            HashPatientRecord* curr = table[i];
            while (curr != nullptr) {
                comparisons++;
                if (curr->phone == phone) {
                    return curr;
                }
                curr = curr->next;
            }
        }
        return nullptr;
    }

    bool remove(const std::string& id) {
        unsigned long bucket = hashFunction(id);
        HashPatientRecord* curr = table[bucket];
        HashPatientRecord* prev = nullptr;

        while (curr != nullptr) {
            if (curr->patientId == id) {
                if (prev == nullptr) {
                    table[bucket] = curr->next;
                } else {
                    prev->next = curr->next;
                }
                delete curr;
                elementCount--;
                return true;
            }
            prev = curr;
            curr = curr->next;
        }
        return false;
    }

    int size() const { return elementCount; }
    int getCapacity() const { return capacity; }
    int getCollisions() const { return collisionCount; }
    double getLoadFactor() const { return (double)elementCount / capacity; }

    void clear() {
        for (int i = 0; i < capacity; i++) {
            HashPatientRecord* curr = table[i];
            while (curr != nullptr) {
                HashPatientRecord* temp = curr;
                curr = curr->next;
                delete temp;
            }
            table[i] = nullptr;
        }
        elementCount = 0;
        collisionCount = 0;
    }
};

#endif // HASH_TABLE_HPP
