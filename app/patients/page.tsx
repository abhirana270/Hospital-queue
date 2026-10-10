'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'bst'>('standard');
  const [bstStats, setBstStats] = useState<any>(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      if (viewMode === 'bst') {
        const res = await fetch('/api/patients/records').then((r) => r.json());
        if (res.success && res.records?.patients) {
          setPatients(res.records.patients);
          setBstStats(res.records.treeStats);
        }
      } else {
        const res = await fetch('/api/patients').then((r) => r.json());
        if (res.success) setPatients(res.patients);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [viewMode]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(searchQuery.trim())}`).then((r) =>
        r.json()
      );
      setSearchResult(res);
    } catch {
      setSearchResult({ success: false, error: 'Search failed' });
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Directory</h1>
          <p className="text-sm text-gray-500">
            Search via C++ Hash Table • Sort via C++ Binary Search Tree (BST)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'standard' ? 'bst' : 'standard')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
              viewMode === 'bst'
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {viewMode === 'bst' ? '🌳 BST In-Order Active' : '🌳 Switch to BST In-Order View'}
          </button>
          <Link href="/patients/register" className="btn-primary text-sm">
            + Register Patient
          </Link>
        </div>
      </div>

      {/* C++ Hash Table Patient Search Bar */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <h2 className="text-sm font-bold text-gray-900">
              Instant Patient Search (C++ Hash Table with Chaining)
            </h2>
          </div>
          <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
            O(1) Avg Lookup
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Patient ID (e.g. P101) or Phone Number (e.g. 555-0111)..."
            className="input-field text-sm flex-1"
          />
          <button type="submit" disabled={searching} className="btn-primary text-sm px-5 disabled:opacity-50">
            {searching ? 'Hashing...' : 'Search'}
          </button>
          {searchResult && (
            <button type="button" onClick={clearSearch} className="btn-secondary text-sm">
              Clear
            </button>
          )}
        </form>

        {/* Hash Table Search Result Card */}
        {searchResult && (
          <div className="mt-4 p-4 rounded-lg border bg-gray-50 space-y-3">
            <div className="flex items-center justify-between text-xs border-b pb-2">
              <span className="font-semibold text-gray-700">
                Hash Table Search Metrics: {searchResult.result?.comparisons ?? 0} bucket comparisons
              </span>
              <span className="font-mono text-gray-500">
                Load Factor: {searchResult.result?.stats?.loadFactor} • Collisions: {searchResult.result?.stats?.collisions}
              </span>
            </div>

            {searchResult.result?.found ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-primary-700">
                      {searchResult.result.patient.patientId}
                    </span>
                    <span className="font-semibold text-gray-900">{searchResult.result.patient.name}</span>
                    <span className="text-xs text-gray-500">({searchResult.result.patient.gender}, {searchResult.result.patient.age}y)</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Phone: {searchResult.result.patient.phone} • Dept: {searchResult.result.patient.department} • Status: {searchResult.result.patient.queueStatus}
                  </div>
                </div>
                <Link
                  href={`/patients/${searchResult.result.patient.patientId}`}
                  className="btn-primary text-xs py-1.5 self-start sm:self-auto"
                >
                  View Full File →
                </Link>
              </div>
            ) : (
              <p className="text-xs text-red-600 font-medium">No patient found matching query &quot;{searchQuery}&quot;</p>
            )}
          </div>
        )}
      </div>

      {/* BST Metadata Banner if BST View Active */}
      {viewMode === 'bst' && bstStats && (
        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-xs text-purple-900 flex justify-between items-center">
          <span>
            <strong>Binary Search Tree View:</strong> Records sorted via in-order traversal (Left → Root → Right) keyed on Patient ID.
          </span>
          <span className="font-mono font-semibold">
            Tree Size: {bstStats.size} • Height: {bstStats.height} • Search: O(log n)
          </span>
        </div>
      )}

      {/* Patient Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Age / Gender</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading patients...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No patients registered. Click &quot;Register Patient&quot; above.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.patientId} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">{p.patientId}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.age}y / {p.gender}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.department}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          p.emergencyLevel === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : p.emergencyLevel === 'Serious'
                            ? 'bg-orange-100 text-orange-800'
                            : p.emergencyLevel === 'Moderate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {p.emergencyLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{p.priorityScore}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded ${
                          p.queueStatus === 'Waiting'
                            ? 'bg-blue-50 text-blue-700'
                            : p.queueStatus === 'InConsultation'
                            ? 'bg-amber-50 text-amber-700 font-semibold'
                            : p.queueStatus === 'Treated'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.queueStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/patients/${p.patientId}`}
                        className="text-primary-600 hover:text-primary-800 font-medium text-xs"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
