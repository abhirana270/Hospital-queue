import { NextResponse } from 'next/server';
import { HospitalStore } from '@/lib/data-store';

export async function POST() {
  try {
    const store = HospitalStore.resetDefaults();
    return NextResponse.json({
      success: true,
      message: 'Demo dataset successfully reset and seeded',
      stats: {
        patients: store.patients.length,
        doctors: store.doctors.length,
        departments: store.departments.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
