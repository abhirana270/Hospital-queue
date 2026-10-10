'use client';

import { useState, useEffect } from 'react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation State
  const [startDept, setStartDept] = useState('ER');
  const [targetDept, setTargetDept] = useState('PED');
  const [algorithm, setAlgorithm] = useState<'dijkstra' | 'bfs'>('dijkstra');
  const [navResult, setNavResult] = useState<any>(null);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    fetch('/api/departments')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setDepartments(res.departments);
      })
      .finally(() => setLoading(false));

    // Calculate initial default route
    calculateRoute('ER', 'PED', 'dijkstra');
  }, []);

  const calculateRoute = async (start = startDept, target = targetDept, algo = algorithm) => {
    setNavigating(true);
    try {
      const res = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDepartment: start,
          targetDepartment: target,
          algorithm: algo,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setNavResult(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNavigating(false);
    }
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    calculateRoute(startDept, targetDept, algorithm);
  };

  const deptIcons: Record<string, string> = {
    ER: '🚑',
    RAD: '📡',
    GEN: '💊',
    CARD: '❤️',
    NEUR: '🧠',
    ORTH: '🦴',
    PED: '👶',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hospital Departments &amp; Navigation</h1>
        <p className="text-sm text-gray-500">
          Powered by manually implemented C++ Graph (Adjacency List + Dijkstra &amp; BFS Algorithms)
        </p>
      </div>

      {/* Interactive Graph Route Navigator (DSA Demonstration) */}
      <div className="card space-y-5 border-2 border-primary-100 bg-gradient-to-br from-white to-primary-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              <h2 className="text-base font-bold text-gray-900">
                Hospital Wayfinding Engine (C++ Graph)
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              Calculate optimal transit corridors between medical units
            </p>
          </div>
          <span className="text-xs font-mono bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded border border-yellow-200">
            {algorithm === 'dijkstra' ? 'Dijkstra: O((V+E)logV)' : 'BFS: O(V+E)'}
          </span>
        </div>

        {/* Route Form */}
        <form onSubmit={handleNavigate} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Starting Point</label>
            <select
              value={startDept}
              onChange={(e) => setStartDept(e.target.value)}
              className="input-field text-sm font-medium"
            >
              {departments.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Destination</label>
            <select
              value={targetDept}
              onChange={(e) => setTargetDept(e.target.value)}
              className="input-field text-sm font-medium"
            >
              {departments.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Routing Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as any)}
              className="input-field text-sm font-medium"
            >
              <option value="dijkstra">Dijkstra (Shortest Distance/Time)</option>
              <option value="bfs">BFS (Fewest Transfers)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={navigating}
              className="btn-primary w-full text-sm font-semibold h-[42px] disabled:opacity-50"
            >
              {navigating ? 'Routing...' : 'Find Route →'}
            </button>
          </div>
        </form>

        {/* Route Navigation Results Box */}
        {navResult?.navigation && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
                <span>
                  Total Distance:{' '}
                  <strong className="text-primary-700 font-mono text-sm">
                    {navResult.navigation.totalDistanceMeters}m
                  </strong>
                </span>
                <span>
                  Walking Time:{' '}
                  <strong className="text-primary-700 font-mono text-sm">
                    ~{navResult.navigation.totalTimeMinutes} min
                  </strong>
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                Engine: {navResult.dsaEngine} • Execution: {navResult.executionTimeMs}ms
              </span>
            </div>

            {/* Path Breadcrumbs */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Calculated Route Sequence:
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {navResult.navigation.path?.map((deptCode: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                        idx === 0
                          ? 'bg-green-100 text-green-900 border-green-300'
                          : idx === navResult.navigation.path.length - 1
                          ? 'bg-red-100 text-red-900 border-red-300'
                          : 'bg-primary-50 text-primary-900 border-primary-200'
                      }`}
                    >
                      <span>{deptIcons[deptCode] || '🏢'}</span>
                      <span className="font-mono">{deptCode}</span>
                    </div>
                    {idx < navResult.navigation.path.length - 1 && (
                      <span className="text-primary-400 font-bold text-sm">➔</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Turn-by-Turn Corridor Instructions */}
            {navResult.navigation.instructions?.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-2">
                <div className="font-semibold text-gray-700">Step-by-Step Corridor Directions:</div>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  {navResult.navigation.instructions.map((inst: string, i: number) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Departments Grid */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">All Hospital Departments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="text-sm text-gray-400">Loading departments...</p>
          ) : (
            departments.map((dept) => (
              <div key={dept.code} className="card hover:border-primary-300 transition shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{deptIcons[dept.code] || '🏢'}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{dept.name}</h3>
                      <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                        Code: {dept.code}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">{dept.description}</p>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>📍 {dept.location}</span>
                  <span className="font-semibold text-primary-700">
                    {dept.waitingPatients ?? 0} waiting
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
