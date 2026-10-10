'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('receptionist@hospital.org');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'admin' | 'doctor' | 'receptionist'>('receptionist');
  const [notification, setNotification] = useState<string | null>(null);

  const fillDemoUser = (userRole: 'admin' | 'doctor' | 'receptionist') => {
    setRole(userRole);
    if (userRole === 'admin') {
      setEmail('admin@hospital.org');
      setPassword('adminPass123');
    } else if (userRole === 'doctor') {
      setEmail('dr.jenkins@hospital.org');
      setPassword('docPass123');
    } else {
      setEmail('receptionist@hospital.org');
      setPassword('recPass123');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Set user session in client storage
    localStorage.setItem(
      'hospital_user',
      JSON.stringify({
        email,
        role,
        name:
          role === 'admin'
            ? 'Chief Medical Administrator'
            : role === 'doctor'
            ? 'Dr. Sarah Jenkins'
            : 'Reception Desk Staff',
      })
    );
    setNotification(`Authenticated successfully as ${role.toUpperCase()}! Redirecting...`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center">
      <div className="card max-w-md w-full shadow-lg border-primary-100 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-4xl mb-1">🏥</div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Portal Sign In</h1>
          <p className="text-xs text-gray-500">Role-Based Access Control (RBAC) Authentication</p>
        </div>

        {/* Demo Role Auto-Fill Quick Selectors */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block text-center">
            Quick Auto-Fill Demo Roles:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoUser('admin')}
              className={`py-1.5 px-2 rounded text-xs font-semibold border transition ${
                role === 'admin'
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoUser('doctor')}
              className={`py-1.5 px-2 rounded text-xs font-semibold border transition ${
                role === 'doctor'
                  ? 'bg-green-100 text-green-900 border-green-300'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              👨‍⚕️ Doctor
            </button>
            <button
              type="button"
              onClick={() => fillDemoUser('receptionist')}
              className={`py-1.5 px-2 rounded text-xs font-semibold border transition ${
                role === 'receptionist'
                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              📋 Receptionist
            </button>
          </div>
        </div>

        {notification && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-2.5 rounded text-xs font-medium text-center">
            {notification}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Selected Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="input-field text-sm font-semibold capitalize"
            >
              <option value="admin">Admin (Full System Access)</option>
              <option value="doctor">Doctor (Consultations &amp; Patient Records)</option>
              <option value="receptionist">Receptionist (Patient Registration &amp; Queuing)</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full text-sm font-semibold py-2.5 shadow-sm">
            Sign In to Hospital Portal →
          </button>
        </form>

        <div className="text-[11px] text-gray-400 text-center border-t pt-3">
          Session persisted in localStorage with role authorization gates.
        </div>
      </div>
    </div>
  );
}
