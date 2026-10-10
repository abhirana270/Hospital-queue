'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function QueuePage() {
  const [queueData, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue').then((r) => r.json());
      if (res.success) setQueueData(res.queueData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDequeue = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dequeue' }),
      }).then((r) => r.json());

      if (res.success && res.result?.dequeued) {
        setNotification(`Served: ${res.result.dequeued.name} (${res.result.dequeued.patientId}) - Moved to Consultation`);
      } else {
        setNotification('Queue is empty');
      }
      await fetchQueue();
    } catch {
      setNotification('Failed to dequeue');
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleRemove = async (patientId: string) => {
    if (!confirm(`Cancel waiting patient ${patientId}?`)) return;
    setActionLoading(true);
    try {
      await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', patientId }),
      });
      setNotification(`Patient ${patientId} removed from queue`);
      await fetchQueue();
    } catch {
      setNotification('Failed to remove patient');
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Normal Consultation Queue</h1>
          <p className="text-sm text-gray-500">
            Powered by manually implemented C++ Singly Linked List Queue (FIFO)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchQueue}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleDequeue}
            disabled={actionLoading || !queueData?.patients?.length}
            className="btn-primary text-sm disabled:opacity-50"
          >
            Call Next Patient (Dequeue)
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-3 rounded-lg text-sm">
          {notification}
        </div>
      )}

      {/* Linked List Chain Representation */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-bold text-gray-900">Live Linked List Visualization</h2>
          <span className="font-mono text-xs bg-gray-100 px-2.5 py-1 rounded border text-gray-700">
            Length: {queueData?.queueLength ?? 0}
          </span>
        </div>

        <div className="overflow-x-auto py-4">
          {loading ? (
            <p className="text-center text-sm text-gray-400">Loading queue nodes...</p>
          ) : !queueData?.patients?.length ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">📋</div>
              <p>Queue is empty. Head = Tail = NULL.</p>
              <Link href="/patients/register" className="text-primary-600 text-xs font-semibold mt-2 inline-block">
                + Register a normal patient to enqueue
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-max pb-2">
              <div className="text-xs font-bold text-blue-600 uppercase px-2 py-1 bg-blue-50 border border-blue-200 rounded">
                HEAD (Front)
              </div>
              <span className="text-blue-500 font-bold">→</span>
              {queueData.patients.map((p: any, idx: number) => (
                <div key={p.patientId} className="flex items-center gap-3">
                  <div
                    className={`p-4 rounded-xl border shadow-sm w-48 ${
                      idx === 0
                        ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-bold text-sm text-blue-900">{p.patientId}</span>
                      <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                        Pos #{p.position}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm truncate">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {p.department} • Age {p.age}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[11px]">
                      <Link href={`/patients/${p.patientId}`} className="text-primary-600 hover:underline">
                        Details
                      </Link>
                      <button
                        onClick={() => handleRemove(p.patientId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  {idx < queueData.patients.length - 1 ? (
                    <span className="text-gray-400 font-bold text-lg">→</span>
                  ) : (
                    <>
                      <span className="text-gray-400 font-bold text-lg">→</span>
                      <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1 bg-gray-100 border border-gray-300 rounded">
                        TAIL (Rear) → NULL
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DSA Complexity & Theory Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Enqueue Operation</h3>
          <div className="text-2xl font-bold font-mono text-green-600">O(1)</div>
          <p className="text-xs text-gray-500 mt-1">
            New patients attach directly to the <code>tail-&gt;next</code> pointer. No array resizing or elements shifting required.
          </p>
        </div>
        <div className="card">
          <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Dequeue Operation</h3>
          <div className="text-2xl font-bold font-mono text-green-600">O(1)</div>
          <p className="text-xs text-gray-500 mt-1">
            Next patient is served directly from <code>head</code>, advancing <code>head = head-&gt;next</code> in constant time.
          </p>
        </div>
        <div className="card">
          <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Space Complexity</h3>
          <div className="text-2xl font-bold font-mono text-blue-600">O(n)</div>
          <p className="text-xs text-gray-500 mt-1">
            Allocates exactly one <code>QueueNode</code> struct per waiting patient. Zero memory wastage.
          </p>
        </div>
      </div>
    </div>
  );
}
