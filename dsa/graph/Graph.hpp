#ifndef GRAPH_HPP
#define GRAPH_HPP

#include <string>
#include <vector>
#include <queue>
#include <algorithm>
#include <sstream>

struct Edge {
    int to;
    int distance; // meters
    int timeMinutes;
    std::string directionHint;

    Edge(int t, int d, int tm, std::string dh = "")
        : to(t), distance(d), timeMinutes(tm), directionHint(dh) {}
};

struct DepartmentNode {
    std::string code;
    std::string name;
    std::string floor;
    std::string building;

    DepartmentNode(std::string c = "", std::string n = "", std::string f = "", std::string b = "")
        : code(c), name(n), floor(f), building(b) {}
};

struct NavigationResult {
    bool reachable;
    std::vector<std::string> path; // Sequence of department codes
    int totalDistanceMeters;
    int totalTimeMinutes;
    std::vector<std::string> instructions;
    std::string algorithmUsed;

    NavigationResult() : reachable(false), totalDistanceMeters(0), totalTimeMinutes(0), algorithmUsed("Dijkstra") {}
};

/**
 * Manually implemented Hospital Navigation Graph with Adjacency List.
 * Algorithms:
 *   - Dijkstra's Algorithm: Weighted shortest path (optimal distance/time)
 *   - BFS: Unweighted fewest-turn path
 *   - DFS: Connectivity verification and exploratory path
 *
 * Complexity:
 *   - Dijkstra: O((V + E) log V)
 *   - BFS: O(V + E)
 *   - DFS: O(V + E)
 */
class HospitalGraph {
private:
    std::vector<DepartmentNode> departments;
    std::vector<std::vector<Edge>> adjList;

    int getIndexByCode(const std::string& code) const {
        for (size_t i = 0; i < departments.size(); i++) {
            if (departments[i].code == code) return (int)i;
        }
        return -1;
    }

public:
    HospitalGraph() {
        // Initialize default standard hospital layout
        addDepartment("ER", "Emergency Department", "Ground Floor", "Building A");
        addDepartment("RAD", "Radiology & Imaging", "Ground Floor (East Wing)", "Building A");
        addDepartment("GEN", "General Medicine OPD", "Ground Floor", "Building B");
        addDepartment("CARD", "Cardiology Unit", "2nd Floor", "Building B");
        addDepartment("NEUR", "Neurology Clinic", "3rd Floor", "Building B");
        addDepartment("ORTH", "Orthopedics & Trauma", "Ground Floor", "Building C");
        addDepartment("PED", "Pediatrics Care", "2nd Floor", "Building C");

        // Add standard hospital corridor edges (distance in meters, walking time minutes)
        // ER is connected to RAD (fast corridor, 40m, 1 min)
        addEdge("ER", "RAD", 40, 1, "Follow Red Corridor East");
        // ER is connected to ORTH (trauma corridor, 70m, 2 min)
        addEdge("ER", "ORTH", 70, 2, "Cross Linkway B to Building C");
        // RAD is connected to GEN (central bridge, 90m, 2 min)
        addEdge("RAD", "GEN", 90, 2, "Pass Central Hall to Building B");
        // GEN is connected to CARD (elevator/stairs, 60m, 2 min)
        addEdge("GEN", "CARD", 60, 2, "Take Elevator 2 to 2nd Floor");
        // CARD is connected to NEUR (stairs/elevator, 50m, 1 min)
        addEdge("CARD", "NEUR", 50, 1, "Take Stairs to 3rd Floor");
        // GEN is connected to ORTH (ground breezeway, 80m, 2 min)
        addEdge("GEN", "ORTH", 80, 2, "Cross Courtyard Breezeway");
        // ORTH is connected to PED (elevator/stairs, 55m, 1 min)
        addEdge("ORTH", "PED", 55, 1, "Take Elevator 4 to 2nd Floor");
        // CARD is connected to PED (skybridge connecting Bldg B and C, 110m, 3 min)
        addEdge("CARD", "PED", 110, 3, "Cross 2nd Floor Skybridge to Building C");
    }

    void addDepartment(const std::string& code, const std::string& name, const std::string& floor, const std::string& building) {
        departments.push_back(DepartmentNode(code, name, floor, building));
        adjList.push_back(std::vector<Edge>());
    }

    void addEdge(const std::string& fromCode, const std::string& toCode, int distance, int timeMin, const std::string& hint) {
        int u = getIndexByCode(fromCode);
        int v = getIndexByCode(toCode);
        if (u != -1 && v != -1) {
            adjList[u].push_back(Edge(v, distance, timeMin, hint));
            adjList[v].push_back(Edge(u, distance, timeMin, "Reverse corridor: " + hint));
        }
    }

    // Dijkstra's Algorithm for Weighted Shortest Path
    NavigationResult dijkstra(const std::string& startCode, const std::string& targetCode) const {
        NavigationResult result;
        result.algorithmUsed = "Dijkstra (Shortest Weighted Path)";

        int src = getIndexByCode(startCode);
        int dest = getIndexByCode(targetCode);

        if (src == -1 || dest == -1) return result;

        int n = (int)departments.size();
        const int INF = 1e9;
        std::vector<int> dist(n, INF);
        std::vector<int> timeArr(n, INF);
        std::vector<int> parent(n, -1);
        std::vector<std::string> hintTaken(n, "");

        // Min-heap pair: (distance, nodeIndex)
        std::priority_queue<std::pair<int, int>, std::vector<std::pair<int, int>>, std::greater<std::pair<int, int>>> pq;

        dist[src] = 0;
        timeArr[src] = 0;
        pq.push({0, src});

        while (!pq.empty()) {
            int d = pq.top().first;
            int u = pq.top().second;
            pq.pop();

            if (d > dist[u]) continue;
            if (u == dest) break;

            for (const Edge& edge : adjList[u]) {
                int v = edge.to;
                if (dist[u] + edge.distance < dist[v]) {
                    dist[v] = dist[u] + edge.distance;
                    timeArr[v] = timeArr[u] + edge.timeMinutes;
                    parent[v] = u;
                    hintTaken[v] = edge.directionHint;
                    pq.push({dist[v], v});
                }
            }
        }

        if (dist[dest] == INF) return result;

        result.reachable = true;
        result.totalDistanceMeters = dist[dest];
        result.totalTimeMinutes = timeArr[dest];

        // Reconstruct path
        std::vector<int> pathIndices;
        int curr = dest;
        while (curr != -1) {
            pathIndices.push_back(curr);
            curr = parent[curr];
        }
        std::reverse(pathIndices.begin(), pathIndices.end());

        for (size_t i = 0; i < pathIndices.size(); i++) {
            result.path.push_back(departments[pathIndices[i]].code);
            if (i > 0) {
                result.instructions.push_back(hintTaken[pathIndices[i]]);
            }
        }

        return result;
    }

    // Breadth-First Search (fewest corridors)
    NavigationResult bfs(const std::string& startCode, const std::string& targetCode) const {
        NavigationResult result;
        result.algorithmUsed = "BFS (Fewest Corridor Transfers)";

        int src = getIndexByCode(startCode);
        int dest = getIndexByCode(targetCode);
        if (src == -1 || dest == -1) return result;

        int n = (int)departments.size();
        std::vector<bool> visited(n, false);
        std::vector<int> parent(n, -1);
        std::queue<int> q;

        visited[src] = true;
        q.push(src);

        while (!q.empty()) {
            int u = q.front();
            q.pop();

            if (u == dest) break;

            for (const Edge& edge : adjList[u]) {
                int v = edge.to;
                if (!visited[v]) {
                    visited[v] = true;
                    parent[v] = u;
                    q.push(v);
                }
            }
        }

        if (!visited[dest]) return result;

        result.reachable = true;
        std::vector<int> pathIndices;
        int curr = dest;
        while (curr != -1) {
            pathIndices.push_back(curr);
            curr = parent[curr];
        }
        std::reverse(pathIndices.begin(), pathIndices.end());

        int totalDist = 0;
        int totalTime = 0;
        for (size_t i = 0; i < pathIndices.size(); i++) {
            result.path.push_back(departments[pathIndices[i]].code);
            if (i > 0) {
                int u = pathIndices[i - 1];
                int v = pathIndices[i];
                for (const auto& e : adjList[u]) {
                    if (e.to == v) {
                        totalDist += e.distance;
                        totalTime += e.timeMinutes;
                        result.instructions.push_back(e.directionHint);
                        break;
                    }
                }
            }
        }
        result.totalDistanceMeters = totalDist;
        result.totalTimeMinutes = totalTime;
        return result;
    }

    const std::vector<DepartmentNode>& getDepartments() const {
        return departments;
    }
};

#endif // GRAPH_HPP
