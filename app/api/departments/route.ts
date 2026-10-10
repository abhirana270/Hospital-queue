import { NextResponse } from 'next/server';
import { HospitalStore } from '@/lib/data-store';

export async function GET() {
  try {
    const departments = await HospitalStore.getDepartments();
    const patients = await HospitalStore.getPatients();
    const doctors = await HospitalStore.getDoctors();

    const deptsWithStats = departments.map((d) => {
      const deptPatients = patients.filter((p) => p.department.toUpperCase() === d.code.toUpperCase());
      const deptDoctors = doctors.filter((doc) => doc.department.toUpperCase() === d.code.toUpperCase());
      const waiting = deptPatients.filter((p) => p.queueStatus === 'Waiting').length;
      return {
        ...d,
        totalPatients: deptPatients.length,
        waitingPatients: waiting,
        doctorCount: deptDoctors.length,
      };
    });

    return NextResponse.json({ success: true, count: departments.length, departments: deptsWithStats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
