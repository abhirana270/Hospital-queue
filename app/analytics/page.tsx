'use client';

import { useState, useEffect } from 'react';
import DashboardCard from '@/components/DashboardCard';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics').then((r) => r.json());
      if (res.success) setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Analytics &amp; Throughput</h1>
          <p className="text-sm text-gray-500">
            Real-time waiting time calculation, doctor utilization, and DSA algorithm performance
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition self-start sm:self-auto"
        >
          🔄 Refresh Analytics
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Average Wait Time"
          value={loading ? '...' : `${data?.metrics?.avgWaitTimeMinutes ?? 0}m`}
          icon="⏱️"
          color="blue"
          subtitle="All waiting patients"
        />
        <DashboardCard
          title="Maximum Wait Time"
          value={loading ? '...' : `${data?.metrics?.maxWaitTimeMinutes ?? 0}m`}
          icon="⏳"
          color="yellow"
          subtitle="Longest waiting patient"
        />
        <DashboardCard
          title="Patients Treated"
          value={loading ? '...' : data?.metrics?.treatedToday ?? 0}
          icon="✅"
          color="green"
          subtitle="Completed consultations"
        />
        <DashboardCard
          title="Doctor Utilization"
          value={loading ? '...' : `${data?.metrics?.utilizationPercent ?? 0}%`}
          icon="📈"
          color="purple"
          subtitle="Active patient load"
        />
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Load Distribution */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-2">
            Department Load &amp; Queue Density
          </h2>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-400">Loading department statistics...</p>
            ) : (
              data?.departmentLoad?.map((dept: any) => (
                <div key={dept.code} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-800">
                      {dept.name} ({dept.code})
                    </span>
                    <span className="font-mono text-gray-600">
                      {dept.waiting} waiting • {dept.inConsultation} in consult
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, dept.waiting * 25)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Emergency Severity Distribution */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-2">
            Triage Severity Distribution
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-red-200 bg-red-50/50">
              <span className="text-xs text-red-600 font-semibold block">Critical (Score ~1.0)</span>
              <span className="text-2xl font-bold font-mono text-red-800">
                {data?.severityBreakdown?.Critical ?? 0}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Top of Min-Heap</span>
            </div>

            <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/50">
              <span className="text-xs text-orange-600 font-semibold block">Serious (Score ~2.0)</span>
              <span className="text-2xl font-bold font-mono text-orange-800">
                {data?.severityBreakdown?.Serious ?? 0}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Emergency Triage</span>
            </div>

            <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50/50">
              <span className="text-xs text-yellow-700 font-semibold block">Moderate (Score ~3.0)</span>
              <span className="text-2xl font-bold font-mono text-yellow-800">
                {data?.severityBreakdown?.Moderate ?? 0}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Priority Consultation</span>
            </div>

            <div className="p-3 rounded-lg border border-green-200 bg-green-50/50">
              <span className="text-xs text-green-700 font-semibold block">Normal (Score ~4.0)</span>
              <span className="text-2xl font-bold font-mono text-green-800">
                {data?.severityBreakdown?.Normal ?? 0}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">FIFO Linked List Queue</span>
            </div>
          </div>
        </div>
      </div>

      {/* DSA Algorithms Benchmark & Complexity Mapping */}
      <div className="card space-y-3">
        <h2 className="text-base font-bold text-gray-900 border-b pb-2">
          C++ Data Structures Complexity Verification
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase border-b">
              <tr>
                <th className="px-3 py-2">Hospital Workflow</th>
                <th className="px-3 py-2">Data Structure</th>
                <th className="px-3 py-2">Core Operations</th>
                <th className="px-3 py-2">Time Complexity</th>
                <th className="px-3 py-2">Space</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-3 py-2 font-medium">Normal Consultation Queue</td>
                <td className="px-3 py-2">Singly Linked List</td>
                <td className="px-3 py-2">Enqueue, Dequeue, Peek</td>
                <td className="px-3 py-2 font-mono text-green-700 font-semibold">O(1)</td>
                <td className="px-3 py-2 font-mono">O(n)</td>
                <td className="px-3 py-2 text-green-600 font-semibold">Active C++</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Emergency Triage</td>
                <td className="px-3 py-2">Binary Min-Heap</td>
                <td className="px-3 py-2">Insert, ExtractMin, UpdatePriority</td>
                <td className="px-3 py-2 font-mono text-green-700 font-semibold">O(log n)</td>
                <td className="px-3 py-2 font-mono">O(n)</td>
                <td className="px-3 py-2 text-green-600 font-semibold">Active C++</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Patient Search by ID / Phone</td>
                <td className="px-3 py-2">Hash Table (Chaining)</td>
                <td className="px-3 py-2">Hash, Search, Insert</td>
                <td className="px-3 py-2 font-mono text-green-700 font-semibold">O(1) avg</td>
                <td className="px-3 py-2 font-mono">O(B + n)</td>
                <td className="px-3 py-2 text-green-600 font-semibold">Active C++</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Sorted Patient Directory</td>
                <td className="px-3 py-2">Binary Search Tree (BST)</td>
                <td className="px-3 py-2">Search, Insert, In-order Traversal</td>
                <td className="px-3 py-2 font-mono text-green-700 font-semibold">O(log n) avg</td>
                <td className="px-3 py-2 font-mono">O(n)</td>
                <td className="px-3 py-2 text-green-600 font-semibold">Active C++</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Hospital Wayfinding</td>
                <td className="px-3 py-2">Weighted Graph (Adj List)</td>
                <td className="px-3 py-2">Dijkstra Shortest Path, BFS</td>
                <td className="px-3 py-2 font-mono text-green-700 font-semibold">O((V+E)logV)</td>
                <td className="px-3 py-2 font-mono">O(V + E)</td>
                <td className="px-3 py-2 text-green-600 font-semibold">Active C++</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
