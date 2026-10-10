'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardCard from '@/components/DashboardCard';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [normalQueue, setNormalQueue] = useState<any>(null);
  const [emergencyQueue, setEmergencyQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, queueRes, emergencyRes] = await Promise.all([
        fetch('/api/analytics').then((r) => r.json()),
        fetch('/api/queue').then((r) => r.json()),
        fetch('/api/emergency').then((r) => r.json()),
      ]);

      if (analyticsRes.success) setMetrics(analyticsRes.metrics);
      if (queueRes.success) setNormalQueue(queueRes.queueData);
      if (emergencyRes.success) setEmergencyQueue(emergencyRes.heapData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCallNormal = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dequeue' }),
      }).then((r) => r.json());

      if (res.success && res.result?.dequeued) {
        setNotification(`Served Next: ${res.result.dequeued.name} (${res.result.dequeued.patientId}) - Admitted to Doctor`);
      } else {
        setNotification('Normal consultation queue is empty');
      }
      await fetchDashboardData();
    } catch {
      setNotification('Failed to dequeue patient');
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleCallEmergency = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extract_min' }),
      }).then((r) => r.json());

      if (res.success && res.result?.extracted) {
        setNotification(
          `Admitted Critical Patient: ${res.result.extracted.name} (${res.result.extracted.patientId}) - Score: ${res.result.extracted.priorityScore}`
        );
      } else {
        setNotification('Emergency triage queue is empty');
      }
      await fetchDashboardData();
    } catch {
      setNotification('Failed to extract emergency patient');
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleSeedData = async () => {
    setActionLoading(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      setNotification('Demo dataset reloaded successfully');
      await fetchDashboardData();
    } catch {
      setNotification('Failed to reset demo dataset');
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-medium text-sky-200 border border-white/10 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            Live Hospital Flow Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Clinical Operations Command</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time patient triage, FIFO consultation queuing, and route navigation powered by compiled C++ Data Structures.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleSeedData}
            disabled={actionLoading}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition active:scale-95 flex items-center gap-1.5"
          >
            <span>🔄</span> Reset Demo Data
          </button>
          <Link
            href="/patients/register"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition active:scale-95 flex items-center gap-1.5"
          >
            <span>+</span> Register Patient
          </Link>
        </div>
      </div>

      {notification && (
        <div className="bg-sky-50 border border-sky-200 text-sky-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-sky-700 font-bold ml-2">×</button>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Registered"
          value={loading ? '...' : metrics?.totalPatients ?? 0}
          icon="👥"
          color="blue"
          subtitle="Patients in hospital store"
        />
        <DashboardCard
          title="Normal Queue"
          value={loading ? '...' : normalQueue?.queueLength ?? 0}
          icon="⏳"
          color="yellow"
          subtitle="Singly Linked List O(1)"
        />
        <DashboardCard
          title="Emergency Triage"
          value={loading ? '...' : emergencyQueue?.queueLength ?? 0}
          icon="🚨"
          color="red"
          subtitle="Binary Min-Heap O(log n)"
        />
        <DashboardCard
          title="Available Doctors"
          value={loading ? '...' : metrics?.availableDoctors ?? 0}
          icon="👨‍⚕️"
          color="green"
          subtitle={`${metrics?.utilizationPercent ?? 0}% capacity utilization`}
        />
      </div>

      {/* Live DSA Queues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Normal Consultation Queue Card */}
        <div className="card space-y-4 hover:border-sky-300 transition-all duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Normal Consultation Queue</h2>
                <span className="bg-sky-100 text-sky-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  FIFO O(1)
                </span>
              </div>
              <p className="text-xs text-slate-500">First-In First-Out consultation stream</p>
            </div>
            <button
              onClick={handleCallNormal}
              disabled={actionLoading || !normalQueue?.patients?.length}
              className="btn-primary text-xs py-2 disabled:opacity-50"
            >
              Call Next (Dequeue)
            </button>
          </div>

          {/* Linked List Visualizer */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 min-h-[140px] flex flex-col justify-center">
            {loading ? (
              <p className="text-center text-xs text-slate-400">Loading queue nodes...</p>
            ) : !normalQueue?.patients?.length ? (
              <p className="text-center text-xs text-slate-400">No patients waiting in normal consultation queue</p>
            ) : (
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                  Live Pointer Chain ({normalQueue.queueLength} nodes):
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {normalQueue.patients.map((p: any, idx: number) => (
                    <div key={p.patientId} className="flex items-center gap-2">
                      <Link
                        href={`/patients/${p.patientId}`}
                        className={`p-2.5 rounded-xl border text-xs shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${
                          idx === 0
                            ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-white border-sky-700 font-bold shadow-md'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        <div className="font-mono text-[11px]">{p.patientId}</div>
                        <div className="truncate max-w-[85px] font-medium">{p.name}</div>
                      </Link>
                      {idx < normalQueue.patients.length - 1 && (
                        <span className="text-sky-400 font-extrabold text-sm">→</span>
                      )}
                    </div>
                  ))}
                  <span className="text-xs font-mono text-slate-400 ml-1">→ NULL</span>
                </div>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 flex justify-between pt-1">
            <span>Head pointer: <strong className="font-mono text-slate-700">{normalQueue?.patients?.[0]?.patientId || 'NULL'}</strong></span>
            <Link href="/queue" className="text-sky-600 hover:underline font-semibold">View Full Queue →</Link>
          </div>
        </div>

        {/* Emergency Triage Heap Card */}
        <div className="card space-y-4 hover:border-rose-300 transition-all duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="animate-heartbeat">❤️‍🩹</span> Emergency Priority Queue
                </h2>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  Min-Heap O(log n)
                </span>
              </div>
              <p className="text-xs text-slate-500">Sorted by Priority Score (Lower = More Urgent)</p>
            </div>
            <button
              onClick={handleCallEmergency}
              disabled={actionLoading || !emergencyQueue?.patients?.length}
              className="btn-danger text-xs py-2 disabled:opacity-50"
            >
              Admit Critical (ExtractMin)
            </button>
          </div>

          <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100/80 min-h-[140px] flex flex-col justify-center">
            {loading ? (
              <p className="text-center text-xs text-slate-400">Loading emergency patients...</p>
            ) : !emergencyQueue?.patients?.length ? (
              <p className="text-center text-xs text-slate-400">No emergency patients currently in triage</p>
            ) : (
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Top of Min-Heap (Highest Urgency at Root):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {emergencyQueue.patients.slice(0, 4).map((p: any, idx: number) => (
                    <div
                      key={p.patientId}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        idx === 0
                          ? 'bg-rose-100/80 border-rose-300 text-rose-950 font-semibold shadow-sm animate-pulse-glow'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-rose-900">{p.patientId}</span>
                          <span className="truncate max-w-[90px]">{p.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{p.department} • Age {p.age}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 font-mono text-xs font-extrabold">
                          {p.priorityScore}
                        </span>
                        <div className="text-[9px] text-slate-400 mt-0.5">Rank #{idx + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 flex justify-between pt-1">
            <span>Root patient: <strong className="font-mono text-slate-700">{emergencyQueue?.patients?.[0]?.patientId || 'EMPTY'}</strong></span>
            <Link href="/emergency" className="text-rose-600 hover:underline font-semibold">Reposition Priorities →</Link>
          </div>
        </div>
      </div>

      {/* C++ DSA Engine Terminal Architecture Banner */}
      <div className="card bg-slate-900 text-white border-slate-800 p-5 rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">●</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Active C++ DSA Engines (MinGW Compiled Binaries)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">IPC: stdin/stdout JSON</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 hover:border-emerald-500/50 transition">
            <div className="text-slate-400 text-[10px]">Normal Queue</div>
            <div className="font-bold text-emerald-400 mt-0.5">Linked List</div>
            <div className="font-mono text-[10px] text-slate-300">O(1) Enqueue/Dequeue</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 hover:border-rose-500/50 transition">
            <div className="text-slate-400 text-[10px]">Emergency Triage</div>
            <div className="font-bold text-rose-400 mt-0.5">Binary Min-Heap</div>
            <div className="font-mono text-[10px] text-slate-300">O(log n) Insert/Extract</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 hover:border-sky-500/50 transition">
            <div className="text-slate-400 text-[10px]">Patient Search</div>
            <div className="font-bold text-sky-400 mt-0.5">Hash Table</div>
            <div className="font-mono text-[10px] text-slate-300">O(1) Avg Lookup</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 hover:border-purple-500/50 transition">
            <div className="text-slate-400 text-[10px]">Patient Records</div>
            <div className="font-bold text-purple-400 mt-0.5">Binary Search Tree</div>
            <div className="font-mono text-[10px] text-slate-300">O(log n) In-Order</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 hover:border-yellow-500/50 transition">
            <div className="text-slate-400 text-[10px]">Wayfinding</div>
            <div className="font-bold text-amber-400 mt-0.5">Graph Dijkstra</div>
            <div className="font-mono text-[10px] text-slate-300">O((V+E)logV)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
