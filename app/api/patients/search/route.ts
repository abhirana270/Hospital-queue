import { NextResponse } from 'next/server';
import { HospitalStore } from '@/lib/data-store';
import { callDSAEngine } from '@/lib/dsa-bridge';

// GET /api/patients/search?q=P101 or q=555-0111
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ success: false, error: 'Query parameter q is required' }, { status: 400 });
    }

    const allPatients = await HospitalStore.getPatients();

    const dsaPayload = {
      query: query.trim(),
      patients: allPatients.map((p) => ({
        patientId: p.patientId,
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        emergencyLevel: p.emergencyLevel,
        department: p.department,
        queueStatus: p.queueStatus,
        priorityScore: p.priorityScore,
      })),
    };

    const dsaRes = await callDSAEngine('hash_table', 'search', dsaPayload);

    return NextResponse.json({
      success: true,
      dsaEngine: 'C++ Hash Table (Separate Chaining with djb2)',
      complexity: 'O(1) average search',
      result: dsaRes.data,
      executionTimeMs: dsaRes.executionTimeMs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
