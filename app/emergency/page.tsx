'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EmergencyPage() {
  const [heapData, setHeapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Reposition modal / inputs
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newScoreInput, setNewScoreInput] = useState('0.5');

  const fetchEmergencyQueue = async () => {
    try {
      const res = await fetch('/api/emergency').then((r) => r.json());
      if (res.success) {
        setHeapData(res.heapData);
        if (res.heapData?.patients?.length && !selectedPatientId) {
          setSelectedPatientId(res.heapData.patients[0].patientId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyQueue();
  }, []);

  const handleExtractMin = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extract_min' }),
      }).then((r) => r.json());

      if (res.success && res.result?.extracted) {
        setNotification(
          `Admitted Critical Patient: ${res.result.extracted.name} (${res.result.extracted.patientId}) - Priority Score: ${res.result.extracted.priorityScore}`
        );
      } else {
        setNotification('Emergency queue is empty');
      }
      await fetchEmergencyQueue();
    } catch {
      setNotification('Failed to admit critical patient');
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleReposition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_priority',
          patientId: selectedPatientId,
          newScore: parseFloat(newScoreInput),
        }),
      }).then((r) => r.json());

      if (res.success) {
        setNotification(`Repositioned ${selectedPatientId} in Min-Heap with new score ${newScoreInput} via O(log n) heapify!`);
      }
      await fetchEmergencyQueue();
    } catch {
      setNotification('Failed to update priority');
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Triage Queue</h1>
          <p className="text-sm text-gray-500">
            Powered by manually implemented C++ Binary Min-Heap Priority Queue
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchEmergencyQueue}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleExtractMin}
            disabled={actionLoading || !heapData?.patients?.length}
            className="btn-danger text-sm disabled:opacity-50"
          >
            Admit Highest Urgency Patient (ExtractMin)
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {notification}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Sorted Queue List */}
        <div className="lg:col-span-2 card space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Urgency Sorted Patients</h2>
              <p className="text-xs text-gray-500">Extraction Order from Min-Heap (Lower Score = Higher Urgency)</p>
            </div>
            <span className="font-mono text-xs bg-red-100 text-red-800 px-2.5 py-1 rounded border border-red-200">
              Total Urgencies: {heapData?.queueLength ?? 0}
            </span>
          </div>

          {loading ? (
            <p className="text-center py-8 text-sm text-gray-400">Loading heap patients...</p>
          ) : !heapData?.patients?.length ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🚨</div>
              <p>No critical or emergency patients currently waiting.</p>
              <Link href="/patients/register" className="text-red-600 text-xs font-semibold mt-2 inline-block">
                + Register an Emergency patient
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {heapData.patients.map((p: any, idx: number) => (
                <div
                  key={p.patientId}
                  className={`p-3.5 rounded-lg border flex items-center justify-between ${
                    idx === 0
                      ? 'bg-red-50/90 border-red-300 ring-2 ring-red-400/20'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-gray-900">{p.patientId}</span>
                        <span className="font-semibold text-gray-800 text-sm">{p.name}</span>
                        <span className="badge-critical text-[10px]">{p.emergencyLevel}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {p.department} • Age {p.age} • Arrived {new Date(p.arrivalTimestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-red-700">
                      Score: {p.priorityScore}
                    </div>
                    <Link href={`/patients/${p.patientId}`} className="text-[11px] text-primary-600 hover:underline">
                      View Record
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Re-positioning Tool (heapifyUp / heapifyDown Demonstration) */}
        <div className="card space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-gray-900">Priority Score Repositioning</h2>
            <p className="text-xs text-gray-500">
              Demonstrates C++ Min-Heap updatePriority in O(log n)
            </p>
          </div>

          <form onSubmit={handleReposition} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="input-field text-sm"
                disabled={!heapData?.patients?.length}
              >
                {heapData?.patients?.map((p: any) => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.patientId} - {p.name} (Current: {p.priorityScore})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                New Priority Score (0.1 - 4.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="4.0"
                value={newScoreInput}
                onChange={(e) => setNewScoreInput(e.target.value)}
                className="input-field text-sm font-mono"
                required
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                0.1 = Immediate resuscitation / 4.0 = Stable
              </span>
            </div>

            <button
              type="submit"
              disabled={actionLoading || !heapData?.patients?.length}
              className="btn-danger w-full text-xs font-semibold disabled:opacity-50"
            >
              Update Priority &amp; Re-Heapify O(log n)
            </button>
          </form>

          {/* Heap Array Structure Callout */}
          <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1.5">
            <div className="font-semibold text-gray-700">Underlying Array Heap Layout:</div>
            <div className="font-mono text-[11px] text-gray-600 break-all">
              [{heapData?.heapArray?.map((h: any) => `${h.patientId}(${h.priorityScore})`).join(', ') || 'EMPTY'}]
            </div>
            <div className="text-[10px] text-gray-400">
              Parent(i) = ⌊(i-1)/2⌋ • Left(i) = 2i+1 • Right(i) = 2i+2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
