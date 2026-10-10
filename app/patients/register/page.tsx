'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPatientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    symptoms: '',
    emergencyLevel: 'Normal',
    department: 'GEN',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live Simulated Priority Score Preview
  const calculatePreviewScore = () => {
    let base = 4.0;
    if (formData.emergencyLevel === 'Critical') base = 1.0;
    else if (formData.emergencyLevel === 'Serious') base = 2.0;
    else if (formData.emergencyLevel === 'Moderate') base = 3.0;

    const age = Number(formData.age) || 0;
    const ageBonus = age >= 65 || age <= 5 ? 0.2 : 0.0;
    return Math.max(0.1, Number((base - ageBonus).toFixed(2)));
  };

  const previewScore = calculatePreviewScore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).then((r) => r.json());

      if (!res.success) {
        throw new Error(res.error || 'Registration failed');
      }

      router.push(`/patients/${res.patient.patientId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Patient Registration &amp; Triage</h1>
        <p className="text-sm text-gray-500">
          Enqueues into C++ Linked List or Binary Min-Heap Priority Queue with automated doctor assignment
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Patient Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Eleanor Vance"
              className="input-field text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Age *</label>
            <input
              type="number"
              min="0"
              max="150"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="e.g. 45"
              className="input-field text-sm font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="input-field text-sm"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. 555-0199"
              className="input-field text-sm font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="input-field text-sm"
              required
            >
              <option value="GEN">General Medicine (GEN)</option>
              <option value="ER">Emergency (ER)</option>
              <option value="CARD">Cardiology (CARD)</option>
              <option value="NEUR">Neurology (NEUR)</option>
              <option value="ORTH">Orthopedics (ORTH)</option>
              <option value="PED">Pediatrics (PED)</option>
              <option value="RAD">Radiology (RAD)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency / Severity Level *</label>
            <select
              value={formData.emergencyLevel}
              onChange={(e) => setFormData({ ...formData, emergencyLevel: e.target.value as any })}
              className="input-field text-sm font-semibold"
            >
              <option value="Normal">Normal (Routine consultation)</option>
              <option value="Moderate">Moderate (Urgent outpatient care)</option>
              <option value="Serious">Serious (Immediate attention needed)</option>
              <option value="Critical">Critical (Immediate resuscitation)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Reported Symptoms</label>
          <textarea
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            placeholder="e.g. Acute pain in lower abdomen, fever for 3 days..."
            rows={2}
            className="input-field text-sm"
          />
        </div>

        {/* Live Triage Score Preview Card */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase text-gray-500">
              Deterministic Triage Score Calculation
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Destination DSA Queue:{' '}
              <strong>
                {formData.emergencyLevel === 'Critical' || formData.emergencyLevel === 'Serious'
                  ? 'Binary Min-Heap Priority Queue O(log n)'
                  : 'Singly Linked List Queue O(1) FIFO'}
              </strong>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-xs text-gray-500">Computed Initial Score:</div>
            <div className="text-2xl font-bold font-mono text-primary-700">{previewScore}</div>
            <span className="text-[10px] text-gray-400">Lower = Earlier consultation</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary text-sm font-semibold flex-1 disabled:opacity-50">
            {loading ? 'Registering & Enqueueing...' : 'Register Patient & Enqueue'}
          </button>
          <Link href="/patients" className="btn-secondary text-sm">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
