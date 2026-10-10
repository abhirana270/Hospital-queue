'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchPatient = async () => {
    try {
      const res = await fetch(`/api/patients/${params.id}`).then((r) => r.json());
      if (res.success) setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [params.id]);

  const updateStatus = async (status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/patients/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then((r) => r.json());

      if (res.success) {
        setNotification(`Patient status updated to ${status}`);
        await fetchPatient();
      }
    } catch {
      setNotification('Failed to update status');
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (loading) {
    return <p className="text-center py-12 text-gray-400 text-sm">Loading patient file {params.id}...</p>;
  }

  if (!data?.patient) {
    return (
      <div className="card text-center py-12 space-y-3">
        <p className="text-red-600 font-semibold text-base">Patient record not found</p>
        <Link href="/patients" className="btn-primary text-xs inline-block">
          ← Back to Patients Directory
        </Link>
      </div>
    );
  }

  const p = data.patient;
  const qInfo = data.queueInfo;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
            <span className="font-mono text-xs bg-gray-200 text-gray-800 px-2.5 py-0.5 rounded font-bold">
              {p.patientId}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
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
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Registered on {new Date(p.arrivalTime).toLocaleString()}
          </p>
        </div>
        <Link href="/patients" className="btn-secondary text-xs self-start sm:self-auto">
          ← Back to Patients
        </Link>
      </div>

      {notification && (
        <div className="bg-primary-50 border border-primary-200 text-primary-800 p-3 rounded-lg text-sm">
          {notification}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Demographics & Clinical Information */}
        <div className="md:col-span-2 card space-y-5">
          <h2 className="text-base font-bold text-gray-900 border-b pb-2">Medical Profile</h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500 block mb-0.5">Age &amp; Gender</span>
              <span className="font-semibold text-gray-900 text-sm">
                {p.age} years old ({p.gender})
              </span>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5">Contact Phone</span>
              <span className="font-mono font-semibold text-gray-900 text-sm">{p.phone}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5">Assigned Department</span>
              <span className="font-semibold text-gray-900 text-sm">{p.department}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5">Assigned Doctor ID</span>
              <span className="font-mono font-semibold text-gray-900 text-sm">
                {p.assignedDoctor || 'Pending Assignment'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-500 block mb-1">Symptoms &amp; Clinical Notes</span>
            <div className="p-3 bg-gray-50 rounded-lg border text-xs text-gray-800">
              {p.symptoms?.length > 0 ? p.symptoms.join(', ') : 'No specific symptoms logged.'}
            </div>
          </div>

          {/* Workflow Status Actions */}
          <div className="pt-3 border-t">
            <span className="text-xs font-semibold text-gray-700 block mb-2">Hospital Workflow Actions:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateStatus('InConsultation')}
                disabled={actionLoading || p.queueStatus === 'InConsultation'}
                className="btn-primary text-xs disabled:opacity-50"
              >
                Start Consultation
              </button>
              <button
                onClick={() => updateStatus('Treated')}
                disabled={actionLoading || p.queueStatus === 'Treated'}
                className="btn-secondary text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Mark as Treated
              </button>
              <button
                onClick={() => updateStatus('Cancelled')}
                disabled={actionLoading || p.queueStatus === 'Cancelled'}
                className="btn-danger text-xs disabled:opacity-50"
              >
                Cancel Patient
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Queue Position & DSA Engine State */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-2">Queue Status</h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Current Status</span>
              <span className="font-bold text-sm text-primary-700">{p.queueStatus}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Queue Position</span>
              <span className="font-mono font-bold text-base text-gray-900">
                {typeof qInfo.position === 'number' ? `#${qInfo.position}` : qInfo.position}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Est. Wait Time</span>
              <span className="font-mono font-semibold text-sm text-gray-800">
                ~{qInfo.estimatedWaitMinutes} minutes
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Priority Score</span>
              <span className="font-mono font-bold text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-900">
                {p.priorityScore}
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 space-y-1">
            <div className="font-semibold">Active Queue Engine:</div>
            <div>{qInfo.queueType}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
