#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include "BST.hpp"

std::string jsonEscape(const std::string& s) {
    std::string out;
    for (char c : s) {
        if (c == '"') out += "\\\"";
        else if (c == '\\') out += "\\\\";
        else if (c == '\b') out += "\\b";
        else if (c == '\f') out += "\\f";
        else if (c == '\n') out += "\\n";
        else if (c == '\r') out += "\\r";
        else if (c == '\t') out += "\\t";
        else out += c;
    }
    return out;
}

std::string extractString(const std::string& json, const std::string& key) {
    std::string pattern = "\"" + key + "\"";
    size_t pos = json.find(pattern);
    if (pos == std::string::npos) return "";
    pos = json.find(':', pos);
    if (pos == std::string::npos) return "";
    pos = json.find('"', pos);
    if (pos == std::string::npos) return "";
    size_t end = json.find('"', pos + 1);
    if (end == std::string::npos) return "";
    return json.substr(pos + 1, end - pos - 1);
}

double extractDouble(const std::string& json, const std::string& key, double def = 4.0) {
    std::string pattern = "\"" + key + "\"";
    size_t pos = json.find(pattern);
    if (pos == std::string::npos) return def;
    pos = json.find(':', pos);
    if (pos == std::string::npos) return def;
    while (pos < json.size() && (json[pos] == ':' || json[pos] == ' ' || json[pos] == '\t')) pos++;
    size_t end = pos;
    while (end < json.size() && (isdigit(json[end]) || json[end] == '.' || json[end] == '-')) end++;
    if (end > pos) {
        try {
            return std::stod(json.substr(pos, end - pos));
        } catch (...) {
            return def;
        }
    }
    return def;
}

int extractInt(const std::string& json, const std::string& key, int def = 0) {
    return (int)extractDouble(json, key, (double)def);
}

std::vector<std::string> extractObjectArray(const std::string& json, const std::string& arrayKey) {
    std::vector<std::string> objects;
    std::string pattern = "\"" + arrayKey + "\"";
    size_t pos = json.find(pattern);
    if (pos == std::string::npos) return objects;
    pos = json.find('[', pos);
    if (pos == std::string::npos) return objects;

    size_t i = pos + 1;
    int braceDepth = 0;
    size_t start = 0;
    bool inObj = false;

    while (i < json.size()) {
        char c = json[i];
        if (c == ']' && braceDepth == 0) break;
        if (c == '{') {
            if (braceDepth == 0) {
                start = i;
                inObj = true;
            }
            braceDepth++;
        } else if (c == '}') {
            braceDepth--;
            if (braceDepth == 0 && inObj) {
                objects.push_back(json.substr(start, i - start + 1));
                inObj = false;
            }
        }
        i++;
    }
    return objects;
}

std::string formatBSTNode(const BSTNode& n) {
    std::ostringstream ss;
    ss << "{\"patientId\":\"" << jsonEscape(n.patientId)
       << "\",\"name\":\"" << jsonEscape(n.name)
       << "\",\"age\":" << n.age
       << ",\"gender\":\"" << jsonEscape(n.gender)
       << "\",\"phone\":\"" << jsonEscape(n.phone)
       << "\",\"emergencyLevel\":\"" << jsonEscape(n.emergencyLevel)
       << "\",\"department\":\"" << jsonEscape(n.department)
       << "\",\"queueStatus\":\"" << jsonEscape(n.queueStatus)
       << "\",\"priorityScore\":" << std::fixed << std::setprecision(2) << n.priorityScore
       << "}";
    return ss.str();
}

int runUnitTests() {
    BinarySearchTree bst;
    if (bst.size() != 0) return 1;

    bst.insert("P105", "Eve", 29, "Female", "555-0105", "Normal", "Cardiology", "Waiting", 4.0);
    bst.insert("P102", "Bob", 41, "Male", "555-0102", "Serious", "Emergency", "Waiting", 2.0);
    bst.insert("P108", "Hank", 63, "Male", "555-0108", "Critical", "Neurology", "Waiting", 1.0);
    bst.insert("P101", "Alice", 24, "Female", "555-0101", "Moderate", "Pediatrics", "Waiting", 3.0);
    bst.insert("P103", "Charlie", 35, "Male", "555-0103", "Normal", "General", "Waiting", 4.0);

    if (bst.size() != 5) return 2;

    int comps = 0;
    BSTNode* s = bst.search("P102", comps);
    if (s == nullptr || s->name != "Bob") return 3;

    // Check inorder is sorted
    std::vector<BSTNode> inorder = bst.getInorder();
    if (inorder.size() != 5) return 4;
    for (size_t i = 1; i < inorder.size(); i++) {
        if (inorder[i-1].patientId >= inorder[i].patientId) return 5;
    }

    // Delete node with two children (P102 has P101 and P103)
    bool del = bst.remove("P102");
    if (!del || bst.size() != 4) return 6;
    if (bst.search("P102", comps) != nullptr) return 7;

    return 0;
}

int main(int argc, char* argv[]) {
    if (argc > 1 && std::string(argv[1]) == "--test") {
        int res = runUnitTests();
        if (res == 0) {
            std::cout << "{\"success\":true,\"message\":\"All BST unit tests passed.\",\"complexity\":{\"search\":\"O(log n) avg\",\"insert\":\"O(log n) avg\",\"delete\":\"O(log n) avg\",\"inorder\":\"O(n)\"}}" << std::endl;
            return 0;
        } else {
            std::cout << "{\"success\":false,\"error\":\"BST test failed code " << res << "\"}" << std::endl;
            return 1;
        }
    }

    std::string input;
    std::string line;
    while (std::getline(std::cin, line)) {
        input += line + "\n";
    }

    if (input.empty()) {
        std::cout << "{\"success\":false,\"error\":\"Empty JSON input\"}" << std::endl;
        return 1;
    }

    std::string operation = extractString(input, "operation");
    BinarySearchTree bst;

    std::vector<std::string> patientObjs = extractObjectArray(input, "patients");
    for (const auto& obj : patientObjs) {
        std::string id = extractString(obj, "patientId");
        std::string name = extractString(obj, "name");
        int age = extractInt(obj, "age", 0);
        std::string gender = extractString(obj, "gender");
        std::string phone = extractString(obj, "phone");
        std::string el = extractString(obj, "emergencyLevel");
        std::string dept = extractString(obj, "department");
        std::string qs = extractString(obj, "queueStatus");
        double ps = extractDouble(obj, "priorityScore", 4.0);
        if (!id.empty()) {
            bst.insert(id, name, age, gender, phone, el, dept, qs, ps);
        }
    }

    if (operation == "search") {
        std::string id = extractString(input, "patientId");
        int comps = 0;
        BSTNode* s = bst.search(id, comps);
        std::ostringstream ss;
        ss << "{\"success\":true,\"found\":" << (s != nullptr ? "true" : "false")
           << ",\"comparisons\":" << comps;
        if (s != nullptr) {
            ss << ",\"patient\":" << formatBSTNode(*s);
        } else {
            ss << ",\"patient\":null";
        }
        ss << ",\"treeStats\":{\"size\":" << bst.size() << ",\"height\":" << bst.getHeight() << "}}";
        std::cout << ss.str() << std::endl;
    } else {
        // In-order traversal (sorted by patientId)
        std::vector<BSTNode> inorder = bst.getInorder();
        std::ostringstream ss;
        ss << "{\"success\":true,\"count\":" << inorder.size()
           << ",\"treeStats\":{\"size\":" << bst.size() << ",\"height\":" << bst.getHeight() << "}"
           << ",\"patients\":[";
        for (size_t i = 0; i < inorder.size(); i++) {
            ss << formatBSTNode(inorder[i]);
            if (i + 1 < inorder.size()) ss << ",";
        }
        ss << "]}";
        std::cout << ss.str() << std::endl;
    }

    return 0;
}
