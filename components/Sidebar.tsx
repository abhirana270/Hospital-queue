'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  allowedRoles: ('admin' | 'doctor' | 'receptionist')[];
}

const allNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', allowedRoles: ['admin', 'doctor', 'receptionist'] },
  { href: '/patients', label: 'Patients', icon: '👥', allowedRoles: ['admin', 'doctor', 'receptionist'] },
  { href: '/queue', label: 'Normal Queue', icon: '📋', allowedRoles: ['admin', 'doctor', 'receptionist'] },
  { href: '/emergency', label: 'Emergency Triage', icon: '🚨', allowedRoles: ['admin', 'doctor', 'receptionist'] },
  { href: '/doctors', label: 'Doctors', icon: '👨‍⚕️', allowedRoles: ['admin', 'doctor'] },
  { href: '/departments', label: 'Navigation Graph', icon: '🗺️', allowedRoles: ['admin', 'receptionist'] },
  { href: '/analytics', label: 'Analytics', icon: '📈', allowedRoles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: 'admin' | 'doctor' | 'receptionist' }>({
    name: 'Administrator',
    role: 'admin',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hospital_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Default to admin
    }
  }, [pathname]);

  if (pathname === '/login') return null;

  // Filter navigation items by active role
  const visibleNavItems = allNavItems.filter((item) =>
    item.allowedRoles.includes(user.role || 'admin')
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      {/* Hospital Logo Header */}
      <div className="p-5 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="text-3xl">🏥</span>
          <div>
            <h1 className="font-bold text-gray-900 text-base leading-tight">Hospital Queue</h1>
            <p className="text-[11px] text-gray-500 font-medium">DSA C++ Engine Core</p>
          </div>
        </Link>
      </div>

      {/* Role-Specific Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {user.role === 'admin'
            ? '👑 Admin Portal'
            : user.role === 'doctor'
            ? '👨‍⚕️ Clinical Portal'
            : '📋 Reception Desk'}
        </div>
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200/60'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Active User Footer Card */}
      <div className="p-3 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <div className="text-xs font-bold text-gray-900 truncate">{user.name}</div>
            <span
              className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                user.role === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : user.role === 'doctor'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {user.role}
            </span>
          </div>
          <Link
            href="/login"
            className="text-[11px] text-primary-600 hover:underline font-semibold"
            title="Switch User Role"
          >
            Switch Role
          </Link>
        </div>
      </div>
    </aside>
  );
}
