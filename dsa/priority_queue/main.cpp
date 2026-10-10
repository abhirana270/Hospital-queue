#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include "PriorityQueue.hpp"

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

std::string formatPatientJson(const HeapPatient& p, int position = 0) {
    std::ostringstream ss;
    ss << "{\"patientId\":\"" << jsonEscape(p.patientId)
       << "\",\"name\":\"" << jsonEscape(p.name)
       << "\",\"age\":" << p.age
       << ",\"emergencyLevel\":\"" << jsonEscape(p.emergencyLevel)
       << "\",\"department\":\"" << jsonEscape(p.department)
       << "\",\"priorityScore\":" << std::fixed << std::setprecision(2) << p.priorityScore
       << ",\"arrivalTimestamp\":" << p.arrivalTimestamp;
    if (position > 0) {
        ss << ",\"position\":" << position;
    }
    ss << "}";
    return ss.str();
}

std::string heapToJson(const BinaryHeapPriorityQueue& pq) {
    std::vector<HeapPatient> sortedList = pq.getSortedPatients();
    const std::vector<HeapPatient>& heapArr = pq.getHeapArray();

    std::ostringstream ss;
    ss << "{\"success\":true,\"queueLength\":" << pq.size()
       << ",\"patients\":[";
    for (size_t i = 0; i < sortedList.size(); i++) {
        ss << formatPatientJson(sortedList[i], (int)(i + 1));
        if (i + 1 < sortedList.size()) ss << ",";
    }
    ss << "],\"heapArray\":[";
    for (size_t i = 0; i < heapArr.size(); i++) {
        ss << formatPatientJson(heapArr[i], (int)(i + 1));
        if (i + 1 < heapArr.size()) ss << ",";
    }
    ss << "]}";
    return ss.str();
}

int runUnitTests() {
    BinaryHeapPriorityQueue pq;
    if (!pq.isEmpty()) return 1;

    // Insert 4 patients: Normal (4.0), Critical (1.0), Serious (2.0), Moderate (3.0)
    pq.insert(HeapPatient("P4", "Normal", 40, "Normal", "Gen", 4.0, 1000));
    pq.insert(HeapPatient("P1", "Critical", 50, "Critical", "ER", 1.0, 1010));
    pq.insert(HeapPatient("P2", "Serious", 60, "Serious", "ER", 2.0, 1020));
    pq.insert(HeapPatient("P3", "Moderate", 30, "Moderate", "Gen", 3.0, 1030));

    if (pq.size() != 4) return 2;

    // PeekMin should be P1 (score 1.0)
    if (pq.peekMin().patientId != "P1") return 3;

    // ExtractMin should give P1 then P2 then P3 then P4
    HeapPatient extracted;
    pq.extractMin(extracted);
    if (extracted.patientId != "P1") return 4;

    pq.extractMin(extracted);
    if (extracted.patientId != "P2") return 5;

    // Test tie-breaking: insert two with equal priority score 1.5, different timestamps
    pq.insert(HeapPatient("T_EARLY", "Early", 25, "Critical", "ER", 1.5, 500));
    pq.insert(HeapPatient("T_LATE", "Late", 25, "Critical", "ER", 1.5, 600));

    pq.extractMin(extracted);
    if (extracted.patientId != "T_EARLY") return 6; // earlier timestamp must be served first

    // Test priority update: change P4 from 4.0 to 0.5 (most urgent)
    pq.updatePriority("P4", 0.5);
    if (pq.peekMin().patientId != "P4") return 7;

    return 0;
}

int main(int argc, char* argv[]) {
    if (argc > 1 && std::string(argv[1]) == "--test") {
        int res = runUnitTests();
        if (res == 0) {
            std::cout << "{\"success\":true,\"message\":\"All BinaryHeapPriorityQueue unit tests passed.\",\"complexity\":{\"insert\":\"O(log n)\",\"extractMin\":\"O(log n)\",\"peekMin\":\"O(1)\"}}" << std::endl;
            return 0;
        } else {
            std::cout << "{\"success\":false,\"error\":\"Heap test failed with code " << res << "\"}" << std::endl;
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
    BinaryHeapPriorityQueue pq;

    std::vector<std::string> patientObjs = extractObjectArray(input, "patients");
    for (const auto& obj : patientObjs) {
        std::string id = extractString(obj, "patientId");
        std::string name = extractString(obj, "name");
        int age = extractInt(obj, "age", 0);
        std::string level = extractString(obj, "emergencyLevel");
        std::string dept = extractString(obj, "department");
        double score = extractDouble(obj, "priorityScore", 4.0);
        long long ts = extractLong(obj, "arrivalTimestamp", 0);
        if (!id.empty()) {
            pq.insert(HeapPatient(id, name, age, level, dept, score, ts));
        }
    }

    if (operation == "insert") {
        std::string id = extractString(input, "patientId");
        std::string name = extractString(input, "name");
        int age = extractInt(input, "age", 0);
        std::string level = extractString(input, "emergencyLevel");
        std::string dept = extractString(input, "department");
        double score = extractDouble(input, "priorityScore", 4.0);
        long long ts = extractLong(input, "arrivalTimestamp", 0);
        pq.insert(HeapPatient(id, name, age, level, dept, score, ts));
        std::cout << heapToJson(pq) << std::endl;
    } else if (operation == "extract_min") {
        HeapPatient top;
        if (!pq.extractMin(top)) {
            std::cout << "{\"success\":true,\"extracted\":null,\"queueLength\":0,\"patients\":[]}" << std::endl;
        } else {
            std::string pqJson = heapToJson(pq);
            std::ostringstream ss;
            ss << "{\"success\":true,\"extracted\":" << formatPatientJson(top, 1)
               << ",\"queue\":" << pqJson << "}";
            std::cout << ss.str() << std::endl;
        }
    } else if (operation == "peek_min") {
        if (pq.isEmpty()) {
            std::cout << "{\"success\":true,\"patient\":null}" << std::endl;
        } else {
            std::cout << "{\"success\":true,\"patient\":" << formatPatientJson(pq.peekMin(), 1) << "}" << std::endl;
        }
    } else if (operation == "update_priority") {
        std::string id = extractString(input, "patientId");
        double newScore = extractDouble(input, "newPriorityScore", 2.0);
        bool updated = pq.updatePriority(id, newScore);
        std::string pqJson = heapToJson(pq);
        std::cout << "{\"success\":true,\"updated\":" << (updated ? "true" : "false") << ",\"queue\":" << pqJson << "}" << std::endl;
    } else if (operation == "remove") {
        std::string id = extractString(input, "patientId");
        bool removed = pq.remove(id);
        std::string pqJson = heapToJson(pq);
        std::cout << "{\"success\":true,\"removed\":" << (removed ? "true" : "false") << ",\"queue\":" << pqJson << "}" << std::endl;
    } else {
        std::cout << heapToJson(pq) << std::endl;
    }

    return 0;
}
