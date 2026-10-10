'use client';

import { useState, useEffect } from 'react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('admin');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Doctor Form State
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    department: 'GEN',
    maxLoad: 5,
  });

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors').then((r) => r.json());
      if (res.success) setDoctors(res.doctors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    try {
      const stored = localStorage.getItem('hospital_user');
      if (stored) {
        const u = JSON.parse(stored);
        setUserRole(u.role || 'admin');
      }
    } catch {
      setUserRole('admin');
    }
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...newDoctor,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setNotification(`Successfully added ${res.doctor.name} (${res.doctor.doctorId})!`);
        setShowAddModal(false);
        setNewDoctor({ name: '', specialization: '', department: 'GEN', maxLoad: 5 });
        await fetchDoctors();
      } else {
        setNotification(res.error || 'Failed to add doctor');
      }
    } catch {
      setNotification('Error connecting to server');
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Staff &amp; Load Balancing</h1>
          <p className="text-sm text-gray-500">
            Automated least-load algorithm assigns incoming patients to suitable available doctors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDoctors}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
          >
            🔄 Refresh
          </button>
          {userRole === 'admin' ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-sm flex items-center gap-1 font-semibold"
            >
              <span>+</span> Add New Doctor
            </button>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg border">
              Logged in as {userRole.toUpperCase()} (View Only)
            </span>
          )}
        </div>
      </div>

      {notification && (
        <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-primary-700 font-bold ml-2">×</button>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card max-w-md w-full shadow-2xl space-y-4 border-primary-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Register New Doctor</h2>
                <p className="text-xs text-gray-500">Add medical specialist to load balancing pool</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Doctor Full Name *</label>
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  placeholder="e.g. Dr. Alex Morgan"
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Specialization *</label>
                <input
                  type="text"
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  placeholder="e.g. Cardiothoracic Surgeon"
                  className="input-field text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                  <select
                    value={newDoctor.department}
                    onChange={(e) => setNewDoctor({ ...newDoctor, department: e.target.value })}
                    className="input-field text-sm"
                    required
                  >
                    <option value="GEN">General (GEN)</option>
                    <option value="ER">Emergency (ER)</option>
                    <option value="CARD">Cardiology (CARD)</option>
                    <option value="NEUR">Neurology (NEUR)</option>
                    <option value="ORTH">Orthopedics (ORTH)</option>
                    <option value="PED">Pediatrics (PED)</option>
                    <option value="RAD">Radiology (RAD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Patient Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newDoctor.maxLoad}
                    onChange={(e) => setNewDoctor({ ...newDoctor, maxLoad: parseInt(e.target.value) || 5 })}
                    className="input-field text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-sm flex-1 font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Save & Add to Roster'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-sm text-gray-400">Loading doctor staff...</p>
        ) : (
          doctors.map((doc) => {
            const loadPercent = Math.min(100, Math.round((doc.currentLoad / doc.maxLoad) * 100));
            const isFull = doc.currentLoad >= doc.maxLoad;

            return (
              <div key={doc.doctorId} className="card space-y-4 shadow-sm hover:border-primary-200 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{doc.name}</h3>
                    <p className="text-xs text-primary-700 font-semibold">{doc.specialization}</p>
                    <span className="text-[11px] font-mono text-gray-500">
                      ID: {doc.doctorId} • Dept: {doc.department}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      doc.isAvailable && !isFull
                        ? 'bg-green-100 text-green-800'
                        : isFull
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isFull ? 'At Capacity' : doc.isAvailable ? 'Available' : 'Off Duty'}
                  </span>
                </div>

                {/* Workload Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-600">Active Workload:</span>
                    <span className="font-mono font-bold text-gray-900">
                      {doc.currentLoad} / {doc.maxLoad} patients ({loadPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        loadPercent >= 100
                          ? 'bg-red-500'
                          : loadPercent >= 60
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-gray-400">
                  {isFull
                    ? '⚠️ Doctor at capacity. New patients route to next available colleague.'
                    : `Active in auto-assignment (${doc.maxLoad - doc.currentLoad} slots available)`}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
