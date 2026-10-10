#ifndef BST_HPP
#define BST_HPP

#include <string>
#include <vector>
#include <algorithm>

struct BSTNode {
    std::string patientId;
    std::string name;
    int age;
    std::string gender;
    std::string phone;
    std::string emergencyLevel;
    std::string department;
    std::string queueStatus;
    double priorityScore;
    BSTNode* left;
    BSTNode* right;

    BSTNode(std::string id, std::string n, int a, std::string g, std::string p,
            std::string el, std::string dept, std::string qs, double ps)
        : patientId(id), name(n), age(a), gender(g), phone(p), emergencyLevel(el),
          department(dept), queueStatus(qs), priorityScore(ps), left(nullptr), right(nullptr) {}
};

/**
 * Manually implemented Binary Search Tree (BST) for Patient Records.
 * NO std::map or STL tree structures used.
 *
 * Key: patientId
 *
 * Complexity:
 *   - Search: O(log n) average, O(n) worst-case
 *   - Insert: O(log n) average
 *   - Delete: O(log n) average
 *   - Inorder Traversal: O(n) (yields sorted patient records)
 */
class BinarySearchTree {
private:
    BSTNode* root;
    int nodeCount;

    BSTNode* insertHelper(BSTNode* node, const std::string& id, const std::string& name,
                         int age, const std::string& gender, const std::string& phone,
                         const std::string& el, const std::string& dept,
                         const std::string& qs, double ps) {
        if (node == nullptr) {
            nodeCount++;
            return new BSTNode(id, name, age, gender, phone, el, dept, qs, ps);
        }
        if (id < node->patientId) {
            node->left = insertHelper(node->left, id, name, age, gender, phone, el, dept, qs, ps);
        } else if (id > node->patientId) {
            node->right = insertHelper(node->right, id, name, age, gender, phone, el, dept, qs, ps);
        } else {
            // Update existing
            node->name = name;
            node->age = age;
            node->gender = gender;
            node->phone = phone;
            node->emergencyLevel = el;
            node->department = dept;
            node->queueStatus = qs;
            node->priorityScore = ps;
        }
        return node;
    }

    BSTNode* findMin(BSTNode* node) const {
        while (node && node->left != nullptr) {
            node = node->left;
        }
        return node;
    }

    BSTNode* deleteHelper(BSTNode* node, const std::string& id, bool& deleted) {
        if (node == nullptr) return nullptr;

        if (id < node->patientId) {
            node->left = deleteHelper(node->left, id, deleted);
        } else if (id > node->patientId) {
            node->right = deleteHelper(node->right, id, deleted);
        } else {
            deleted = true;
            nodeCount--;
            // Case 1: Leaf or single child
            if (node->left == nullptr) {
                BSTNode* temp = node->right;
                delete node;
                return temp;
            } else if (node->right == nullptr) {
                BSTNode* temp = node->left;
                delete node;
                return temp;
            }
            // Case 2: Two children -> find in-order successor (min in right subtree)
            BSTNode* successor = findMin(node->right);
            node->patientId = successor->patientId;
            node->name = successor->name;
            node->age = successor->age;
            node->gender = successor->gender;
            node->phone = successor->phone;
            node->emergencyLevel = successor->emergencyLevel;
            node->department = successor->department;
            node->queueStatus = successor->queueStatus;
            node->priorityScore = successor->priorityScore;
            node->right = deleteHelper(node->right, successor->patientId, deleted);
            nodeCount++; // offset decrement since helper will decrement
        }
        return node;
    }

    void inorderHelper(BSTNode* node, std::vector<BSTNode>& list) const {
        if (node == nullptr) return;
        inorderHelper(node->left, list);
        list.push_back(*node);
        inorderHelper(node->right, list);
    }

    int heightHelper(BSTNode* node) const {
        if (node == nullptr) return 0;
        return 1 + std::max(heightHelper(node->left), heightHelper(node->right));
    }

    void destroyHelper(BSTNode* node) {
        if (node == nullptr) return;
        destroyHelper(node->left);
        destroyHelper(node->right);
        delete node;
    }

public:
    BinarySearchTree() : root(nullptr), nodeCount(0) {}

    ~BinarySearchTree() {
        destroyHelper(root);
    }

    void insert(const std::string& id, const std::string& name, int age, const std::string& gender,
                const std::string& phone, const std::string& el, const std::string& dept,
                const std::string& qs, double ps) {
        root = insertHelper(root, id, name, age, gender, phone, el, dept, qs, ps);
    }

    BSTNode* search(const std::string& id, int& comparisons) const {
        comparisons = 0;
        BSTNode* curr = root;
        while (curr != nullptr) {
            comparisons++;
            if (id == curr->patientId) {
                return curr;
            } else if (id < curr->patientId) {
                curr = curr->left;
            } else {
                curr = curr->right;
            }
        }
        return nullptr;
    }

    bool remove(const std::string& id) {
        bool deleted = false;
        root = deleteHelper(root, id, deleted);
        return deleted;
    }

    std::vector<BSTNode> getInorder() const {
        std::vector<BSTNode> list;
        inorderHelper(root, list);
        return list;
    }

    int size() const { return nodeCount; }
    int getHeight() const { return heightHelper(root); }
};

#endif // BST_HPP
