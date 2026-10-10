#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include "Queue.hpp"

// Utility to escape string for JSON
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

// Simple JSON extraction helper
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

long long extractLong(const std::string& json, const std::string& key, long long def = 0) {
    std::string pattern = "\"" + key + "\"";
    size_t pos = json.find(pattern);
    if (pos == std::string::npos) return def;
    pos = json.find(':', pos);
    if (pos == std::string::npos) return def;
    while (pos < json.size() && (json[pos] == ':' || json[pos] == ' ' || json[pos] == '\t')) pos++;
    size_t end = pos;
    while (end < json.size() && (isdigit(json[end]) || json[end] == '-')) end++;
    if (end > pos) {
        try {
            return std::stoll(json.substr(pos, end - pos));
        } catch (...) {
            return def;
        }
    }
    return def;
}

int extractInt(const std::string& json, const std::string& key, int def = 0) {
    return (int)extractLong(json, key, def);
}

// Parses JSON array of patient objects
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

std::string queueToJson(const LinkedListQueue& queue) {
    std::vector<QueueNode> nodes = queue.getAll();
    std::ostringstream ss;
    ss << "{\"success\":true,\"queueLength\":" << queue.size() << ",\"visualization\":\"";
    
    for (size_t i = 0; i < nodes.size(); i++) {
        ss << nodes[i].patientId;
        if (i + 1 < nodes.size()) ss << " \u2192 ";
    }
    ss << "\",\"patients\":[";
    for (size_t i = 0; i < nodes.size(); i++) {
        const auto& n = nodes[i];
        ss << "{\"patientId\":\"" << jsonEscape(n.patientId)
           << "\",\"name\":\"" << jsonEscape(n.name)
           << "\",\"age\":" << n.age
           << ",\"emergencyLevel\":\"" << jsonEscape(n.emergencyLevel)
           << "\",\"department\":\"" << jsonEscape(n.department)
           << "\",\"arrivalTimestamp\":" << n.arrivalTimestamp
           << ",\"position\":" << (i + 1) << "}";
        if (i + 1 < nodes.size()) ss << ",";
    }
    ss << "]}";
    return ss.str();
}

int runTests() {
    LinkedListQueue q;
    if (!q.isEmpty()) return 1;
    q.enqueue("P101", "Alice", 30, "Normal", "General", 1000);
    q.enqueue("P102", "Bob", 45, "Normal", "General", 1010);
    q.enqueue("P103", "Charlie", 60, "Normal", "General", 1020);
    if (q.size() != 3) return 2;
    if (q.peek()->patientId != "P101") return 3;
    
    QueueNode* d1 = q.dequeue();
    if (d1 == nullptr || d1->patientId != "P101") return 4;
    delete d1;

    if (q.size() != 2) return 5;
    if (q.peek()->patientId != "P102") return 6;

    // Test remove by ID
    q.removeById("P103");
    if (q.size() != 1) return 7;

    return 0; // Success
}

int main(int argc, char* argv[]) {
    // If run with --test flag
    if (argc > 1 && std::string(argv[1]) == "--test") {
        int res = runTests();
        if (res == 0) {
            std::cout << "{\"success\":true,\"message\":\"All LinkedListQueue unit tests passed.\",\"complexity\":{\"enqueue\":\"O(1)\",\"dequeue\":\"O(1)\",\"peek\":\"O(1)\"}}" << std::endl;
            return 0;
        } else {
            std::cout << "{\"success\":false,\"error\":\"Queue test failed with code " << res << "\"}" << std::endl;
            return 1;
        }
    }

    // Read full JSON payload from standard input
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
    LinkedListQueue queue;

    // Populate existing queue if passed
    std::vector<std::string> patientObjs = extractObjectArray(input, "patients");
    for (const auto& obj : patientObjs) {
        std::string id = extractString(obj, "patientId");
        std::string name = extractString(obj, "name");
        int age = extractInt(obj, "age", 0);
        std::string level = extractString(obj, "emergencyLevel");
        std::string dept = extractString(obj, "department");
        long long ts = extractLong(obj, "arrivalTimestamp", 0);
        if (!id.empty()) {
            queue.enqueue(id, name, age, level, dept, ts);
        }
    }

    if (operation == "enqueue") {
        std::string id = extractString(input, "patientId");
        std::string name = extractString(input, "name");
        int age = extractInt(input, "age", 0);
        std::string level = extractString(input, "emergencyLevel");
        std::string dept = extractString(input, "department");
        long long ts = extractLong(input, "arrivalTimestamp", 0);
        queue.enqueue(id, name, age, level, dept, ts);
        std::cout << queueToJson(queue) << std::endl;
    } else if (operation == "dequeue") {
        QueueNode* dequeued = queue.dequeue();
        if (dequeued == nullptr) {
            std::cout << "{\"success\":true,\"dequeued\":null,\"queueLength\":0,\"patients\":[]}" << std::endl;
        } else {
            std::string qJson = queueToJson(queue);
            std::ostringstream ss;
            ss << "{\"success\":true,\"dequeued\":{\"patientId\":\"" << jsonEscape(dequeued->patientId)
               << "\",\"name\":\"" << jsonEscape(dequeued->name)
               << "\",\"age\":" << dequeued->age
               << ",\"emergencyLevel\":\"" << jsonEscape(dequeued->emergencyLevel)
               << "\",\"department\":\"" << jsonEscape(dequeued->department)
               << "\",\"arrivalTimestamp\":" << dequeued->arrivalTimestamp
               << "},\"queue\":" << qJson << "}";
            delete dequeued;
            std::cout << ss.str() << std::endl;
        }
    } else if (operation == "remove") {
        std::string id = extractString(input, "patientId");
        bool removed = queue.removeById(id);
        std::string qJson = queueToJson(queue);
        std::cout << "{\"success\":true,\"removed\":" << (removed ? "true" : "false") << ",\"queue\":" << qJson << "}" << std::endl;
    } else if (operation == "peek") {
        QueueNode* front = queue.peek();
        if (front == nullptr) {
            std::cout << "{\"success\":true,\"patient\":null}" << std::endl;
        } else {
            std::cout << "{\"success\":true,\"patient\":{\"patientId\":\"" << jsonEscape(front->patientId)
                      << "\",\"name\":\"" << jsonEscape(front->name)
                      << "\"}}" << std::endl;
        }
    } else {
        // Default: display/format
        std::cout << queueToJson(queue) << std::endl;
    }

    return 0;
}
