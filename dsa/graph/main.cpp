#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include "Graph.hpp"

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

std::string navigationToJson(const NavigationResult& res) {
    std::ostringstream ss;
    ss << "{\"success\":true,\"reachable\":" << (res.reachable ? "true" : "false")
       << ",\"algorithm\":\"" << jsonEscape(res.algorithmUsed) << "\""
       << ",\"totalDistanceMeters\":" << res.totalDistanceMeters
       << ",\"totalTimeMinutes\":" << res.totalTimeMinutes
       << ",\"path\":[";
    for (size_t i = 0; i < res.path.size(); i++) {
        ss << "\"" << jsonEscape(res.path[i]) << "\"";
        if (i + 1 < res.path.size()) ss << ",";
    }
    ss << "],\"instructions\":[";
    for (size_t i = 0; i < res.instructions.size(); i++) {
        ss << "\"" << jsonEscape(res.instructions[i]) << "\"";
        if (i + 1 < res.instructions.size()) ss << ",";
    }
    ss << "]}";
    return ss.str();
}

int runUnitTests() {
    HospitalGraph g;
    // Test Dijkstra ER -> PED
    NavigationResult dRes = g.dijkstra("ER", "PED");
    if (!dRes.reachable) return 1;
    // Expected path ER -> ORTH (70m) -> PED (55m) = 125m, or via other paths.
    // 70 + 55 = 125m, which is strictly shorter than ER -> RAD -> GEN -> CARD -> PED (40+90+60+110 = 300m)
    if (dRes.totalDistanceMeters != 125) return 2;
    if (dRes.path.size() != 3) return 3; // ER, ORTH, PED

    // Test BFS
    NavigationResult bRes = g.bfs("ER", "PED");
    if (!bRes.reachable) return 4;

    return 0;
}

int main(int argc, char* argv[]) {
    if (argc > 1 && std::string(argv[1]) == "--test") {
        int res = runUnitTests();
        if (res == 0) {
            std::cout << "{\"success\":true,\"message\":\"All Graph navigation unit tests passed.\",\"complexity\":{\"dijkstra\":\"O((V + E) log V)\",\"bfs\":\"O(V + E)\"}}" << std::endl;
            return 0;
        } else {
            std::cout << "{\"success\":false,\"error\":\"Graph test failed code " << res << "\"}" << std::endl;
            return 1;
        }
    }

    std::string input;
    std::string line;
    while (std::getline(std::cin, line)) {
        input += line + "\n";
    }

    HospitalGraph g;

    if (input.empty()) {
        // Return hospital nodes
        std::ostringstream ss;
        ss << "{\"success\":true,\"departments\":[";
        const auto& depts = g.getDepartments();
        for (size_t i = 0; i < depts.size(); i++) {
            ss << "{\"code\":\"" << jsonEscape(depts[i].code)
               << "\",\"name\":\"" << jsonEscape(depts[i].name)
               << "\",\"floor\":\"" << jsonEscape(depts[i].floor)
               << "\",\"building\":\"" << jsonEscape(depts[i].building) << "\"}";
            if (i + 1 < depts.size()) ss << ",";
        }
        ss << "]}";
        std::cout << ss.str() << std::endl;
        return 0;
    }

    std::string startDept = extractString(input, "startDepartment");
    std::string targetDept = extractString(input, "targetDepartment");
    std::string algo = extractString(input, "algorithm");

    if (startDept.empty()) startDept = "ER";
    if (targetDept.empty()) targetDept = "GEN";

    NavigationResult res;
    if (algo == "bfs") {
        res = g.bfs(startDept, targetDept);
    } else {
        res = g.dijkstra(startDept, targetDept);
    }

    std::cout << navigationToJson(res) << std::endl;
    return 0;
}
