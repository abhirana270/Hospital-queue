#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include "HashTable.hpp"

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

std::string formatRecord(const HashPatientRecord* r, int comparisons = 0) {
    if (r == nullptr) return "null";
    std::ostringstream ss;
    ss << "{\"patientId\":\"" << jsonEscape(r->patientId)
       << "\",\"name\":\"" << jsonEscape(r->name)
       << "\",\"age\":" << r->age
       << ",\"gender\":\"" << jsonEscape(r->gender)
       << "\",\"phone\":\"" << jsonEscape(r->phone)
       << "\",\"emergencyLevel\":\"" << jsonEscape(r->emergencyLevel)
       << "\",\"department\":\"" << jsonEscape(r->department)
       << "\",\"queueStatus\":\"" << jsonEscape(r->queueStatus)
       << "\",\"priorityScore\":" << std::fixed << std::setprecision(2) << r->priorityScore
       << ",\"comparisons\":" << comparisons
       << "}";
    return ss.str();
}

int runUnitTests() {
    HashTable ht(17);
    ht.insert("P101", "Alice", 28, "Female", "555-0101", "Normal", "Cardiology", "Waiting", 4.0);
    ht.insert("P102", "Bob", 34, "Male", "555-0102", "Serious", "Neurology", "Waiting", 2.0);
    ht.insert("P103", "Charlie", 52, "Male", "555-0103", "Critical", "Emergency", "Waiting", 1.0);

    if (ht.size() != 3) return 1;

    int comps = 0;
    HashPatientRecord* r = ht.searchById("P102", comps);
    if (r == nullptr || r->name != "Bob") return 2;

    r = ht.searchByPhone("555-0101", comps);
    if (r == nullptr || r->patientId != "P101") return 3;

    // Missing search
    r = ht.searchById("P999", comps);
    if (r != nullptr) return 4;

    // Remove
    bool rem = ht.remove("P102");
    if (!rem || ht.size() != 2) return 5;

    r = ht.searchById("P102", comps);
    if (r != nullptr) return 6;

    return 0;
}

int main(int argc, char* argv[]) {
    if (argc > 1 && std::string(argv[1]) == "--test") {
        int res = runUnitTests();
        if (res == 0) {
            std::cout << "{\"success\":true,\"message\":\"All HashTable unit tests passed.\",\"complexity\":{\"search\":\"O(1) average\",\"insert\":\"O(1)\",\"delete\":\"O(1)\"}}" << std::endl;
            return 0;
        } else {
            std::cout << "{\"success\":false,\"error\":\"HashTable test failed code " << res << "\"}" << std::endl;
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
    HashTable ht(47);

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
            ht.insert(id, name, age, gender, phone, el, dept, qs, ps);
        }
    }

    if (operation == "search") {
        std::string query = extractString(input, "query");
        int comps = 0;
        HashPatientRecord* r = ht.searchById(query, comps);
        std::string matchMethod = "patientId";
        if (r == nullptr) {
            r = ht.searchByPhone(query, comps);
            matchMethod = "phone";
        }

        std::ostringstream ss;
        ss << "{\"success\":true,\"found\":" << (r != nullptr ? "true" : "false")
           << ",\"matchMethod\":\"" << (r != nullptr ? matchMethod : "none") << "\""
           << ",\"comparisons\":" << comps
           << ",\"patient\":" << formatRecord(r, comps)
           << ",\"stats\":{\"size\":" << ht.size()
           << ",\"capacity\":" << ht.getCapacity()
           << ",\"collisions\":" << ht.getCollisions()
           << ",\"loadFactor\":" << std::fixed << std::setprecision(2) << ht.getLoadFactor()
           << "}}";
        std::cout << ss.str() << std::endl;
    } else {
        std::ostringstream ss;
        ss << "{\"success\":true,\"stats\":{\"size\":" << ht.size()
           << ",\"capacity\":" << ht.getCapacity()
           << ",\"collisions\":" << ht.getCollisions()
           << ",\"loadFactor\":" << std::fixed << std::setprecision(2) << ht.getLoadFactor()
           << "}}";
        std::cout << ss.str() << std::endl;
    }

    return 0;
}
